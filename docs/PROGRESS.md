# Frontend Development Progress

This file tracks the ticket-by-ticket execution progress, verification of acceptance criteria, test results, and file changes.

---

## FE-01: Project scaffold

- **Status**: done
- **Files Changed**:
  - `package.json`, `package-lock.json`
  - `tsconfig.json`
  - `eslint.config.mjs`
  - `next.config.ts`
  - `vitest.config.ts`
  - `.gitignore`
  - `.env.example`
  - `docs/stack-versions.md`
  - `docs/DECISIONS.md`
  - `docs/CONTRACT_GAPS.md`
  - `docs/BLOCKERS.md`
  - `tests/setup.ts`
  - `tests/A/fe-01.test.ts`
  - Directory structure and placeholder READMEs across `app/`, `components/`, `lib/`, `prisma/`, `public/`, `styles/`, `tests/`
- **Acceptance Criteria Verification**:
  1. *The project installs, builds and runs locally with one documented command each*: Verified. `npm install`, `npm run build`, `npm run dev`, `npm test`, `npm run lint`, `npm run typecheck` all documented and functioning.
  2. *TypeScript strict mode is on*: Verified. `"strict": true` in `tsconfig.json`.
  3. *The folders in the architecture document exist, with a short README or placeholder where empty*: Verified. Created all required directories (`app/(storefront)`, `app/(auth)`, `app/(account)`, `app/(checkout)`, `app/api`, `components/ui`, `components/layout`, `components/catalogue`, `components/product`, `components/configurator`, `components/cart`, `components/checkout`, `components/account`, `lib/api/mock`, `lib/types`, `lib/hooks`, `lib/validation`, `lib/format`, `lib/server`, `prisma`, `public`, `styles`, `tests/A`, `tests/B`, `tests/C`) with placeholder READMEs.
  4. *`.env.example` lists `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_USE_MOCK_API` and `NEXT_PUBLIC_SITE_URL` with empty values*: Verified. Created `.env.example`.
  5. *`/docs/stack-versions.md` lists the real installed versions, not guessed ones*: Verified. Extracted exact versions from installed packages and logged in `/docs/stack-versions.md`.
  6. *Lint, type check and the test runner all run successfully*: Verified. `npm run typecheck`, `npm run lint`, and `npm test` (Vitest) all passed with 0 errors.
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (2 tests in `tests/A/fe-01.test.ts`).
  - `npm run build`: Production build succeeded.

---

## FE-02: Design tokens and fonts

- **Status**: done
- **Files Changed**:
  - `styles/tokens.ts`
  - `app/globals.css`
  - `app/layout.tsx`
  - `tests/A/fe-02.test.ts`
- **Acceptance Criteria Verification**:
  1. *Every colour token in the specification exists with the stated hex*: Verified. All 16 tokens (`--color-bg`, `--color-surface`, `--color-surface-alt`, `--color-border`, `--color-text`, `--color-text-muted`, `--color-primary`, `--color-primary-text`, `--color-blush`, `--color-blush-deep`, `--color-sage`, `--color-sage-deep`, `--color-lavender`, `--color-error`, `--color-warning`, `--color-focus`) match the exact specified hex codes.
  2. *Tailwind classes exist for the colours, type scale, spacing and radii*: Verified. Mapped in `@theme` and custom utility classes.
  3. *Fonts load without layout shift, and fallbacks apply if they fail*: Verified. Loaded Cormorant Garamond, DM Sans, and Caveat via `next/font/google` with fallback font stacks (`Georgia, serif`, `system-ui, -apple-system, sans-serif`, `cursive`) and `display: swap`.
  4. *Focus ring is visible on every interactive element by default*: Verified. Applied `:focus-visible` with 2px solid `--color-focus` and 2px offset.
  5. *A reduced-motion setting disables non-essential motion globally*: Verified. Included `@media (prefers-reduced-motion: reduce)` in `globals.css` resetting animation and transition durations.
  6. *A contrast check of each text and background pair is included in the report, with any failures listed*: Verified.
     - Text (`#4A3A33`) on BG (`#FAF6EF`): 10.02:1 (Passes AAA)
     - Text (`#4A3A33`) on Surface (`#F3EBDD`): 9.1:1 (Passes AAA)
     - Primary Button Text (`#FAF6EF`) on Primary (`#4A3A33`): 10.02:1 (Passes AAA)
     - Muted Text (`#7A655B`) on BG (`#FAF6EF`): 5.1:1 (Passes AA)
     - Error Text (`#B3463F`) on BG (`#FAF6EF`): 5.05:1 (Passes AA)
     - Sage Deep (`#6F8470`) on BG (`#FAF6EF`): 3.75:1 (Passes WCAG AA for UI graphics and large text; reserved for badges/icons, not small body text).
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (11 tests in `tests/A/fe-01.test.ts` & `tests/A/fe-02.test.ts`).
  - `npm run build`: Production build succeeded.

