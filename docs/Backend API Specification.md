# Backend API Specification

Prepared by Member A (Frontend) for Member B (Backend). This replaces the frontend specification from the reference list, because this project's backend needs an API and integration spec rather than a design system. Shapes below are proposals built from what the frontend expects. Member B can amend any of them, and Member A will adapt the frontend.

## Conventions

- Base path `/api/v1`. JSON only. IDs are strings. Timestamps are ISO 8601 in UTC.
- Money is proposed as whole numbers in paise, with `currency: "INR"`. Decision D-01 below.
- Errors use the standard envelope from the Technical Architecture document.
- Paging uses `{ items, total, page, pageSize, totalPages }`.
- Auth column: **Public** needs no login. **Customer** needs a logged-in user. **Staff** needs staff access.

## Endpoint list

| Area | Method and path | Auth | Purpose |
| --- | --- | --- | --- |
| Auth | `POST /auth/register` | Public | Create an account |
| Auth | `POST /auth/login` | Public | Log in |
| Auth | `POST /auth/logout` | Customer | Log out |
| Auth | `GET /auth/me` | Customer | Current user |
| Auth | `POST /auth/forgot-password` | Public | Send reset link |
| Auth | `POST /auth/reset-password` | Public | Set a new password |
| Catalogue | `GET /categories` | Public | List categories |
| Catalogue | `GET /products` | Public | List and filter products |
| Catalogue | `GET /products/{slug}` | Public | Product detail with option groups |
| Catalogue | `GET /products/{id}` | Public | Same detail by ID (see CG-01) |
| Configurator | `POST /products/{id}/quote` | Public | Validate a configuration and price it |
| Cart | `GET /cart` | Customer | Read the cart |
| Cart | `POST /cart/items` | Customer | Add a configured item |
| Cart | `PATCH /cart/items/{itemId}` | Customer | Change quantity or configuration |
| Cart | `DELETE /cart/items/{itemId}` | Customer | Remove an item |
| Addresses | `GET /addresses` | Customer | List saved addresses |
| Addresses | `POST /addresses` | Customer | Save an address |
| Addresses | `PATCH /addresses/{id}` | Customer | Edit an address |
| Addresses | `DELETE /addresses/{id}` | Customer | Remove an address |
| Checkout | `POST /checkout` | Customer | Create the order and start payment |
| Orders | `GET /orders` | Customer | List the user's orders |
| Orders | `GET /orders/{id}` | Customer | Order detail and status |
| Payments | `POST /payments/webhook` | System | Gateway notifications |
| Contact | `POST /contact` | Public | Send a contact message |
| Health | `GET /health` | Public | Uptime check |

The cart, address and contact paths are proposed by the frontend. The rest come from the original frontend specification.

## Auth

**Register** request: `{ name, email, password }`. Response: the user, plus a session. Errors: `VALIDATION_FAILED`, `CONFLICT` (generic wording).

**Login** request: `{ email, password }`. Response: the user, plus a session. Error: `INVALID_CREDENTIALS`.

**User** shape: `{ id, name, email }`.

**Forgot password** request: `{ email }`. Always returns success, whether or not the email exists.

**Reset password** request: `{ token, newPassword }`. Errors: `VALIDATION_FAILED`, or a generic invalid-or-expired-link error.

## Catalogue

**`GET /categories`** returns a list of:

```json
{
  "id": "cat_1",
  "name": "Scrunchies",
  "slug": "scrunchies",
  "description": "optional",
  "image": "optional URL",
  "sortOrder": 1
}
```

**`GET /products`** query parameters, all optional: `category`, `search`, `fabric`, `minPrice`, `maxPrice`, `sort`, `page`, `pageSize`. Only published products are returned. Open question CG-03: how `fabric` maps to product data.

**Product** shape:

```json
{
  "id": "prod_1",
  "slug": "corduroy-scrunchie",
  "name": "Corduroy Scrunchie",
  "description": "...",
  "category": { "id": "cat_1", "name": "Scrunchies" },
  "images": ["url"],
  "basePrice": 19900,
  "currency": "INR",
  "optionGroups": [
    {
      "id": "fabric",
      "name": "Fabric",
      "type": "swatch",
      "required": true,
      "options": [
        {
          "id": "fab_mocha_cord",
          "label": "Mocha corduroy",
          "priceDelta": 0,
          "swatchImageUrl": "url",
          "colourValue": "#8b6b55",
          "available": true
        }
      ]
    }
  ]
}
```

The list endpoint can return a lighter version of the same shape without `optionGroups`. Member A will send the exact frontend type files so the field names match.

## Quote (Build Your Own)

`POST /products/{id}/quote`

Request:

```json
{
  "selections": [{ "groupId": "fabric", "optionId": "fab_mocha_cord" }],
  "quantity": 1
}
```

Response when valid:

```json
{
  "valid": true,
  "unitPrice": 24900,
  "total": 24900,
  "currency": "INR",
  "problems": []
}
```

