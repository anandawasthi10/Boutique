# Contract Gaps Log

This document tracks any missing endpoints, fields, or response structures identified in the contract from Frontend Specification sections 7 & 8.

---

### CG-01: Product resolution for cart items during Edit Configuration (FE-23)
- **Ticket**: FE-23
- **Description**: Frontend Specification Section 8 defines `CartItem` with `productId`, `productName`, `image`, but does not include `productSlug`. Furthermore, Section 7 defines `GET /products/{slug}` without an explicit `GET /products/{id}`. To support editing an item's configuration from the cart, the configurator requires the full `Product` details with option groups.
- **Resolution**:
  1. Made `mockProducts.getProductBySlug` resolve by either `slug` or `id` (`p.slug === slug || p.id === slug`).
  2. Added optional `productSlug?: string` to `CartItem` interface and mock cart items.

