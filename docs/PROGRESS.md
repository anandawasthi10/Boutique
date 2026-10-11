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

---

## FE-12: Shop All and category pages

- **Status**: done
- **Files Changed**:
  - `components/ui/Breadcrumbs.tsx`
  - `components/ui/index.ts`
  - `app/shop/ShopContent.tsx`
  - `app/shop/page.tsx`
  - `app/category/[slug]/CategoryContent.tsx`
  - `app/category/[slug]/page.tsx`
  - `lib/api/mock/products.ts`
  - `tests/A/fe-12.test.tsx`
- **Acceptance Criteria Verification**:
  1. *Loads products and categories only through the API layer*: Verified. Both `/shop` and `/category/[slug]` retrieve data strictly through `productsApi.getProducts()` and `categoriesApi.getCategories()`.
  2. *Loading, empty and error states behave as in the Security and Access Document*: Verified. Loading displays `ProductGrid` skeleton, empty displays friendly "No accessories found" empty state with fallback actions, and error displays `ErrorState` with retry button.
  3. *An unknown category shows the friendly not-found page*: Verified. Visiting `/category/[slug]` with an unrecognised category slug validates against category list and triggers `notFound()`.
  4. *The page title and heading reflect the category*: Verified. Heading, breadcrumbs (`Home > Shop All > [Category]`), and `generateMetadata` page title reflect the current category.
  5. *Browser back and forward restore the previous list state*: Verified. Sorting and pagination state are stored in the URL query parameters (`sort`, `page`) so navigating with browser back and forward seamlessly restores catalogue list state.
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (76 tests across 12 test suites).
  - `npm run build`: Production build succeeded (static prerendering for `/shop` and category routes).

---

## FE-13: Search and filters

- **Status**: done
- **Files Changed**:
  - `components/catalogue/SearchInput.tsx`
  - `components/catalogue/FilterChips.tsx`
  - `components/catalogue/FilterControls.tsx`
  - `components/catalogue/FilterDrawer.tsx`
  - `components/catalogue/index.ts`
  - `app/shop/ShopContent.tsx`
  - `tests/A/fe-13.test.tsx`
- **Acceptance Criteria Verification**:
  1. *Search and filters change the address and the product list*: Verified. Search queries, category selection, fabric filtering, and price ranges update URL query parameters and re-query the API layer with debounce and page reset.
  2. *A filter the API does not support is not shown*: Verified. Only API-supported dimensions (`category`, `fabric`, `priceRange`) are displayed; unsupported attributes (e.g., brand, rating) are omitted.
  3. *The no-results state offers to clear filters*: Verified. When filters result in zero products, `ShopContent` displays a prominent "Clear all filters" CTA.
  4. *Filters are fully operable by keyboard and announced to screen readers*: Verified. Search input uses `role="search"`, filter buttons use `aria-pressed`, live count uses `aria-live="polite"`, and mobile filters operate via accessible focus-trapped `Drawer`.
  5. *Rapid typing does not trigger a request for every keystroke*: Verified. `SearchInput` debounces inputs by 300ms so fast keystrokes trigger only a single consolidated request.
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (82 tests across 13 test suites).
  - `npm run build`: Production build succeeded.

---

## FE-14: Product gallery

- **Status**: done
- **Files Changed**:
  - `components/product/ProductGallery.tsx`
  - `components/product/index.ts`
  - `tests/A/fe-14.test.tsx`
- **Acceptance Criteria Verification**:
  1. *Images and alt text come from the API product*: Verified. Renders image URLs and alt texts directly provided by `ProductImage[]` from API.
  2. *A product with one image shows no thumbnail row; a product with none shows a neutral placeholder*: Verified. Zero images renders neutral placeholder box with `ImageOff` icon; single image renders large main image without thumbnail row.
  3. *Thumbnails are buttons with accessible names and a clear selected state*: Verified. Thumbnails are rendered as buttons with accessible names (`View image X of Y...`) and `aria-pressed` reflecting the selected thumbnail.
  4. *The first image loads with priority; the others load lazily*: Verified. First image sets `priority={true}` with no `loading="lazy"`; subsequent images load lazily.
  5. *The image change respects reduced motion*: Verified. When `usePreferences().reducedMotion` is true, transitions are set to `duration-0 transition-none`.
  6. *On mobile the main image can be swiped*: Verified. Touch event handlers (`onTouchStart`, `onTouchMove`, `onTouchEnd`) detect swipe left/right beyond 40px threshold and advance/reverse images.
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (88 tests across 14 test suites).
  - `npm run build`: Production build succeeded.