---

## FE-03: Base UI components

- **Status**: done
- **Files Changed**:
  - `components/ui/Button.tsx`
  - `components/ui/Input.tsx`
  - `components/ui/Select.tsx`
  - `components/ui/Checkbox.tsx`
  - `components/ui/Radio.tsx`
  - `components/ui/Badge.tsx`
  - `components/ui/Skeleton.tsx`
  - `components/ui/Drawer.tsx`
  - `components/ui/Modal.tsx`
  - `components/ui/Toast.tsx`
  - `components/ui/EmptyState.tsx`
  - `components/ui/ErrorState.tsx`
  - `components/ui/index.ts`
  - `tests/setup.ts`
  - `tests/A/fe-03.test.tsx`
- **Acceptance Criteria Verification**:
  1. *Each component implements the states in the component styles section*: Verified. Default, hover, focus, active, disabled, and loading (Button with spinner, disabled click) all implemented.
  2. *Inputs have visible labels, linked error messages and 16 px text*: Verified. Label rendered above input, error linked via `aria-describedby` with `role="alert"`, `text-[16px]` applied.
  3. *Drawer and modal trap focus, close on Escape and return focus when closed*: Verified. Implemented Tab/Shift+Tab focus trap, Escape key dismiss, backdrop click dismiss, and return focus to triggering element upon close.
  4. *Components are keyboard operable and have accessible names*: Verified. Roles (`dialog`, `combobox`, `checkbox`, `radiogroup`, `status`, `alert`) and accessible labels/aria-labelledby verified.
  5. *Component tests cover the main states of the button, input and drawer*: Verified. 13 component tests in `tests/A/fe-03.test.tsx` covering button variants/loading/disabled, input label/error/aria attributes, select, checkbox, drawer backdrop/escape/open/close, modal, empty state, error state, badge, and skeleton.
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (24 tests in `tests/A/fe-01.test.ts`, `tests/A/fe-02.test.ts`, `tests/A/fe-03.test.tsx`).
  - `npm run build`: Production build succeeded.

---

## FE-04: Component preview page

- **Status**: done
- **Files Changed**:
  - `app/component-preview/page.tsx`
  - `tests/A/fe-04.test.tsx`
- **Acceptance Criteria Verification**:
  1. *Every component from FE-03 appears in all its states*: Verified. Page showcases Button (primary, secondary, text, icon, loading, disabled), Input (default, helper, error, disabled), Select, Checkbox, RadioGroup, Badge, Skeleton, Drawer, Modal, Toast, EmptyState, and ErrorState.
  2. *The page is not reachable in a production build*: Verified. In production (`process.env.NODE_ENV === 'production'`), the page calls Next.js `notFound()`, returning a 404 response. Tested via automated unit test.
  3. *No part of the page is linked from the public navigation*: Verified. Excluded from all storefront navigation, header, and footer links.
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (26 tests in `tests/A/fe-01.test.ts`, `tests/A/fe-02.test.ts`, `tests/A/fe-03.test.tsx`, `tests/A/fe-04.test.tsx`).
  - `npm run build`: Production build succeeded.

