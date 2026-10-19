# Backend Security and Access

Prepared by Member A (Frontend) for Member B (Backend). This is a proposal. Member B owns the final choices.

## Scope

Backend only. It covers who can do what through the API, how requests are checked, and what happens when something goes wrong. Database-level protections are Member C's part. The backend still enforces ownership itself, so it does not depend on the database alone.

## Authentication

Proposed method: email and password.

- Passwords are hashed with argon2id or bcrypt. Plain passwords are never stored or logged.
- Minimum password length of 8 characters. Reject the most common passwords.
- Login: after success, issue a session. Proposed: a server-side session in a cookie marked `HttpOnly`, `Secure` and `SameSite=Lax`. If Member B prefers JWT, use a short-lived access token with a refresh token, and keep tokens out of local storage.
- Logout ends the session on the server.
- Forgot password: send a single-use reset link that expires. Proposed expiry is 30 minutes. Store only a hash of the reset token. After a reset, end all other sessions for that user.
- Responses for login failure, unknown email on forgot-password and duplicate registration must not reveal whether an account exists. Use generic wording.
- Limit login and reset attempts per account and per IP address.

Google login or OTP can be added later. They are not in release 1.

## Roles and permissions

| Role | Who | Can do |
| --- | --- | --- |
| Guest | Not logged in | Read categories and products, request a quote, send a contact message, register, log in, reset password |
| Customer | Logged in | Everything a guest can, plus manage their own cart, addresses and orders, check out, view their own order status |
| Staff | Internal team | Add and update products, update order statuses, read contact messages. Access is by a protected internal route or script, since there is no admin dashboard in release 1 |
| System | Payment gateway | Send payment webhooks. Verified by signature only, never by login |

What each role cannot do:

- Guests cannot add to a server cart, save addresses or check out.
- Customers cannot read or change another customer's cart, addresses or orders.
- Customers cannot change product data, prices or any order status.
- Staff access must not be reachable with a normal customer login.

## Ownership rules

The backend enforces these on every request, regardless of database rules.

1. Every cart, address and order query is filtered by the logged-in user's ID taken from the session, never from the request body or URL.
2. If a customer asks for a resource that belongs to someone else, return `404 Not Found`, not `403`. This avoids confirming that the ID exists.
3. The `userId` field is never accepted from the client on create or update.

## Payment security

1. The gateway secret key and webhook secret live only in environment variables on the server.
2. Verify the signature of every webhook before reading it. Reject and log anything that fails.
3. Mark an order paid only after a verified webhook, or after the backend itself asks the gateway for the payment status. A redirect or a message from the browser is never proof.
4. Check that the paid amount and currency match the order total before marking it paid.
5. Webhook handling is idempotent. A repeated event changes nothing.
6. Card details never touch our servers. The gateway's own screen collects them.
7. Use an idempotency key on checkout so a retry cannot create a second order.

## Input and request protection

- Validate every request body, query string and path parameter with a schema. Reject unknown fields.
- Set sensible size limits on request bodies.
- Use parameterised queries through the repository layer. No string-built queries.
- Protect cookie-based sessions from cross-site requests with `SameSite` plus a CSRF token or an origin check on write requests.
- Allow CORS only from the storefront origin.
- Send standard security headers (HSTS, `X-Content-Type-Options`, `Referrer-Policy`).
- Rate limit sensitive routes: login, register, forgot password, contact, checkout.
- Strip HTML from free text fields such as the contact message and address lines, or escape it on output.
- Logs exclude passwords, tokens, reset links and gateway secrets.

## Error handling guide

Every error uses the standard error format from the architecture document.

| Situation | HTTP status | Code | What the customer sees |
| --- | --- | --- | --- |
| Invalid or missing input | 400 | `VALIDATION_FAILED` | Field-level messages |
| Not logged in | 401 | `UNAUTHENTICATED` | Prompt to log in |
| Wrong email or password | 401 | `INVALID_CREDENTIALS` | One generic message |
| Logged in but not allowed | 403 | `FORBIDDEN` | Not allowed message |
| Resource missing or not theirs | 404 | `NOT_FOUND` | Not found page |
| Email already registered | 409 | `CONFLICT` | Generic message that does not confirm the account |
| Invalid option combination | 422 | `INVALID_CONFIGURATION` | Which group or option is the problem |
| Item unavailable or price changed at checkout | 409 | `CART_CHANGED` | Cart review with the affected items |
| Too many requests | 429 | `RATE_LIMITED` | Try again later |
| Payment gateway unreachable | 502 | `PAYMENT_UNAVAILABLE` | Friendly retry message, cart kept |
| Anything unexpected | 500 | `INTERNAL_ERROR` | Generic message plus request ID |

Rules:

- Never return stack traces, SQL errors or internal names to the client.
- Log the full error with the request ID on the server.
- If the database or gateway is down, fail with a clear error. Never guess or return partial data.

## Edge cases to handle before launch

- Empty or whitespace-only form fields and oversized text.
- Quantity of zero, negative or very large.
- Option ID that belongs to a different product or group.
- Required option group left unselected.
- Product unpublished or an option out of stock while it sits in a cart.
- Price changed between adding to cart and checkout.
- Checkout with an empty cart.
- Checkout double click or network retry (idempotency).
- Customer pays, but the browser closes before returning to the site. The webhook must still finish the order.
- Webhook arrives before the customer returns, or arrives twice, or arrives late.
- Payment fails, then the customer retries on the same order.
- Customer abandons the payment screen. The order stays pending and can expire.
- Webhook for an unknown order, or with an amount that does not match.
- Expired or already used reset link.
- Two logins on different devices, then a password reset.
- Invalid Indian PIN code (not 6 digits) or phone number.
- Slow or dropped connections: every write endpoint is safe to retry or clearly reports what happened.

## Pre-launch checklist

- All secrets are in environment variables, none in the repository.
- Test gateway keys are replaced with live keys only in production.
- Webhook signature check tested with a bad signature.
- Ownership tests pass: user A cannot read user B's data.
- Rate limits are on.
- Security headers are on.
- Dependency audit shows no serious production vulnerabilities.
