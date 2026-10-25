# Architecture Decisions & Specification Resolutions (docs/DECISIONS.md)

This document records the architectural decisions, specification resolutions, and conventions established for the backend of the Handmade Fabric Accessories Store.

---

## 1. Architectural Decisions

### D-01: Money Representation
- **Decision**: All monetary amounts are represented as positive whole integers in **paise** (1 INR = 100 paise), with `currency: "INR"`.
- **Rationale**: Prevents floating-point rounding errors across database storage, price quotes, cart summaries, and payment gateway interactions.
- **Database**: Columns (`base_price`, `price_delta`, `unit_price`, `subtotal`, `shipping`, `tax`, `total`, `amount`) are PostgreSQL integer/bigint types, never float/numeric.

### D-02: Payment Gateway Abstraction
- **Decision**: Payments are isolated behind a `PaymentAdapter` interface (`createPaymentSession`, `verifyWebhook`, `fetchPaymentStatus`).
- **Implementations**:
  - `RazorpayPaymentAdapter`: Production & test mode integration with Razorpay Orders and Webhooks.
  - `FakePaymentAdapter`: Deterministic in-memory/test adapter used for automated tests and local development without credentials.
- **Selection**: Determined at runtime by the `PAYMENT_GATEWAY` environment variable (`razorpay` | `fake`).
- **Isolation**: Business services never import or depend directly on third-party payment SDKs.

### D-03: Shipping and Tax
- **Decision**: Read from system configuration / database with a default of 0 paise (free shipping, tax included or zero).
- **Rationale**: Ensures the API supports non-zero shipping rates and taxes in the future without schema or breaking API changes. Totals are calculated as `total = subtotal + shipping + tax`.

### D-04: Order Lifecycle and Cancellation Rules
- **Decision**: Order statuses are strictly transitioned through:
  `placed` -> `confirmed` -> `in_production` -> `packed` -> `dispatched` -> `delivered`.
- **Cancellation**: Customers or staff can cancel an order (`status: "cancelled"`) ONLY while `status` is `placed` or `confirmed` (prior to `in_production`). Once production begins, cancellation is prohibited through the customer API.
- **Payment Statuses**: `pending`, `paid`, `failed`, `cancelled`.
- **Integrity**: An order cannot transition beyond `placed` unless `paymentStatus` is `paid`.

### D-05: Server-Side Session Authentication
- **Decision**: Server-side sessions stored in Postgres.
- **Security**:
  - The plaintext session ID is sent to the client in an `httpOnly`, `Secure`, `SameSite` cookie (`boutique_session`).
  - Only the SHA-256 hash of the session ID is stored in the database (`session_id_hash`).
  - Session cookie parameters are configurable via environment variables (`COOKIE_SAME_SITE`, `COOKIE_SECURE`, `COOKIE_DOMAIN`) to seamlessly support both same-site deployments and decoupled cross-site domains (`SameSite=None; Secure`).
  - Strict Origin check and anti-CSRF measures protect all state-changing endpoints (`POST`, `PATCH`, `DELETE`, `PUT`).

### D-06: Fabric Filtering (CG-03)
- **Decision**: In `GET /api/v1/products?fabric=<name_or_id>`, filtering locates products that have an option group categorized as fabric (by group ID `fabric` or group type `swatch`/name) containing an option whose `id` or `label` matches the parameter (case-insensitive partial/exact match).

### D-07: Address at Checkout (CG-08)
- **Decision**: Checkout accepts `{ addressId: string }`.
- **Workflow**: The customer selects or saves an address via `POST /api/v1/addresses` first, then provides `addressId` to `POST /api/v1/checkout`. The order permanently stores an immutable JSON snapshot of the full delivery address at checkout time.

### D-08: Team Product Entry & Internal Tools
- **Decision**: Provide two robust, staff-guarded mechanisms:
  1. Validated CLI Import & Seed Script: `scripts/import-products` (and `npm run db:seed`) to ingest validated JSON catalogues.
  2. Staff-Protected API Endpoints: Protected by a high-entropy `STAFF_API_KEY` header (`X-Staff-Api-Key`) or verified staff role, completely uncallable by regular customer logins.

---

## 2. Specification Conflict Resolutions