---

## FE-15: Product detail page shell

- **Status**: done
- **Files Changed**:
  - `app/product/[slug]/ProductDetailContent.tsx`
  - `app/product/[slug]/page.tsx`
  - `tests/A/fe-15.test.tsx`
- **Acceptance Criteria Verification**:
  1. *Loads the product through the API layer using the route slug*: Verified. ProductDetailContent queries `productsApi.getProductBySlug(slug)` cleanly through the API layer.
  2. *Two-column layout on desktop, stacked on mobile; sidebar sticky only if viewport allows*: Verified. Implemented CSS responsive grid (`grid-cols-1 lg:grid-cols-12`) with `lg:sticky lg:top-24 max-h-screen overflow-y-auto` sidebar.
  3. *Description is plain text only; no HTML rendered*: Verified. Description is rendered directly as a text paragraph without `dangerouslySetInnerHTML`.
  4. *Shows starting price until options are chosen*: Verified. Displays formatted starting price from `product.basePrice` with `Starting from` indicator.
  5. *Reserved space for the configurator avoids layout shift*: Verified. Reserved slot `data-testid="configurator-slot"` with minimum height prevents layout shifts during configuration loading.
  6. *Page title and breadcrumbs match the product*: Verified. Breadcrumbs show Home > Category > Product name; page title is dynamically synchronized.
  7. *Unknown product slug triggers friendly not-found page*: Verified. ApiException with 404 or missing product calls Next.js `notFound()`.
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (93 tests across 15 test suites).
  - `npm run build`: Production build succeeded.

---

## FE-16: Option group components

- **Status**: done
- **Files Changed**:
  - `components/configurator/SwatchGroup.tsx`
  - `components/configurator/ColourGroup.tsx`
  - `components/configurator/ChipsGroup.tsx`
  - `components/configurator/ToggleGroup.tsx`
  - `components/configurator/OptionGroupRenderer.tsx`
  - `components/configurator/index.ts`
  - `tests/A/fe-16.test.tsx`
  - `docs/DECISIONS.md`
- **Acceptance Criteria Verification**:
  1. *A swatch shows its texture image and the selected fabric's name; a colour dot shows its colour and a name for the selected one*: Verified. `SwatchGroup` displays texture image / fallback and Selected text; `ColourGroup` displays color swatch dot and Selected text.
  2. *Selected is shown by a border and a check icon, not by colour alone*: Verified. Swatches, colour dots, chips, and toggles all feature an overt checkmark icon (`<Check />`) alongside ring/border styling upon selection.
  3. *Unavailable options are disabled and show their reason*: Verified. Disabled with `disabled` and `aria-disabled`, `cursor-not-allowed`, and render clear text `unavailableReason` beneath the option.
  4. *Required and optional groups are labelled*: Verified. `OptionGroupRenderer` displays an uppercase group label alongside a `Required` badge or `Optional` label.
  5. *All four components work by keyboard, with the correct roles*: Verified. Swatch, colour, and chips groups implement `role="radiogroup"` with `role="radio"` and `aria-checked`; toggle implements `role="switch"` with `aria-checked`.
  6. *A group with an unknown display type does not crash the page; it shows a safe fallback and the report mentions it*: Verified. `OptionGroupRenderer` renders `FallbackOptionGroup` with an informational chip layout rather than failing or crashing.
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (98 tests across 16 test suites).
  - `npm run build`: Production build succeeded.

---

## FE-17: Configurator state and price quotes

- **Status**: done
- **Files Changed**:
  - `lib/hooks/useConfigurator.ts`
  - `lib/hooks/index.ts`
  - `tests/A/fe-17.test.tsx`
