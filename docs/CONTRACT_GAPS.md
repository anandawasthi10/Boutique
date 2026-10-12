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
- **Resolution**: Created an isolated, replaceable abstraction layer in `lib/payment/` with interface `startPayment(params)`. Built an isolated mock adapter in `lib/payment/mock.ts` that allows triggering all 4 payment outcomes (`paid`, `pending`, `failed`, `cancelled`) without leaking gateway secrets or requiring card/UPI details on-site.