| Conflict / Ambiguity | Documents | Resolution Chosen |
|---|---|---|
| **Health Check Path** | Ticket BE-01: `/api/v1/health`<br>Architecture doc: `/health` | **Serve both**: Register `/api/v1/health` and `/health` to return identical 200 OK uptime diagnostics. |
| **Auth Register vs Signup** | API Spec: `POST /auth/register`<br>Frontend code: `POST /auth/signup` | **Serve both**: Register `POST /api/v1/auth/register` as primary, and alias `POST /api/v1/auth/signup` to the same handler. |
| **Current User Path** | API Spec: `GET /auth/me`<br>Frontend code: `GET /me` | **Serve both**: Register `GET /api/v1/auth/me` as primary, and alias `GET /api/v1/me`. |
| **Product Detail Route** | API Spec: `GET /products/{slug}` & `GET /products/{id}` | **Unified Resolution**: The endpoint accepts either a slug or ID parameter, looks up by ID first, and falls back to slug. |
| **Address Field Naming** | API Spec: `fullName`, `pincode`<br>Frontend types: `recipientName`, `pinCode` | **Bi-directional Support**: Request schemas accept either field name using Zod pre-processing/aliases, and response objects include both canonical and alias fields. |
| **Quote Response Shape** | API Spec: `{ valid, unitPrice, total, currency, problems }`<br>Frontend types: `{ valid, lines, total, problems }` | **Unified Response**: Quote returns `{ valid, unitPrice, lines, total, currency: "INR", problems }` satisfying all consumers. |

---

## 3. Responsive Layout & Mobile-First Architecture Decisions

### D-09: Section-Screen Utility & Viewport Height Conventions
- **Decision**: Created reusable `.section-screen` CSS utility in `app/globals.css`:
  - `min-height: calc(100dvh - var(--header-h));`
  - `min-height: calc(100svh - var(--header-h));`
  - `display: flex; flex-direction: column; justify-content: center;`
  - `padding-top: clamp(1.5rem, 4vh, 3.5rem);`
  - `padding-bottom: clamp(1.5rem, 4vh, 3.5rem);`
  - `scroll-margin-top: var(--header-h);`
- **Application**: Applied to Hero, Explore by Type, Featured Pieces, and Ratings & Reviews. The Footer does NOT use `section-screen`.
- **Rationale**: Guarantees each section feels like its own focused "screen" on mobile viewports (~390px) and scales gracefully on tablet/desktop, while using `min-height` rather than fixed height so content expands naturally without overflow truncation.

### D-10: Breakpoints and Container System
- **Breakpoints**: Pure mobile-first min-width queries (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`). Zero `max-width` media queries in application CSS.
- **Header Height Variable**: `--header-h` defined as `64px` on mobile (< 1024px) and `80px` on desktop (>= 1024px).
- **Shared Container**: `.container-custom` utility defined with max-width 1200px, centered with horizontal padding `16px` on mobile, `24px` on tablet (`sm:`), and `32px` on desktop (`lg:`).

### D-11: Mobile Interaction & Navigation Choices
- **Header**: Mobile layout uses slim bar with hamburger drawer button on the left, centered logo, search and cart icons on the right. "Log in" link collapses into drawer menu on mobile. Drawer opens full-width with links >= 48px tall, closing on link tap, Escape key, or route transition with full ARIA accessibility (`aria-expanded`, `aria-controls`).
- **Explore by Type (2x2 Grid)**: Mobile uses a 2x2 grid with equal 4:5 aspect ratio cards, title + description clamped to 2 lines, and a full-width outline button below grid. Desktop expands to 4 columns in a single row.
- **Featured Pieces Grid**: Scales from 2 columns on mobile, to 3 on tablet, and 4 on desktop. Titles clamped to 2 lines with price on its own line and full-width CTA on mobile.
- **Ratings & Reviews (Mobile Swipeable Row)**: Replaced continuous auto-moving marquee on mobile with a manual swipeable row (`85vw` card width, row-level snap alignment). Speed and Flow controls hidden on mobile; pause/play and manual navigation available. Desktop preserves continuous marquee and all speed/flow controls.
- **Touch Targets & Form Sizing**: All tappable elements (buttons, links, drawer items, pills) enforced at `>= 44x44px`. All text inputs and textareas use at least `16px` font size to prevent iOS Safari auto-zooming on focus.

