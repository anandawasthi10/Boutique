# Contract Gaps Log

This document tracks any missing endpoints, fields, or response structures identified in the contract from Frontend Specification sections 7 & 8.

---

### CG-01: Product resolution for cart items during Edit Configuration (FE-23)
- **Ticket**: FE-23
- **Description**: Frontend Specification Section 8 defines `CartItem` with `productId`, `productName`, `image`, but does not include `productSlug`. Furthermore, Section 7 defines `GET /products/{slug}` without an explicit `GET /products/{id}`. To support editing an item's configuration from the cart, the configurator requires the full `Product` details with option groups.
- **Resolution**:
  1. Made `mockProducts.getProductBySlug` resolve by either `slug` or `id` (`p.slug === slug || p.id === slug`).
  2. Added optional `productSlug?: string` to `CartItem` interface and mock cart items.

---

### CG-02: Payment gateway selection and SDK integration contract (FE-30)
- **Ticket**: FE-30
- **Description**: Frontend Specification Section 7 note 1 states: "Payment gateway: the gateway is not chosen yet. The frontend only needs, from `POST /checkout`, whatever is required to start the gateway's payment screen." Because no specific gateway (e.g., Razorpay, Cashfree, Stripe) has been approved by Member B/Client, specific SDK parameters, webhook callbacks, and client-side modal scripts cannot be locked in.
---

### CG-03: Assumed fabric filter query parameter and product fabric indexing (`GET /products?fabric=...`)
- **Ticket / Refinement**: R-04 (FE-13)
- **Description**: Frontend Specification Section 7 lists `fabric` under "Optional query: category, search text, fabric, price range, sort, page". However, Section 8 `Product` does not contain a top-level `fabric` field — fabrics exist as options within an option group. The frontend and mock assume `fabric` filters by option label inside swatch option groups (`g.type === 'swatch' && g.options.some(...)`).
- **Code Reference**: `lib/api/mock/products.ts`, `lib/types/product.ts` (marked `CONTRACT-GAP`)
- **Suggested Wording for Member B**: "Please confirm how the backend intends to filter products by fabric on `GET /products?fabric={value}`. Should fabric be indexed from swatch option groups, or will products expose a dedicated `fabric` tag / attribute?"

---

### CG-04: Category summary metadata fields (`slug`, `description`, `image`, `sortOrder`)
- **Ticket / Refinement**: R-04 (FE-12)
- **Description**: Frontend Specification Section 7 defines `GET /categories` returning "List of categories". Section 8 only defines `{ id, name }` for categories within Product. Frontend types `CategorySummary` and mock define `slug: string; description?: string; image?: string; sortOrder?: number;` to power category cards and routing (`/category/[slug]`).
- **Code Reference**: `lib/types/product.ts` (marked `CONTRACT-GAP`)
- **Suggested Wording for Member B**: "Please confirm that the `GET /categories` response item schema includes `slug: string`, `description?: string`, `image?: string`, and `sortOrder?: number` so the frontend can route to `/category/{slug}` and render category cards."

---

### CG-05: Paging response envelope (`pageSize`, `totalPages`)
- **Ticket / Refinement**: R-04 (FE-11, FE-33)
- **Description**: Frontend Specification Section 7 mentions "paging details" for `GET /products` and "Optional paging" for `GET /orders`. Frontend `ProductsResponse` and `OrdersResponse` assume `{ items, total, page, pageSize, totalPages }`.
- **Code Reference**: `lib/types/product.ts`, `lib/types/order.ts` (marked `CONTRACT-GAP`)
- **Suggested Wording for Member B**: "Please confirm the pagination metadata envelope on `GET /products` and `GET /orders`. Frontend currently expects `{ items: T[], total: number, page: number, pageSize: number, totalPages: number }`."

---

### CG-06: Order totals breakdown fields (`shipping`, `tax`)
- **Ticket / Refinement**: R-04 (FE-29, FE-32, FE-34)
- **Description**: Frontend Specification Section 8 defines `totals: Item total, any shipping or other charges, and final total`. Frontend specifies `OrderTotals` as `{ subtotal: number; shipping: number; tax?: number; total: number; }`. Open decision 8 also notes shipping/tax charges are undecided.
- **Code Reference**: `lib/types/order.ts` (marked `CONTRACT-GAP`)
- **Suggested Wording for Member B**: "Please confirm the exact property names and calculation rules for `totals` on orders and checkout: frontend uses `{ subtotal: number, shipping: number, tax?: number, total: number }`."

