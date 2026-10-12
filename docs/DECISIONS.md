# Architectural & Engineering Decisions

This log tracks architectural choices, open decision resolutions, and dependencies added across tickets.

---

### FE-01: Project scaffold & initial dependencies
- **Question**: Which package manager to use?
  - **Decision**: npm
  - **Reason**: Explicitly instructed in project requirements.
- **Question**: Which frontend test runner and component testing library to adopt?
  - **Decision**: Vitest (`vitest`), `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`.
  - **Reason**: High performance, native TypeScript and ESM compatibility, lightweight jsdom integration for testing React 19 / Next.js components without heavy Jest transformation overhead.
- **Question**: Which UI animation and icon libraries to install?
  - **Decision**: `lucide-react` (icons) and `framer-motion` (animations).
  - **Reason**: Specified in Technical Architecture Document section 1.
- **Question**: Node.js type definitions version conflict with Vitest.
  - **Decision**: Use `@types/node` version `^24` instead of `^20`.
  - **Reason**: The runtime environment is Node v24.18.0; Vitest v5 requires `@types/node` `^22 || >=24` to resolve peer dependency requirements cleanly without `--force` or `--legacy-peer-deps`.

---

### FE-16: Option group display type fallback
- **Question**: How should an unrecognised option group display type from the API be rendered?
- **Decision**: Implemented `FallbackOptionGroup` in `OptionGroupRenderer` which gracefully falls back to the accessible chips layout with an informational note rather than failing or crashing.
- **Reason**: Required by FE-16 acceptance criteria to ensure resilient degradation if new display types are introduced by Member B.

---

### FE-30: Session resumption and uncommitted changes inspection
- **Question**: Uncommitted changes found in working directory during session resume: `app/checkout/CheckoutContent.tsx`, `docs/CONTRACT_GAPS.md`, `lib/payment/`, `tests/A/fe-30.test.tsx`.
- **Decision**: Inspected changes and verified they belong to the unfinished ticket FE-30 (Handoff to payment). The implementation introduces an isolated payment module (`lib/payment/`) with triggerable outcomes (`paid`, `pending`, `failed`, `cancelled`), wires the handoff in `CheckoutContent.tsx`, logs CG-02 in `CONTRACT_GAPS.md`, and includes comprehensive test suite `tests/A/fe-30.test.tsx`. Kept and finalized the implementation for FE-30.

---

### R-01: Remove invented claims and fix copy
- **Question**: Which customer-facing claims and placeholders needed removal or replacement?
- **Decision**:
  - Replaced "live server price breakdown" on the homepage with "see your price update as you choose before ordering".
  - Replaced "Complimentary" shipping labels on the order confirmation, order detail, and cart pages with standard shipping currency formatting and "Calculated at checkout".
  - Removed invented delivery/shipping claims ("Complimentary insured shipping across India").
  - Replaced studio address, email, and phone with visible placeholders: "Studio address to be added", "hello@example.com", "+91 00000 00000", centralized in `lib/config/site.ts` and `lib/config/contact.ts`.
  - Replaced "What Happens Next" text on order confirmation with plain factual text ("Your order has been received. You can track progress and updates anytime in your account.") and toned down craftsmanship copy in `Footer.tsx` and `lib/config/about.ts`.
---

### R-02: Hide the unused sound control
- **Question**: How should the unused header sound toggle be managed?
- **Decision**: Added `showSoundToggle: false` configuration flag to `SITE_CONFIG` (`lib/config/site.ts`). When false (default), `<Header>` does not render the `<SoundToggle />` button. Preserved all preference hook logic in `usePreferences` and all component tests in `tests/A/fe-10.test.tsx` and `tests/A/fe-37.test.tsx`. Ticket FE-37 remains documented as blocked in `docs/BLOCKERS.md`.
---

### R-03: Make the mock safe and routes API-driven
- **Question**: How to ensure production builds never leak mock data and remain strictly API-driven?
- **Decision**:
  - Hardened `isMockEnabled()` in `lib/api/index.ts` to strictly return `true` only when `process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'`. Documented configuration in `.env.example`.
  - Added unit test in `tests/A/fe-06.test.ts` verifying `isMockEnabled()` defaults to false (real API) unless `NEXT_PUBLIC_USE_MOCK_API === 'true'`.
  - Removed all `generateStaticParams` from `app/product/[slug]/page.tsx`, `app/category/[slug]/page.tsx`, and `app/account/orders/[id]/page.tsx`.
  - Refactored dynamic param unwrapping inside `<Suspense>` boundaries (`ProductDetailWrapper`, `CategoryWrapper`, `OrderDetailWrapper`) to support Next.js 16 Partial Prerendering without pre-rendering mock items.
  - Confirmed build output no longer lists static mock routes (e.g. `/product/classic-scrunchie` or `/account/orders/ord-1001`), and total static pages reduced from 29 to 21 with request-time dynamic rendering (`◐`).
---

