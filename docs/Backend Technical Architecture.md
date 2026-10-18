# Backend Technical Architecture

Prepared by Member A (Frontend) for Member B (Backend). Everything in the tech stack section is a proposal for Member B to confirm or replace. The conventions after it matter more than the tool names, because the frontend depends on them.

## Scope

Backend only. The database schema is Member C's document. This document defines how the backend is built, organised and configured, and how it talks to the database, the payment gateway and email.

## Proposed tech stack

| Area | Proposal | Why |
| --- | --- | --- |
| Runtime and language | Node.js (current LTS) with TypeScript | The frontend is TypeScript, so request and response types can be shared |
| Web framework | Express or Fastify (Member B's choice) | Mature, simple REST |
| Validation | Zod | One schema validates input and generates types |
| Password hashing | argon2id (or bcrypt if argon2 is a problem on the host) | Current standard |
| Sessions | Server-side session in an httpOnly cookie, or short-lived JWT plus refresh token | Member B to choose, see the Security document |
| Payments | Gateway SDK behind a payment adapter | The gateway is not chosen yet |
| Email | Transactional email provider behind an email adapter | Provider not chosen yet |
| Logging | pino (structured JSON) | Easy to search in production |
| Testing | Vitest or Jest, plus Supertest for API tests | Fast, common |
| API documentation | OpenAPI file kept in the repository | The frontend and the tests both read it |
| Hosting | To be decided | Needs HTTPS and a public webhook URL |

If Member B prefers another language or framework, keep the conventions below and replace the rest.

## Layers

Requests pass through four layers. Each layer talks only to the one below it.

1. **Routes:** URL, method, auth check, input validation.
2. **Controllers:** read the request, call a service, shape the response.
3. **Services:** all business rules (pricing, cart rules, checkout, payment status).
4. **Repositories:** the only code that touches the database. Member C and Member B agree on the repository interface. Services never write queries.

Side integrations sit next to the services as adapters: payment adapter, email adapter. Business code calls the adapter interface, never the vendor SDK directly. This lets us choose or change the gateway without rewriting checkout.

## Proposed folder structure

```text
backend/
  src/
    app.ts                 app setup, middleware
    server.ts              starts the server
    config/                env loading and validation
    routes/                one file per area (auth, products, cart, ...)
    controllers/
    services/              pricing, cart, checkout, orders, payments
    repositories/          data access (interface agreed with Member C)
    adapters/
      payment/             gateway adapter and a fake adapter for tests
      email/
    middleware/            auth, validation, rate limit, error handler, request id
    schemas/               Zod schemas for every request and response
    errors/                error classes and codes
    utils/
  tests/
    unit/
    api/
  openapi/                 openapi.yaml
  scripts/                 product import and seed scripts
  docs/
  .env.example
```

## API conventions

The frontend is built against these. Please keep them or tell Member A what changes.

- **Base path:** `/api/v1`
- **Format:** JSON, UTF-8
- **IDs:** strings
- **Timestamps:** ISO 8601 in UTC
- **Money:** proposed as whole numbers in paise with a `currency` of `INR`. The frontend currently treats amounts as plain numbers, so this needs a decision before integration.
- **Paging:** `{ items, total, page, pageSize, totalPages }`
- **Error format:** every error uses one envelope.

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Readable message safe to show to a customer",
    "details": [{ "field": "pincode", "message": "Enter a 6 digit PIN code" }],
    "requestId": "abc123"
  }
}
```

- **Request ID:** every response carries an `X-Request-Id` header, and it appears in logs.
- **Idempotency:** `POST /checkout` accepts an `Idempotency-Key` header so a double click or a retry returns the same order.
- **CORS:** only the storefront origin from configuration is allowed.

## Environment variables

The backend must refuse to start if a required variable is missing. Secrets are never committed. Keep a `.env.example` with every name and no values.

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | development, test or production |
| `PORT` | Server port |
| `APP_BASE_URL` | Public URL of the API, used for webhooks and links |
| `FRONTEND_ORIGIN` | Allowed CORS origin and base for email links |
| `DATABASE_URL` | Connection string supplied by Member C |
| `SESSION_SECRET` or `JWT_SECRET` | Signs sessions or tokens |
| `PAYMENT_GATEWAY` | Which adapter to load |
| `PAYMENT_KEY_ID` | Gateway public key |
| `PAYMENT_KEY_SECRET` | Gateway secret key |
| `PAYMENT_WEBHOOK_SECRET` | Verifies webhook signatures |
| `EMAIL_API_KEY` | Email provider key |
| `EMAIL_FROM` | Sender address |
| `LOG_LEVEL` | Logging detail |

Never hardcode keys, prices, shipping rules or tax rates. Shipping and tax rules live in configuration or the database so the client can change them.

## Core design rules

1. The backend recalculates every price. It never trusts a price sent by the client.
2. Payment status changes only from a verified gateway webhook or a direct status check with the gateway.
3. Webhook handling is idempotent. The same event twice has the same result as once.
4. Order totals are stored on the order at checkout and never recalculated afterwards.
5. Every endpoint validates input with a schema and returns the standard error format.

## Testing

- Unit tests for pricing, option validation, cart rules and status transitions.
- API tests for every endpoint, including error cases.
- Payment tests use the fake payment adapter. They cover paid, pending, failed, cancelled, duplicate webhook and bad signature.
- Contract tests check responses against the OpenAPI file so the frontend types stay in sync.

## Deployment notes

- HTTPS only, with a public URL for the payment webhook.
- Separate test and production environments with separate gateway keys.
- A health check endpoint at `/health` that does not need login.
- Logs must never contain passwords, tokens, card details or full gateway secrets.