- **Acceptance Criteria Verification**:
  1. *No selection is made for a group unless the API supplied a default*: Verified. Groups without `defaultOptionId` remain unselected/empty.
  2. *Add to cart is not allowed until every required group has a selection and the latest quote is valid*: Verified. `canAddToCart` is strictly false until all required option groups are populated and `quote.valid === true`.
  3. *A quote response for an old selection never replaces a newer one*: Verified. Sequential request counter `requestSeqRef` prevents out-of-order race conditions from overwriting newer quote states.
  4. *Quote failures keep the last valid price marked as outdated and block Add to cart*: Verified. On API quote error, last valid quote is preserved, `isQuoteOutdated` is set to true, error message is captured, and `canAddToCart` is blocked.
  5. *When an option becomes unavailable, its selection is cleared and the customer is told*: Verified. Render-time verification strips unavailable options from state and sets `unavailableNotice` informing the customer.
  6. *Tests cover required groups, invalid combinations and out-of-order quote responses*: Verified. Comprehensive test suite in `tests/A/fe-17.test.tsx` validates all 5 scenarios.
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (103 tests across 17 test suites).
  - `npm run build`: Production build succeeded.

---

## FE-18: Preview, price breakdown and selection summary

- **Status**: done
- **Files Changed**:
  - `components/configurator/ConfiguratorPreview.tsx`
  - `components/configurator/PriceBreakdown.tsx`
  - `components/configurator/SelectionSummary.tsx`
  - `components/configurator/ProductConfigurator.tsx`
  - `components/configurator/index.ts`
  - `app/product/[slug]/ProductDetailContent.tsx`
  - `tests/A/fe-18.test.tsx`
- **Acceptance Criteria Verification**:
  1. *The preview changes only when the API supplies an image for the selection; otherwise the photo stays and the swatch card shows the chosen fabric. No image is recoloured or generated*: Verified. `ConfiguratorPreview` swaps image only if an option provides `previewImageUrl`. If not, main product photo is preserved and selected fabric displays in an attached swatch card.
  2. *The breakdown lists the base price, each option's change and the total, exactly as returned by the quote*: Verified. `PriceBreakdown` renders base price line, each delta line from `quote.lines`, and total.
  3. *Prices are formatted in rupees in the Indian number style*: Verified. All amounts are rendered using `formatCurrency()` resulting in `₹499`, `₹1,199` format.
  4. *The summary lists chosen options and names any required choices still missing*: Verified. `SelectionSummary` displays list of chosen options, and renders an alert with specific names of missing required groups.
  5. *Price changes are announced to screen readers*: Verified. Live region with `aria-live="polite"` and `aria-atomic="true"` announces updated total prices.
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (107 tests across 18 test suites).
  - `npm run build`: Production build succeeded.

---

## FE-21: Cart state and operations

- **Status**: done
- **Files Changed**:
  - `lib/hooks/useCart.tsx`
  - `lib/hooks/index.ts`
  - `app/layout.tsx`
  - `tests/A/fe-21.test.tsx`
- **Acceptance Criteria Verification**:
  1. *Every change goes through the API layer and the store updates from the returned cart*: Verified. Store dispatches through `cartApi.addToCart()`, `cartApi.updateCartItem()`, and `cartApi.removeCartItem()`, setting cart state strictly from the returned API payload.
  2. *No price, subtotal or total is calculated in the store*: Verified. All financial figures are read directly from `cart.subtotal` and `cart.total`.
  3. *Pending actions are tracked so buttons can show loading and avoid double submission*: Verified. `pendingAction` captures action type and item ID; attempts to re-submit while an action is in-flight are prevented.
  4. *Failures leave the previous cart in place and expose an error message*: Verified. When an operation rejects, previous cart items are preserved and `error` state exposes the message.
  5. *Tests cover add, update, remove and a failed update*: Verified. Comprehensive tests in `tests/A/fe-21.test.tsx` validate all 4 operations and error resilience.
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (112 tests across 19 test suites).
  - `npm run build`: Production build succeeded.

---

## FE-22: Cart drawer