---

## FE-05: API types

- **Status**: done
- **Files Changed**:
  - `lib/types/error.ts`
  - `lib/types/product.ts`
  - `lib/types/configurator.ts`
  - `lib/types/cart.ts`
  - `lib/types/address.ts`
  - `lib/types/order.ts`
  - `lib/types/user.ts`
  - `lib/types/index.ts`
  - `tests/A/fe-05.test.ts`
- **Acceptance Criteria Verification**:
  1. *Each object in the specification has a type with the listed fields, with optional fields marked optional*: Verified. Typed `Product`, `OptionGroup`, `Option`, `PriceQuote`, `Cart`, `CartItem`, `Address`, `Order`, `OrderItem`, `User`, `ApiError`, etc. Exactly matching Frontend Specification Section 8.
  2. *Option group type is a fixed set of the four display types*: Verified. `OptionGroupType = 'swatch' | 'colour' | 'chips' | 'toggle'`.
  3. *No any type is used for API data*: Verified. Zero instances of `any`.
  4. *A short note in the report lists every field name that is still unconfirmed with Member B*: Verified.
     - Unconfirmed fields with Member B:
       - Currency representation: `basePrice`, `priceDelta`, and totals are typed as whole numbers (INR rupees). Confirmation required from Member B if paise integers (e.g. 29900) or strings are preferred.
       - `category`: structured as `{ id: string; name: string }` vs category ID string.
       - `Order.status`: enumeration (`'placed' | 'confirmed' | 'in_production' | 'packed' | 'dispatched' | 'delivered' | 'cancelled'`) to be formally agreed via BC-01.
       - `CheckoutResponse.paymentInfo`: gateway specific fields (`gatewayOrderId`, `keyId`, `amount`, `currency`).
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (32 tests across 5 test suites).
  - `npm run build`: Production build succeeded.

---

## FE-06: API client

- **Status**: done
- **Files Changed**:
  - `lib/api/client.ts`
  - `lib/api/products.ts`
  - `lib/api/categories.ts`
  - `lib/api/cart.ts`
  - `lib/api/auth.ts`
  - `lib/api/addresses.ts`
  - `lib/api/checkout.ts`
  - `lib/api/orders.ts`
  - `lib/api/index.ts`
  - `tests/A/fe-06.test.ts`
- **Acceptance Criteria Verification**:
  1. *Each endpoint in the API spec has a typed function*: Verified. Created typed functions for products, categories, cart, auth, addresses, checkout, and orders.
  2. *Network failures, non-success responses and malformed responses all become the standard error shape*: Verified. Normalizes failures into `ApiException` containing `code`, `message`, and optional `fieldErrors`.
  3. *The client sends credentials in the way chosen for authentication from one single configuration point*: Verified. Set `credentials: 'include'` in `lib/api/client.ts` across all requests.
  4. *No component imports the network functions directly except through the area modules*: Verified. `lib/api/index.ts` re-exports modular service namespaces (`productsApi`, `cartApi`, etc.).
  5. *Tests cover success, field errors and network failure for at least the product and cart modules*: Verified. 4 unit tests in `tests/A/fe-06.test.ts` testing success, field errors, network failure, and malformed JSON.
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (36 tests across 6 test suites).
  - `npm run build`: Production build succeeded.

---

## FE-07: Mock adapter

- **Status**: done
- **Files Changed**:
  - `public/images/placeholders/*` (Neutral SVGs clearly labelled as placeholders)
  - `scripts/generate-placeholders.js`
  - `lib/api/mock/data.ts`
  - `lib/api/mock/products.ts`
  - `lib/api/mock/categories.ts`
  - `lib/api/mock/cart.ts`
  - `lib/api/mock/auth.ts`
  - `lib/api/mock/addresses.ts`
  - `lib/api/mock/checkout.ts`
  - `lib/api/mock/orders.ts`
  - `lib/api/mock/index.ts`
  - `lib/api/index.ts` (Single switching file)
  - `.env.local`
  - `tests/A/fe-07.test.ts`
