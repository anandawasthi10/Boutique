# Backend Feature Ticket List

Prepared by Member A (Frontend) for Member B (Backend). Each ticket is small enough to be one task or one AI coding prompt. Build in ticket order, since dependencies point backwards. Endpoint shapes are in the Backend API Specification. Security rules are in the Backend Security and Access document.

Priority labels: **Must** is needed for launch. **Should** is wanted for launch. **Nice** can wait.

## Foundation

### BE-01: Project setup

- **Priority:** Must
- **Depends on:** none
- **Description:** Create the backend project with TypeScript, the chosen framework, the folder structure from the architecture document, lint, formatting and a test runner. Add the `/api/v1` base path.
- **Done when:**
  - The server starts and `GET /api/v1/health` returns 200.
  - Lint, typecheck and a sample test pass with one command each.

### BE-02: Configuration and environment validation

- **Priority:** Must
- **Depends on:** BE-01
- **Description:** Load environment variables, validate them with a schema and add `.env.example`.
- **Done when:**
  - The server refuses to start if a required variable is missing, and says which one.
  - No secret appears in the repository.

### BE-03: Error handling, validation and request IDs

- **Priority:** Must
- **Depends on:** BE-01
- **Description:** Add the standard error format, an error handler, a request ID on every response and a validation middleware using Zod.
- **Done when:**
  - Invalid input returns 400 `VALIDATION_FAILED` with field messages.
  - Unknown errors return 500 `INTERNAL_ERROR` with no stack trace.
  - Every response has `X-Request-Id`, and logs include it.

### BE-04: Logging, CORS and security headers

- **Priority:** Must
- **Depends on:** BE-01
- **Description:** Structured logging, CORS limited to the storefront origin and standard security headers.
- **Done when:**
  - Requests from other origins are blocked.
  - Logs contain no passwords, tokens or secrets.

## Authentication

### BE-05: Register and login

- **Priority:** Must
- **Depends on:** BE-02, BE-03
- **Description:** `POST /auth/register` and `POST /auth/login` with password hashing and a session.
- **Done when:**
  - A new user can register and then log in.
  - A wrong password returns one generic `INVALID_CREDENTIALS` error.
  - A duplicate email does not reveal that the account exists.
  - Passwords are never stored or logged in plain text.

### BE-06: Session, logout and current user

- **Priority:** Must
- **Depends on:** BE-05
- **Description:** Auth middleware, `POST /auth/logout` and `GET /auth/me`.
- **Done when:**
  - Protected routes return 401 without a valid session.
  - Logout ends the session on the server.
  - Cookies are `HttpOnly`, `Secure` and `SameSite`.

### BE-07: Forgot and reset password

- **Priority:** Must
- **Depends on:** BE-05, BE-22
- **Description:** `POST /auth/forgot-password` and `POST /auth/reset-password` with single-use, expiring tokens.
- **Done when:**
  - Forgot password always returns success.
  - A reset link works once and expires.
  - Only a hash of the token is stored.
  - Resetting ends other sessions.

## Catalogue

### BE-08: Categories

- **Priority:** Must
- **Depends on:** BE-03
- **Description:** `GET /categories` with `id`, `name`, `slug`, `description`, `image` and `sortOrder`, sorted by `sortOrder`.
- **Done when:**
  - The response matches the API specification.
  - Unpublished categories are not returned.

### BE-09: Product list

- **Priority:** Must
- **Depends on:** BE-08
- **Description:** `GET /products` with category, search, fabric, price range, sort and paging.
- **Done when:**
  - Each filter works alone and combined.
  - The response uses the paging envelope.
  - Only published products appear.
  - Invalid query values return 400.

### BE-10: Product detail

- **Priority:** Must
- **Depends on:** BE-09
- **Description:** `GET /products/{slug}` and `GET /products/{id}` returning option groups and options.
- **Done when:**
  - Both routes return the same product.
  - An unknown or unpublished product returns 404.

### BE-11: Quote endpoint

- **Priority:** Must
- **Depends on:** BE-10
- **Description:** `POST /products/{id}/quote` validates the selections and calculates the price. Required groups, option ownership and invalid combinations are all checked.
- **Done when:**
  - A valid configuration returns the correct price.
  - Each invalid case returns `valid: false` with problems that name the group or option.
  - The client price is never trusted.
  - Unit tests cover pricing and every validation rule.

## Cart and addresses

### BE-12: Cart read and add

- **Priority:** Must
- **Depends on:** BE-06, BE-11
- **Description:** `GET /cart` and `POST /cart/items`. Adding re-validates the configuration. The cart read re-checks prices and availability and sets each item's status.
- **Done when:**
  - A user sees only their own cart.
  - Invalid configurations are rejected with `INVALID_CONFIGURATION`.
  - An item whose price changed shows `price_changed`, and an unavailable one shows `unavailable`.

### BE-13: Cart edit and remove

- **Priority:** Must
- **Depends on:** BE-12
- **Description:** `PATCH /cart/items/{itemId}` and `DELETE /cart/items/{itemId}`.
- **Done when:**
  - Quantity limits are enforced.
  - A configuration change is re-validated and re-priced.
  - Another user's item returns 404.