- **Status**: done
- **Files Changed**:
  - `components/cart/QuantityStepper.tsx`
  - `components/cart/CartItemRow.tsx`
  - `components/cart/CartDrawer.tsx`
  - `components/cart/index.ts`
  - `components/ui/EmptyState.tsx`
  - `components/layout/Header.tsx`
  - `app/layout.tsx`
  - `tests/A/fe-22.test.tsx`
- **Acceptance Criteria Verification**:
  1. *Opens and closes with the focus rules in the component styles section*: Verified. Integrated via `Drawer` component featuring focus trapping, backdrop click close, Esc handling, and return-of-focus to trigger button.
  2. *The empty state has a clear link to Shop All*: Verified. Renders `EmptyState` with a link button targeting `/shop`.
  3. *Items with a price or availability notice show it clearly, and Checkout is blocked until the notice is acknowledged or the item removed, as the API requires*: Verified. Items with `price_changed` or `unavailable` statuses render notice banners; "Proceed to Checkout" is strictly disabled until acknowledged or removed.
  4. *Quantity changes and removal show loading and error states per item*: Verified. `QuantityStepper` and `CartItemRow` show item-level loaders and capture item-level errors.
  5. *The subtotal and total come from the API cart*: Verified. Subtotal and Total in footer are rendered directly from `cart.subtotal` and `cart.total`.
  6. *Add-to-cart feedback is visible and respects reduced motion*: Verified. Animation transitions respect `usePreferences().reducedMotion` disabling motion when requested.
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (117 tests across 20 test suites).
  - `npm run build`: Production build succeeded.

---

## FE-19: Add-to-cart bar

- **Status**: done
- **Files Changed**:
  - `components/product/AddToCartBar.tsx`
  - `components/product/index.ts`
  - `components/configurator/ProductConfigurator.tsx`
  - `components/configurator/index.ts`
  - `tests/A/fe-19.test.tsx`
- **Acceptance Criteria Verification**:
  1. *The button is disabled with a visible reason until the configuration is complete and valid*: Verified. Add to Cart button is disabled and displays prominent reason (`disabledReason`) until all required groups are chosen and quote is valid.
  2. *A second click while loading does nothing*: Verified. Re-clicking or double submitting while `isSubmitting` is true is strictly prevented.
  3. *On success, the cart drawer opens and the cart count updates from the API response*: Verified. Automatically triggers `openDrawer()` and updates items count via API `addToCart()`.
  4. *On failure, the configuration is kept and a retry is offered*: Verified. Selections remain completely intact; `submitError` banner with interactive "Retry" button is rendered.
  5. *The configuration sent contains option IDs only*: Verified. `optionIdsOnly` filters and maps chosen IDs so only string IDs are delivered to `cartApi.addToCart()`.
  6. *Guest add to cart redirects to login preserving selections in return query*: Verified. Unauthenticated users are redirected to `/login?returnTo=...` with full product slug and selected options encoded in the URL address.
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (122 tests across 21 test suites).
  - `npm run build`: Production build succeeded.

---

## FE-20: Build Your Own entry

- **Status**: done
- **Files Changed**:
  - `app/build-your-own/BuildYourOwnContent.tsx`
  - `app/build-your-own/page.tsx`
  - `tests/A/fe-20.test.tsx`
- **Acceptance Criteria Verification**:
  1. *The picker shows only products from the API*: Verified. Product picker queries `productsApi.getProducts()` directly and renders available customizable accessories with base prices.
  2. *Choosing a product shows the same configurator component used in FE-15 through FE-19*: Verified. Uses `ProductConfigurator` component (with option groups, real-time live quotes, selection breakdown, and add-to-cart bar).
  3. *Changing the product resets the selections*: Verified. Selecting an alternate product from the picker replaces the active product key and instantiates a clean configurator session with reset option selections.
  4. *Loading, empty and error states exist*: Verified. Features loading skeleton during catalogue fetch, empty state when 0 accessories return, and error state with retry button.
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (126 tests across 22 test suites).
  - `npm run build`: Production build succeeded (15 static pages prerendered).

---