- **Acceptance Criteria Verification**:
  1. *With the flag on, every page can load data without a backend*: Verified. `NEXT_PUBLIC_USE_MOCK_API=true` loads categories, 4 products, price quotes, in-memory cart, addresses, orders, and user without network calls.
  2. *With the flag off, the real client is used and no mock code runs*: Verified. `isMockEnabled()` toggles directly to real `apiFetch` modules (`./products`, `./cart`, etc.). Verified in test.
  3. *The mock returns every error type at least once, selectable for testing*: Verified. Deterministic triggers: slug `error-fail-to-load` throws `PRODUCT_LOAD_FAILED`, slug `not-found` throws `PRODUCT_NOT_FOUND`, password `wrong-password` throws `INVALID_CREDENTIALS`, token `invalid-token` throws `TOKEN_INVALID_OR_EXPIRED`, missing options in quote returns `problems`, test address `addr-fail-payment` triggers failed payment order.
  4. *No component, page or test outside lib/api/mock/ imports mock data directly*: Verified. All access routes via `lib/api` (`productsApi`, `cartApi`, etc.).
  5. *Deleting lib/api/mock/ and the flag leaves the project compiling, apart from the one switching file, which is named in the report*: Verified. The single switching file is `lib/api/index.ts`.
  6. *No Pinterest, Shein or AI moodboard photographs are used as placeholder images*: Verified. Created local, neutral SVG graphics clearly marked as "(Placeholder)" using the project palette.
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (44 tests across 7 test suites).
  - `npm run build`: Production build succeeded.

---

## FE-08: Site layout shell

- **Status**: done
- **Files Changed**:
  - `lib/config/site.ts`
  - `lib/hooks/useCartCount.ts`
  - `lib/hooks/useCurrentUser.ts`
  - `components/layout/Header.tsx`
  - `components/layout/Footer.tsx`
  - `components/layout/MobileNav.tsx`
  - `components/layout/index.ts`
  - `app/layout.tsx`
  - `tests/A/fe-08.test.tsx`
- **Acceptance Criteria Verification**:
  1. *Header and footer appear on every page through the root layout*: Verified. `app/layout.tsx` wraps every route with `<Header />`, `<main id="main-content">`, and `<Footer />`.
  2. *The mobile navigation opens as a drawer with focus handling and closes on Escape*: Verified. Hamburger button opens `MobileNav` with `Drawer` focus trap, Escape key handling, and backdrop click dismiss.
  3. *The cart count comes from the cart state and shows nothing when the cart is empty*: Verified. Header cart badge displays dynamic item count from `useCartCount` and is hidden when `count === 0`.
  4. *The account link shows login when signed out and the account menu when signed in*: Verified. Shows "Log in" link when guest, and "Account" with user profile link when logged in.
  5. *The brand name appears from one single configuration value*: Verified. Centralized in `lib/config/site.ts` (`SITE_CONFIG.brandName`).
  6. *A skip-to-content link is the first focusable element*: Verified. `<a href="#main-content">` is rendered at the top of Header as the first focusable element.
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (52 tests across 8 test suites).
  - `npm run build`: Production build succeeded.

---

## FE-09: Homepage

- **Status**: done
- **Files Changed**:
  - `lib/format/currency.ts`
  - `components/catalogue/ProductCard.tsx`
  - `components/catalogue/ProductGrid.tsx`
  - `app/page.tsx`
  - `tests/setup.ts`
  - `tests/A/fe-09.test.tsx`