---

### CG-07: Proposed Order Status lifecycle values (`OrderStatus`)
- **Ticket / Refinement**: R-04 (FE-33, FE-34)
- **Description**: Frontend Specification Section 8 states `status: Order status from the agreed list in /docs/status-glossary.md`. Section 8 only listed payment statuses (`pending`, `paid`, `failed`, `cancelled`), but did not specify order lifecycle statuses. Frontend proposes: `'placed' | 'confirmed' | 'in_production' | 'packed' | 'dispatched' | 'delivered' | 'cancelled'`.
- **Code Reference**: `lib/types/order.ts` (marked `CONTRACT-GAP`), `docs/status-glossary.md`
- **Suggested Wording for Member B**: "Please review and approve or amend the proposed order lifecycle status values: `placed`, `confirmed`, `in_production`, `packed`, `dispatched`, `delivered`, `cancelled` documented in `docs/status-glossary.md`."

---

### CG-08: Checkout request and payment start payload contract (`POST /checkout`)
- **Ticket / Refinement**: R-04 (FE-29, FE-30)
- **Description**: Frontend Specification Section 7 says `POST /checkout` sends "Address ID (or new address)" and returns "The order, and the information needed to start payment". Frontend `CheckoutRequest` currently only accepts `addressId: string` (address is created via `POST /addresses` first). `CheckoutResponse` returns `{ order: Order; paymentInfo: { gateway: string; gatewayOrderId?: string; amount: number; currency: string; keyId?: string; }; }`.
- **Code Reference**: `lib/types/order.ts`, `lib/api/mock/checkout.ts` (marked `CONTRACT-GAP`)
- **Suggested Wording for Member B**: "Please confirm the payload schema for `POST /checkout`: does the endpoint accept inline address objects or require an existing `addressId`? Confirm the `paymentInfo` structure returned to initialize client payment."

---

### CG-09: Payment start parameters and result contract (`lib/payment`)
- **Ticket / Refinement**: R-04 (FE-30, FE-31)
- **Description**: Frontend Specification Section 7 Note 1 states payment gateway is unchosen. Frontend abstraction `startPayment(params: PaymentStartParams): Promise<PaymentResult>` defines `PaymentStartParams` (`orderId`, `amount`, `currency`, `gatewayOrderId?`, `keyId?`, `returnUrl?`) and `PaymentResult` (`orderId`, `status: 'paid' | 'pending' | 'failed' | 'cancelled'`, `redirectUrl`).
- **Code Reference**: `lib/payment/types.ts` (marked `CONTRACT-GAP`)
- **Suggested Wording for Member B**: "Once Member B and Client select a payment gateway (e.g. Razorpay, Cashfree), please finalize the client initialization parameters and redirect/callback parameters required by `startPayment`."

---

### CG-10: Cart item selection visual metadata (`swatchImageUrl`, `colourValue`) and status enum
- **Ticket / Refinement**: R-04 (FE-22, FE-23)
- **Description**: Frontend Specification Section 8 states `selectedOptions`: "Each group and the chosen option, as labels and IDs". Frontend extends `CartItemSelection` with optional `swatchImageUrl` and `colourValue` to render visual swatches in cart/checkout reviews. Additionally, `CartItem.status` is formalized as `'available' | 'price_changed' | 'unavailable'`.
- **Code Reference**: `lib/types/cart.ts` (marked `CONTRACT-GAP`)
- **Suggested Wording for Member B**: "Please confirm if `selectedOptions` in cart items includes swatch preview metadata (`swatchImageUrl`, `colourValue`), and confirm the enum values for cart item `status` (`available`, `price_changed`, `unavailable`)."

---

### CG-11: Price quote problem breakdown structure (`PriceQuoteProblem`)
- **Ticket / Refinement**: R-04 (FE-18)
- **Description**: Frontend Specification Section 8 states `problems: If invalid, which groups or options are the problem and why`. Frontend proposes `{ groupId: string; optionId?: string; message: string; }[]`.
- **Code Reference**: `lib/types/configurator.ts` (marked `CONTRACT-GAP`)
- **Suggested Wording for Member B**: "Please confirm the error problem structure for `POST /products/{id}/quote`: frontend expects `{ groupId: string; optionId?: string; message: string; }[]`."

