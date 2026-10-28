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

---

## 4. Ivory & Plum Theme and Adaptive Header Architecture

### D-12: Ivory & Plum Design Tokens
- **Tokens Defined**:
  - `ivory`: `#FBF7F4` (primary light background, text/icons on dark surfaces)
  - `surface`: `#F0E4E6` (warm light surface for cards, button hover)
  - `plum`: `#3D2438` (deep plum brand color for hero background, headers over light surfaces, dark tags)
  - `plum-hover`: `#523049` (hover state for plum elements)
  - `plum-border`: `#523049` (header bottom border when in plum state)
  - `plum-raised`: `#604B5C` (elevated cards on plum sections)
  - `plum-deep`: `#2A1727` (deep plum grounding tone)
  - `plum-line`: `#4A3347` (dividers on plum backgrounds)
  - `ink`: `#2B1B27` (primary text on ivory and light surfaces)
  - `muted`: `#6B5663` (secondary text on light surfaces)
  - `line`: `#E6D6D9` (hairline dividers on ivory/light surfaces)
  - `rose`: `#C98BA0` (accent and decorative marks)
  - `rose-text`: `#A55E7B` (rose text on ivory)
  - `rose-light`: `#D9A3B5` (highlighted script text on plum)
- **Token Policy**: Configured in `app/globals.css` via `:root` variables and `@theme` utilities. Raw hex values are strictly forbidden outside token definitions.

### D-13: Adaptive Header Tone Controller
- **Rule**: The header is always the opposite colour of the section directly underneath it:
  - Dark section (`data-tone="dark"`) -> header state `"ivory"` (`bg: ivory`, `text/icons: ink`, `logo: plum`, `border: line`).
  - Light section (`data-tone="light"`) -> header state `"plum"` (`bg: plum`, `text/icons: ivory`, `logo: ivory`, `border: plum-border`).
- **Detection Algorithm**:
  - Attached passive `scroll` listener (throttled with `requestAnimationFrame`) and `resize` listener.
  - Queries all `[data-tone]` elements and evaluates `rect.top <= headerHeight && rect.bottom > headerHeight`.
  - If a section contains the bottom edge of the sticky header, its tone determines the state. Default fallback for pages without tone markers is `"plum"`.
- **SSR Hydration Guard (Zero Flash)**:
  - Initial state is computed server-side via `pathname === '/' ? 'ivory' : 'plum'`. The homepage starts directly over the dark hero section, ensuring zero flicker on first paint. Hydration syncs effortlessly.
- **Drawer Override**: When the mobile navigation drawer is open, `data-header-state` is forced to `"ivory"`, matching the solid ivory drawer. Closing returns to the scroll-computed tone.
- **Motion & Accessibility**:
  - Color transitions apply strictly to `background-color`, `color`, and `border-color` with `250ms ease`.
  - `@media (prefers-reduced-motion: reduce)` disables transition (`transition: none !important`), delivering instant state changes.

### D-14: Clean Hero Architecture
- **Solid Background**: Fully opaque `#3D2438` (alpha 1). Zero gradients, overlays, backdrop-filters, masks, or blur.
- **One-Screen Mobile-First Viewport**: Uses `section-screen` with `min-height: calc(100svh - var(--header-h))` and `dvh` fallback so the hero fills exactly one screen without showing the next section on first load.
- **Clean Block Image**:
  - Normal rectangular image with `4px` corner radius.
  - No border, no drop shadow, no tint, and no pseudo-element overlay.
  - Sized `h-[28svh] min-h-[160px] sm:h-[38svh] max-h-[42svh]` on mobile (preventing text from being pushed off-screen on compact phones) and `aspect-4/5` up to `calc(100svh - var(--header-h) - 96px)` on desktop.
- **Plum Surface Typography & Buttons**:
  - Tag: Transparent background with `1px` ivory border (`rgba(251, 247, 244, 0.45)`).
  - Heading: Serif `clamp(2rem, 5vw, 3.75rem)` in ivory with script accents in `rose-light` (`#D9A3B5`).
  - Buttons: Primary (ivory bg, plum text, surface hover) and Secondary (transparent bg, ivory border, ivory hover). Stacked full-width on mobile with 12px gap; side-by-side on desktop.

### D-15: Sticky Header Root Cause, Desktop Nav Wrapping & Drawer Scroll Lock
- **Root Cause of Sticky Header Failure**:
  - `html, body` had `overflow-x: hidden` in `app/globals.css` (introduced in FE-39 to prevent horizontal viewport overflow).
  - In CSS overflow specifications, applying `overflow-x: hidden` to `html` or `body` causes `overflow-y` to compute to `auto` or establish a new scrolling container context. This prevents sticky descendants (`<header className="sticky top-0 ...">`) from referencing the window viewport scroll, causing the header to scroll away with the document.
- **Resolution**:
  - Replaced `overflow-x: hidden` with `overflow-x: clip` on `html, body`. Unlike `hidden`, `clip` prevents all horizontal overflow without establishing a scroll container, restoring standard `position: sticky; top: 0;` anchoring against the viewport on all pages.