### BE-14: Addresses

- **Priority:** Must
- **Depends on:** BE-06
- **Description:** List, create, edit and delete addresses with Indian validation.
- **Done when:**
  - A PIN code that is not 6 digits is rejected.
  - A mobile number that is not a valid 10 digit number is rejected.
  - A user can only reach their own addresses.
  - There is at most one default address.

## Orders and payments

### BE-15: Checkout

- **Priority:** Must
- **Depends on:** BE-13, BE-14
- **Description:** `POST /checkout` as described in the API specification, including re-pricing, totals, order creation and the idempotency key.
- **Done when:**
  - An empty cart is rejected.
  - A changed or unavailable item returns `CART_CHANGED` and creates no order.
  - The order is created with payment status `pending` and order status `placed`.
  - The same idempotency key returns the same order.
  - Shipping and tax come from configuration and are zero by default.

### BE-16: Payment adapter

- **Priority:** Must
- **Depends on:** BE-15, decision D-02
- **Description:** Define the payment adapter interface, build a fake adapter for tests, then build the real adapter for the chosen gateway. Return `paymentInfo` from checkout.
- **Done when:**
  - Checkout returns the payment information the frontend needs.
  - Business code never calls the gateway SDK directly.
  - The gateway can be switched by configuration.

### BE-17: Payment webhook and status

- **Priority:** Must
- **Depends on:** BE-16
- **Description:** `POST /payments/webhook` verifies the signature, checks amount and currency and updates payment and order status.
- **Done when:**
  - A bad signature is rejected.
  - A paid event sets payment status `paid` and order status `confirmed`.
  - Failed and cancelled events are recorded.
  - A repeated event changes nothing.
  - A mismatched amount is not marked paid and is logged.
  - Tests cover paid, pending, failed, cancelled, duplicate and out-of-order events.

### BE-18: Orders list and detail

- **Priority:** Must
- **Depends on:** BE-17
- **Description:** `GET /orders` (paged, newest first) and `GET /orders/{id}`.
- **Done when:**
  - A user sees only their own orders.
  - Detail includes items, address, totals, status and payment status.
  - The response reflects webhook updates immediately.

## Internal tools

### BE-19: Product entry for the team

- **Priority:** Must
- **Depends on:** BE-10, decision D-08
- **Description:** A safe way for the team to add and update products, categories, option groups and options without an admin dashboard. Proposed: an import script that reads a validated file, or protected staff-only routes.
- **Done when:**
  - The team can add a product with fabrics, sizes and add-ons.
  - Invalid data is rejected with a clear message.
  - It cannot be reached with a normal customer login.

### BE-20: Order status updates

- **Priority:** Should
- **Depends on:** BE-18, decision D-04
- **Description:** Staff-only way to move an order through `in_production`, `packed`, `dispatched`, `delivered` and `cancelled`.
- **Done when:**
  - Only allowed transitions work.
  - An order cannot move forward while payment is not `paid`.
  - Each change is logged with who made it and when.

### BE-21: Contact form

- **Priority:** Should
- **Depends on:** BE-03
- **Description:** `POST /contact` that stores or emails the message.
- **Done when:**
  - Required fields are validated.
  - The route is rate limited.
  - Free text is cleaned.

### BE-22: Transactional email

- **Priority:** Must for password reset, Should for order emails
- **Depends on:** BE-02
- **Description:** An email adapter with a fake version for tests. Send the password reset link, then order confirmation and dispatch notices.
- **Done when:**
  - Reset emails link to the storefront URL from configuration.
  - Email failures are logged and never break checkout.

## Hardening and release

### BE-23: Rate limiting

- **Priority:** Must
- **Depends on:** BE-05
- **Description:** Limits on login, register, forgot password, contact and checkout.
- **Done when:**
  - Excess requests return 429 `RATE_LIMITED`.
  - Normal use is not affected.

### BE-24: OpenAPI file and contract tests

- **Priority:** Must
- **Depends on:** BE-18
- **Description:** Write `openapi.yaml` for every endpoint and add tests that check real responses against it. Share it with Member A.
- **Done when:**
  - Every endpoint is in the file.
  - A test fails if a response drifts from the file.

### BE-25: Security review and deployment

- **Priority:** Must
- **Depends on:** BE-24
- **Description:** Run the pre-launch checklist from the Security document, set up the hosting environment with HTTPS and a public webhook URL, and deploy test and production environments with separate keys.
- **Done when:**
  - Ownership tests pass.
  - A dependency audit shows no serious production issues.
  - A full test purchase works end to end in the test environment.

### BE-26: Merge guest cart on login

- **Priority:** Nice
- **Depends on:** BE-12
- **Description:** Keep items added before login when the user logs in.
- **Done when:** Items from a guest session appear in the user's cart after login, without duplicates.

## Build order summary

1. Foundation: BE-01 to BE-04
2. Authentication: BE-05 to BE-07, with BE-22 for email
3. Catalogue and quote: BE-08 to BE-11
4. Cart and addresses: BE-12 to BE-14
5. Checkout and payments: BE-15 to BE-18
6. Internal tools and extras: BE-19 to BE-22
7. Hardening and release: BE-23 to BE-25
