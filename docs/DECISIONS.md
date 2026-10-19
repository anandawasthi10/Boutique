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