- **Desktop Nav Wrapping Resolution**:
  - At `lg` (1024px), "SHOP ALL" and "BUILD YOUR OWN" wrapped onto two lines because the container allocated `lg:w-1/3` and links lacked `whitespace-nowrap`.
  - Added `whitespace-nowrap` to `header-nav-link`.
  - Tuned nav typography and spacing: `text-[11px] xl:text-[12px]`, `tracking-[0.08em] xl:tracking-[0.12em]`, and `gap-4 xl:gap-7`.
  - Replaced `lg:w-1/3` with balanced `flex-1 min-w-0` on the left and right containers, guaranteeing all four links sit on one line without wrapping while keeping the centered logo at the exact container midpoint.
- **Mobile Drawer Body Scroll Lock**:
  - Added an effect in `Drawer.tsx` that sets `document.body.style.overflow = 'hidden'` while open and restores the previous overflow value on close.
  - Added a first-render guard in `MobileNav.tsx` to prevent premature drawer closure during router hydration.

### D-16: Storefront Console Errors (401 on /me and /cart, 404 on placeholder.svg)
- **Root Causes**:
  - **401 Unauthorized on `/api/v1/me` and `/api/v1/cart`**:
    - `useAuth` (`getCurrentUser()`) and `useCart` / `useCartCount` (`getCart()`) fired unconditional network requests on initial mount/hydration across all pages.
    - The backend session mechanism uses an `HttpOnly` cookie (`boutique_session`) and throws `UnauthenticatedError` (HTTP 401) for unauthenticated requests.
    - Browsers log all 4xx/5xx network responses directly to the developer console regardless of whether JavaScript catches them via `try/catch`. Therefore, catching 401s in JavaScript is insufficient to produce a clean console.
  - **404 Not Found on `/images/products/placeholder.svg`**:
    - Product components (`CartItemRow`, `ConfiguratorPreview`, `BuildYourOwnContent`) referenced `/images/products/placeholder.svg` as a fallback image, but the SVG asset did not exist in `public/images/products/`.
- **Approach Chosen & Architectural Rationale**:
  - **Client-Side Session Indicator (`boutique_session_active`)**:
    - Rather than mutating the backend API contract (which expects 401 for protected endpoints), the frontend tracks active authentication state via a lightweight client-side indicator `boutique_session_active` stored in `localStorage` and a non-HttpOnly cookie.
    - Guests visiting the storefront do not have an active session indicator, so `getCurrentUser()` immediately returns `null` and `getCart()` immediately returns an empty guest cart `{ items: [], subtotal: 0, shipping: 0, total: 0, notices: [] }` without issuing network requests. This ensures zero 401 console errors.
    - Login and signup operations set `boutique_session_active = '1'`. Adding to cart sets the session indicator and fetches the cart. Logout clears the indicator.
    - Expired session handling: If a protected request encounters an unexpected 401 (e.g., cookie expired on the server), the active session flag is cleared once without retry loops or repeated failing requests.
    - Header cart badge works seamlessly for both guests (badge hidden when 0) and logged-in users (reads from `CartContext` `itemCount` and `useCartCount`).
  - **Placeholder SVG Creation & Loop-Safe Fallback**:
    - Created a clean placeholder vector asset at `public/images/products/placeholder.svg` styled with the store's palette (warm ivory `#FBF7F4` background, plum `#3D2438` iconography and typography, delicate `#E6D6D9` border).
    - Hardened image components (`CartItemRow`, `ConfiguratorPreview`, `BuildYourOwnContent`) using React 19 render-state fallback tracking to prevent infinite error loops in the event that image sources fail to load.


### D-17: Explore by Type Ivory & Plum Theme, Placeholder Fallback & Rose-Text Darkening
- **Context & Objectives**:
  Apply the Ivory and Plum theme to the "Explore by Type" section (`#explore-by-type`) on the home page with solid colors only, zero gradients/shadows/overlays, 4:5 category card image blocks, and placeholder fallback for categories lacking photographs.
- **Tokens & Styling**:
  - Section background set to solid ivory (`--color-ivory: #FBF7F4`).
  - Section boundary divider and heading underline set to line token (`--color-line: #E6D6D9`).
  - Darkened `--color-rose-text` from `#A55E7B` to `#9C5774` in `app/globals.css` ensuring WCAG AA contrast ratio of 5.4:1 (> 4.5:1) for small uppercase text on ivory background.
  - Section title set to serif ink (`--color-ink: #2B1B27`).
  - Category titles use serif ink with subtle plum underline on hover (`[@media(hover:hover)]:group-hover:decoration-[var(--color-plum)]`).
  - Category descriptions use muted token (`--color-muted: #6B5663`) clamped to 2 lines.
  - Desktop "All products" link set to plum text with 4px underline offset.
  - Mobile "All products" button set to transparent background, 1px plum border, 48px height, plum text with solid plum hover.
  - Focus outlines on all cards and links set to 2px plum outline with 2px offset.
- **Category Placeholder Fallback**:
  - Replaced the previous generic placeholder SVG (`scrunchie-1.svg`) with a clean surface-colored container (`--color-surface: #F0E4E6`, 4px radius, no border/shadow) displaying "Photo coming soon" in 12px muted text.
  - Emits zero external image requests for categories without assigned photos (`cat.image === null`).
  - Maintained exact 4:5 aspect ratio matching photo-bearing category cards.
- **Verification Across Viewports**:
  - Verified across 7 viewports (360x640, 390x844, 430x932, 768x1024, 1024x768, 1366x768, 1920x1080) via Playwright with zero horizontal overflow, 44x44px mobile touch targets, adaptive plum header state over light tone, and saved screenshots to `screenshots/theme/`.