Response when invalid: `valid: false` with `problems: [{ groupId, optionId?, message }]`. The message is safe to show to customers. The endpoint returns `200` for both cases. It uses `404` only when the product does not exist. The backend decides which combinations are valid and what each option costs.

## Cart

**Cart item** shape:

```json
{
  "id": "item_1",
  "productId": "prod_1",
  "productSlug": "corduroy-scrunchie",
  "productName": "Corduroy Scrunchie",
  "image": "url",
  "selectedOptions": [
    {
      "groupId": "fabric",
      "groupName": "Fabric",
      "optionId": "fab_mocha_cord",
      "label": "Mocha corduroy",
      "swatchImageUrl": "url",
      "colourValue": "#8b6b55"
    }
  ],
  "quantity": 1,
  "unitPrice": 24900,
  "lineTotal": 24900,
  "status": "available"
}
```

`status` is `available`, `price_changed` or `unavailable`. `GET /cart` re-checks every item against current products and prices, and sets the status. The cart response also carries `subtotal` and `currency`.

`POST /cart/items` request: `{ productId, selections, quantity }`. The backend validates the configuration as the quote does and rejects an invalid one with `INVALID_CONFIGURATION`.

`PATCH /cart/items/{itemId}` request: `{ quantity?, selections? }`.

## Addresses

Address shape:

```json
{
  "id": "addr_1",
  "fullName": "...",
  "phone": "10 digit mobile number",
  "line1": "...",
  "line2": "optional",
  "landmark": "optional",
  "city": "...",
  "state": "...",
  "pincode": "6 digits",
  "isDefault": false
}
```

Validation: 6 digit PIN code, 10 digit Indian mobile number, state from the list of Indian states.

## Checkout

`POST /checkout` with header `Idempotency-Key`.

Request: `{ "addressId": "addr_1" }`. The frontend saves the address first with `POST /addresses`. Open question CG-08: inline addresses or address ID only.

What the backend does:

1. Loads the user's cart. Rejects an empty cart.
2. Re-prices every item. If any item is unavailable or its price changed, returns `409 CART_CHANGED` with the affected items. Nothing is created.
3. Calculates `subtotal`, `shipping`, `tax` and `total`.
4. Creates the order with payment status `pending` and order status `placed`.
5. Creates the gateway payment session through the payment adapter.
6. Returns the order and the payment information.

Response:

```json
{
  "order": { },
  "paymentInfo": {
    "gateway": "razorpay",
    "gatewayOrderId": "optional",
    "amount": 24900,
    "currency": "INR",
    "keyId": "optional public key"
  }
}
```

The same `Idempotency-Key` returns the same order and payment information.

## Orders

**Order** shape:

```json
{
  "id": "ord_1",
  "orderNumber": "readable number",
  "status": "placed",
  "paymentStatus": "pending",
  "items": [],
  "address": { },
  "totals": { "subtotal": 24900, "shipping": 0, "tax": 0, "total": 24900 },
  "currency": "INR",
  "createdAt": "timestamp"
}
```

Order status values (proposed): `placed`, `confirmed`, `in_production`, `packed`, `dispatched`, `delivered`, `cancelled`.

Payment status values: `pending`, `paid`, `failed`, `cancelled`.

`GET /orders` is paged and newest first. `GET /orders/{id}` returns `404` if the order is not the caller's. The frontend polls `GET /orders/{id}` after payment, so it must reflect webhook updates quickly.

## Payment integration

The gateway is not chosen. The backend keeps the gateway behind a payment adapter with these operations:

| Operation | Purpose |
| --- | --- |
| `createPaymentSession(order)` | Returns the information the browser needs to open the payment screen |
| `verifyWebhook(rawBody, headers)` | Checks the signature and returns a normalised event |
| `fetchPaymentStatus(gatewayOrderId)` | Asks the gateway directly for the status |

Webhook handling:

1. Read the raw body and verify the signature. Reject on failure.
2. Find the order by the gateway order ID. Ignore unknown orders safely.
3. Check the amount and currency against the order.
4. On success: set payment status `paid` and order status `confirmed`.
5. On failure: set payment status `failed`. On abandonment: `cancelled`.
6. Ignore events already applied. Respond `200` quickly.

The frontend never treats a browser redirect as proof of payment. It only shows success when `GET /orders/{id}` returns `paymentStatus: "paid"`.

## Contact

`POST /contact` request: `{ name, email, phone?, message }`. Rate limited. The backend stores or emails the message, depending on Member B's choice.

## Decisions needed

| ID | Decision | Who |
| --- | --- | --- |
| D-01 | Money unit: paise as integers, or rupees as decimals | Member A and Member B |
| D-02 | Payment gateway | Client and Member B |
| D-03 | Shipping and tax rules, and whether prices include tax | Client |
| D-04 | Order status list and when an order can be cancelled | Client and Member B |
| D-05 | Session cookie or JWT | Member B |
| D-06 | How `fabric` filtering works (CG-03) | Member B |
| D-07 | Address at checkout: ID only or inline (CG-08) | Member A and Member B |
| D-08 | How the team enters products in release 1 | Member B |