## FE-23: Cart page and edit configuration

- **Status**: done
- **Files Changed**:
  - `lib/types/cart.ts`
  - `lib/api/mock/cart.ts`
  - `lib/api/mock/products.ts`
  - `docs/CONTRACT_GAPS.md`
  - `components/cart/CartItemRow.tsx`
  - `components/cart/EditConfigurationModal.tsx`
  - `components/cart/CartDrawer.tsx`
  - `components/cart/index.ts`
  - `app/cart/CartPageContent.tsx`
  - `app/cart/page.tsx`
  - `tests/A/fe-23.test.tsx`
- **Acceptance Criteria Verification**:
  1. *Edit configuration opens the same configurator component, pre-filled from the cart item*: Verified. `CartItemRow` includes an accessible "Edit configuration" action. Clicking it opens `EditConfigurationModal`, which loads the item's product and mounts `ProductConfigurator` pre-filled with `initialSelections` mapped from `item.selectedOptions`.
  2. *If a previously chosen option is no longer available, it is cleared and the customer is told*: Verified. `useConfigurator` evaluates candidate options against `option.available`. Unavailable options are cleared from initial selections and `unavailableNotice` displays the notice banner informing the customer.
  3. *Saving sends the new option IDs to the API and shows the updated price from the response*: Verified. "Save Changes" invokes `updateConfiguration(item.id, optionIdsOnly)` calling `cartApi.updateCartItem(item.id, { selectedOptionIds })`. The response returns the server-calculated cart with updated unit price, line total, subtotal, and total.
  4. *Cancelling changes nothing*: Verified. Clicking "Cancel" or closing the modal closes the editor without making API calls or modifying cart state.
  5. *The page works on mobile and desktop and handles empty, loading and error states*: Verified. Responsive 12-column desktop / stacked mobile layout; provides skeleton loader while fetching, friendly empty state with CTA pointing to `/shop`, and retryable error state.
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (132 tests across 23 test suites).
  - `npm run build`: Production build succeeded (16 static routes prerendered).

---

## FE-24: Auth state and protected pages

- **Status**: done
- **Files Changed**:
  - `lib/api/mock/auth.ts`
  - `lib/hooks/useCart.tsx`
  - `lib/utils/url.ts`
  - `lib/utils/index.ts`
  - `lib/hooks/useAuth.tsx`
  - `lib/hooks/useCurrentUser.ts`
  - `lib/hooks/index.ts`
  - `components/auth/ProtectedRoute.tsx`
  - `components/auth/index.ts`
  - `app/layout.tsx`
  - `tests/A/fe-20.test.tsx`
  - `tests/A/fe-24.test.tsx`