### R-04: Contract audit
- **Question**: What differences and assumptions exist between the frontend implementation and Frontend Specification sections 7 and 8?
- **Decision**:
  - Audited `lib/types/` and `lib/api/mock/` line by line against sections 7 and 8.
  - Documented 9 additional contract gaps in `docs/CONTRACT_GAPS.md` (CG-03 through CG-11) with suggested wording for Member B:
    - CG-03: Fabric filter query param indexing (`GET /products?fabric=...`).
    - CG-04: Category summary metadata fields (`slug`, `description`, `image`, `sortOrder`).
    - CG-05: Pagination envelope structure (`pageSize`, `totalPages`).
    - CG-06: Order totals breakdown fields (`shipping`, `tax`).
    - CG-07: Proposed order status lifecycle values (`OrderStatus`).
    - CG-08: Checkout request and payment start payload contract (`POST /checkout`).
    - CG-09: Payment start parameters and result contract (`lib/payment`).
    - CG-10: Cart item selection visual metadata (`swatchImageUrl`, `colourValue`) and status enum.
    - CG-11: Price quote problem breakdown structure (`PriceQuoteProblem`).
  - Marked `CONTRACT-GAP` in code across `lib/types/product.ts`, `lib/types/order.ts`, `lib/types/cart.ts`, `lib/types/configurator.ts`, `lib/payment/types.ts`, `lib/api/mock/products.ts`, and `lib/api/mock/checkout.ts`.
  - Created `docs/status-glossary.md` with heading `# PROPOSED - not agreed with Members B and C` documenting order and payment lifecycle status values.
- **Reason**: Comply with R-04 contract audit requirements to formalize handoff contracts for Member B.

---

### R-05: Real-browser verification
- **Question**: How to orchestrate real-browser automated end-to-end testing, accessibility scans, horizontal scroll prevention, and color contrast verification?
- **Decision**:
  - Installed `@playwright/test` and `@axe-core/playwright` as devDependencies, installed Chromium browser engine.
  - Added `playwright.config.ts` configuring Chromium Desktop (1280x720) and Chromium Mobile (360x640), targeting `http://localhost:3000` with `NEXT_PUBLIC_USE_MOCK_API: 'true'`.
  - Created `e2e/horizontal-scroll.spec.ts` asserting `document.documentElement.scrollWidth <= window.innerWidth` across 11 key routes at both 360px and 1280px (22 tests, all passed with 0 horizontal scroll).
  - Created `e2e/accessibility.spec.ts` scanning 8 core pages (`/`, `/shop`, `/product/classic-scrunchie`, `/cart`, `/checkout`, `/login`, `/signup`, `/account`) using `@axe-core/playwright` for WCAG 2.1 AA violations (16 tests, all passed with 0 serious or critical violations).
  - Created `docs/CONTRAST_REPORT.md` analyzing every foreground and background token pairing. Documented fixes for `--color-success` (`#2D5A34`, 6.76:1) and updated subtle elements in `SelectionSummary` and `AddToCartBar` to meet 4.5:1 ratio.
  - Created `e2e/journey.spec.ts` testing the complete user journey: browse, configure product, add to cart, edit configuration in modal, signup, save delivery address, complete review step, submit payment, verify all 4 payment outcomes (paid, pending, failed, cancelled) on order confirmation, and confirm order appearance in My Orders.
- **Reason**: Comply with R-05 real-browser verification and accessibility requirements.

---

### R-06: Improve test quality
- **Question**: How to eliminate React `act(...)` warnings, remove the Vite ESM configuration warning, and deepen the FE-40 customer journey test?
- **Decision**:
  - Renamed `vitest.config.ts` to `vitest.config.mts` and resolved the alias via `fileURLToPath(new URL('./', import.meta.url))` to eliminate the Vite ESM `__dirname` warning entirely. Excluded `e2e/**` from Vitest to prevent runner collisions with Playwright.
  - Eliminated React `act(...)` console warnings across all unit tests:
    - `tests/A/fe-08.test.tsx`: Initialized mock returns for `useCartCount` and `useCurrentUser` in `beforeEach` to avoid unawaited async state changes in Header rendering.
    - `tests/A/fe-19.test.tsx`: Provided explicit `initialCart` to `<CartProvider>` and awaited asynchronous button enablement when resolving promises.
    - `tests/A/fe-28.test.tsx`: Mocked address updates during default-setting tests and awaited DOM updates properly.
  - Rewrote `tests/A/fe-40.test.tsx` to deeply inspect and verify every intermediate step:
    1. Browsing catalogue with pagination validation (`page`, `pageSize`, `total`, `totalPages`, product summary types).
    2. Detailed product fetching, inspecting option groups, options, types, and labels.
    3. Option selection, price delta aggregation, and server price quote validation (`lines`, `total`).
    4. Adding to cart, validating `lineTotal = unitPrice * quantity`, updating quantity to 2 and asserting recalculation.
    5. Customer authentication and session profile verification.
    6. Adding Indian shipping address (recipientName, 6-digit pinCode, 10-digit phone) and verifying persistence in address book.
    7. Initiating checkout, verifying order address, subtotal, and paymentInfo envelope.
    8. Verifying all four payment outcomes (`paid`, `pending`, `failed`, `cancelled`) through `startPayment` and confirming order payment status transitions.
    9. Fetching order history and verifying the confirmed order in the customer's orders list.
- **Reason**: Comply with R-06 test quality requirements.

---

### R-07: Scope check
- **Question**: How to ensure backend boundaries are strictly maintained across `prisma/`, `app/api/`, and `scripts/` folders?
- **Decision**:
  - Inspected `prisma/`: verified it contains solely `README.md` placeholder declaring backend ownership by Members B and C. No database schemas or Prisma models exist.
  - Inspected `app/api/`: verified it contains solely `README.md` placeholder declaring backend ownership by Members B and C. No API routes or backend controllers exist.
  - Inspected `scripts/`: found `generate-placeholders.js` (an ephemeral script used once during early FE setup). Removed `generate-placeholders.js` and created `scripts/README.md` placeholder documenting that operations/backend scripts belong to Members B and C.
- **Reason**: Comply with R-07 scope boundary requirements. Backend remains strictly owned by Members B and C.