- **Acceptance Criteria Verification**:
  1. *Hero, categories, featured products and brand story all render*: Verified. Editorial hero section with CTAs, category browser cards, featured products grid, and authentic brand story band all render with semantic structure.
  2. *Featured products load from the API layer, with skeleton placeholders while loading*: Verified. Asynchronously loads via `productsApi.getProducts()` with mock API support, displaying 4-item skeleton grid during pending state.
  3. *Error state renders if the API call fails, with a retry button*: Verified. If the product API rejects, `ErrorState` is displayed with accessible role="alert" and a retry button that triggers re-fetch.
  4. *All links navigate to the correct routes*: Verified. Hero links to `/shop` and `/build-your-own`; category cards link to `/category/[slug]`; product cards link to `/product/[slug]`.
  5. *No invented reviews, customer counts or artificial claims*: Verified. Brand story features tactile craftsmanship and materials without fake review counts, star ratings, or invented metrics.
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (56 tests across 9 test suites).
  - `npm run build`: Production build succeeded.

---

## FE-10: Preference controls (motion and sound)

- **Status**: done
- **Files Changed**:
  - `lib/hooks/usePreferences.tsx`
  - `components/layout/SoundToggle.tsx`
  - `components/layout/Header.tsx`
  - `components/layout/index.ts`
  - `app/layout.tsx`
  - `tests/A/fe-10.test.tsx`
- **Acceptance Criteria Verification**:
  1. *Sound is off by default and the choice is saved in the browser*: Verified. Defaults strictly to `false` and persists user preferences in `localStorage` under `handmade_boutique_sound_preference` across browser sessions using `useSyncExternalStore`.
  2. *The toggle has an accessible name and clearly shows its state*: Verified. `SoundToggle` button renders with accessible name (`Mute sound effects (sound is currently enabled)` or `Enable sound effects (sound is currently disabled)`), `aria-pressed` mirroring state, and icon changes between `Volume2` and `VolumeX`.
  3. *A hook exposes `soundEnabled` and `reducedMotion` for other components*: Verified. `usePreferences()` returns `{ soundEnabled, reducedMotion, toggleSound, setSoundEnabled }`, reading `window.matchMedia('(prefers-reduced-motion: reduce)')` reactively.
  4. *Nothing plays automatically on page load*: Verified. Verified via tests that no audio playback or context initialization occurs on render or toggle.
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (62 tests across 10 test suites).
  - `npm run build`: Production build succeeded.

---

## FE-11: Product card and grid

- **Status**: done
- **Files Changed**:
  - `components/catalogue/ProductCard.tsx`
  - `components/catalogue/ProductGrid.tsx`
  - `components/catalogue/index.ts`
  - `tests/A/fe-11.test.tsx`
- **Acceptance Criteria Verification**:
  1. *The card shows only data from the API product summary. No price is calculated in the component*: Verified. The card displays `From {formatCurrency(product.basePrice)}` using API data without in-component price arithmetic.
  2. *The card is a single link with an accessible name containing the product name and price*: Verified. Link has accessible `aria-label={`${product.name}, starting from ${formatCurrency(product.basePrice)}`}` and wraps the card.
  3. *A missing image shows a neutral placeholder block, not a broken image*: Verified. When `images` array is empty or image triggers `onError`, renders `data-testid="missing-image-placeholder"` with `ImageOff` icon and "Image coming soon" block.
  4. *The hover change has a keyboard focus equivalent and respects reduced motion*: Verified. Secondary image fades in on both hover (`onMouseEnter`/`onMouseLeave`) and focus (`onFocus`/`onBlur`); when `reducedMotion` is enabled, transitions are set to `duration-0` and `motion-reduce:transition-none`.
  5. *Skeleton, empty and error variants exist*: Verified. `ProductGrid` provides skeleton variant with configurable count, empty state variant with CTA, and error state variant with retry handler, across responsive 2/3/4-column layouts (`grid-cols-2 md:grid-cols-3 lg:grid-cols-4`).
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (70 tests across 11 test suites).
  - `npm run build`: Production build succeeded.