- **Acceptance Criteria Verification**:
  1. *The current user and a loading state are available to any component*: Verified. `AuthProvider` context in `lib/hooks/useAuth.tsx` wraps the app layout and provides `user`, `isLoading`, and `isAuthenticated` across all consumer components.
  2. *Visiting a protected page signed out goes to login and returns to the original page after login*: Verified. `ProtectedRoute` intercepts unauthenticated visits, captures full current pathname and query params, and redirects to `/login?returnTo=...`.
  3. *Only addresses on this site are accepted as return destinations*: Verified. `sanitizeReturnUrl` strictly enforces relative destinations, rejecting protocol-relative URLs (`//`), scheme injections (`http:`, `https:`, `javascript:`, `data:`), and backslashes (`\`).
  4. *No password or session secret is stored in browser storage*: Verified. Validated that `localStorage` and `sessionStorage` are never written to with credentials, tokens, or session secrets.
  5. *Logout clears the user and the cart state*: Verified. `logout()` clears `user` to `null`, resets backend/mock cart via `clearCartInternal()`, dispatches `auth:logout`, and clears the in-memory cart store state.
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (139 tests across 24 test suites).
  - `npm run build`: Production build succeeded (16 static routes prerendered).

---

## FE-25: Sign up and login pages

- **Status**: done
- **Files Changed**:
  - `components/ui/Input.tsx`
  - `app/login/LoginContent.tsx`
  - `app/login/page.tsx`
  - `app/signup/SignupContent.tsx`
  - `app/signup/page.tsx`
  - `tests/A/fe-25.test.tsx`
- **Acceptance Criteria Verification**:
  1. *Both pages validate required fields before sending and move focus to the first invalid field*: Verified. Validation checks required name, email format, minimum 8-char password, and phone formatting, placing immediate focus onto the first invalid input element.
  2. *Failed login shows a general message that does not say which part was wrong*: Verified. Generic message "The email or password you entered is incorrect. Please try again." displayed without revealing whether account exists or password was mismatched.
  3. *Successful login or sign up sends the user to the destination from the page address, or to the account page if none was given*: Verified. `sanitizeReturnUrl` extracts safe return destination and routes to `/account` by default when no `returnTo` is provided.
  4. *A toggle button reveals the password in plain text and hides it again, with its state announced to screen readers*: Verified. Password inputs include accessible show/hide toggle buttons with `aria-label` ("Show password" / "Hide password") and `aria-pressed`.
  5. *Second click during submission does nothing*: Verified. Buttons and inputs are disabled with `isSubmitting` flag and prevent duplicate requests while an active request is in-flight.
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (148 tests across 25 test suites).
  - `npm run build`: Production build succeeded (18 static routes prerendered).

---

## FE-26: Forgot and reset password

- **Status**: done
- **Files Changed**:
  - `app/forgot-password/ForgotPasswordContent.tsx`
  - `app/forgot-password/page.tsx`
  - `app/reset-password/ResetPasswordContent.tsx`
  - `app/reset-password/page.tsx`
  - `tests/A/fe-26.test.tsx`
- **Acceptance Criteria Verification**:
  1. *The confirmation message is the same whether or not an account exists*: Verified. Submitting any email to `/forgot-password` displays neutral confirmation message ("If an account exists with this email address, we have sent instructions to reset your password. Please check your inbox and spam folder.") protecting user privacy.
  2. *An expired or invalid token shows a clear message and a way to request a new link*: Verified. When token is omitted or when server responds with invalid/expired token error, user sees clear error card ("This password reset link is invalid or has expired. Please request a new password reset link.") and button linking to `/forgot-password`.
  3. *The reset page validates the new password and confirms success with a link to login*: Verified. Form validates minimum 8 characters and matching password confirmation, submits to `authApi.resetPassword`, and upon success displays confirmation state with direct link to `/login`.
  4. *Tokens are not logged or shown in page text*: Verified. Reset tokens are transmitted only in API payload and never rendered in the page text, headings, or logged to console.
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (157 tests across 26 test suites).
  - `npm run build`: Production build succeeded (20 static routes prerendered).

---

## FE-27: Account and profile

- **Status**: done
- **Files Changed**:
  - `components/auth/ProtectedRoute.tsx`
  - `components/account/AccountNav.tsx`
  - `components/account/AccountLayout.tsx`
  - `components/account/index.ts`
  - `app/account/ProfileContent.tsx`
  - `app/account/page.tsx`
  - `tests/A/fe-27.test.tsx`
- **Acceptance Criteria Verification**:
  1. *Only signed-in customers can open the area*: Verified. `AccountLayout` wraps views in `ProtectedRoute`, which intercepts unauthenticated visits and redirects to `/login?returnTo=%2Faccount` while preserving return destination.
  2. *The profile shows only the fields the API returns*: Verified. Views render `name`, `email`, optional `phone` (with friendly "Not provided" fallback), and account creation/reference date returned by the API contract.
  3. *The navigation works on mobile and desktop, with the current page marked*: Verified. `AccountNav` lists Profile, Addresses, Orders and Sign Out, uses `usePathname` to mark active route with `aria-current="page"`, and responds responsively across mobile and desktop.
  4. *Loading and error states exist*: Verified. `ProfileContent` renders skeleton placeholders during session fetch, and error card with retry button when user cannot be loaded.
- **Tests Run & Results**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run lint`: Passed with 0 errors.
  - `npm test`: Passed (165 tests across 27 test suites).
  - `npm run build`: Production build succeeded (21 static routes prerendered).
