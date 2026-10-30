# Architecture Decisions & Specification Resolutions

See full architecture documentation in [docs/DECISIONS.md](docs/DECISIONS.md).

### Latest Decision: D-18 (Featured Pieces Ivory & Plum Theme & Shared Card Tone Architecture)
- Applied Ivory and Plum theme to #featured-pieces with solid surface background (--color-surface: #F0E4E6).
- Eyebrow set to muted (--color-muted, 5.47:1 contrast); title set to serif ink (--color-ink, 13:1 contrast); divider set to plum at 20% alpha.
- Product cards support tone="on-tint" rendering solid ivory image blocks (--color-ivory: #FBF7F4), 4px radius, no border, no shadow, no overlay.
- Product titles: serif ink with plum underline on hover; prices: plum medium weight on own line.
- Missing images render "Image coming soon" in 12px muted text with zero network requests (zero 404s to placeholder.svg).
- "View full range": desktop plum link with 4px underline offset; mobile 48px outline button with 1px plum border and solid plum hover.
- Card & button focus rings: 2px plum outline with 2px offset.
- Verified across 7 viewports (360x640, 390x844, 430x932, 768x1024, 1024x768, 1366x768, 1920x1080) with screenshots saved to screenshots/theme/.

### Decision: D-19 (Ratings & Reviews Ivory and Plum Theme Refinement)
- Restyled `#reviews-section` on solid plum background (`--color-plum: #3D2438`) with `data-tone="dark"` preserving adaptive ivory header state.
- Added `--color-rose-pale: #EBC6D2` token for small accent labels and tags on plum surfaces.
- Removed edge-fade gradient overlays and masks from `ReviewsMarquee.tsx`; cards clip cleanly at container edges per solid colors rule.
- Summary box and review cards restyled on solid plum-raised (`--color-plum-raised: #604B5C`) with 4px radius, zero borders, zero shadows, and zero blurs.
- Eliminated all legacy navy, slate, amber, orange, emerald, and yellow styling.
- All filter pills, action buttons, pause/playback, like, and share controls verified for 44px/48px min tap targets and 2px ivory focus rings with 2px offset.
- Verified across 7 viewports (360x640, 390x844, 430x932, 768x1024, 1024x768, 1366x768, 1920x1080) with screenshots saved to `screenshots/theme/`.

### Latest Decision: D-20 (Homepage Ending Rework: About the Studio, Ratings & Reviews, Footer)
- Reworked homepage ending rhythm with sequential section tone transitions: About the Studio (`data-tone="dark"`, plum), Ratings & Reviews (`data-tone="light"`, ivory with plum cards), and Footer (`data-tone="dark"`, plum-deep).
- Removed interactive customiser block from `app/page.tsx`. Nav links to `/build-your-own` remain intact in Header and MobileNav.
- Moved About the Studio directly above Ratings & Reviews in `app/page.tsx`. Final sequence: Hero -> Explore -> Featured -> About -> Reviews -> Footer.
- Styled About the Studio in solid plum with centered 42rem container, rose-pale uppercase eyebrow, ivory serif heading, 82% rgba ivory body copy, and 2px ivory focus rings with 2px offset.
- Inverted Ratings & Reviews section to solid ivory with line dividers, transparent verified pill with rose-text star, ink serif heading, surface summary box with ink 4.3 score, and solid plum cards with 4px radius, no border, no shadow.
- Restyled Footer in solid plum-deep with 1px plum-line border, ivory serif logo, 85% rgba ivory tagline and links with hover underline, permanently underlined email/phone, 75% rgba ivory bottom bar, and removed duplicate legal links from Explore column.
- Added token `--color-rose-pale: #EBC6D2` in `app/globals.css`.
- Verified across all 7 viewports (360x640, 390x844, 430x932, 768x1024, 1024x768, 1366x768, 1920x1080) via Playwright in `e2e/task6-final-verification.spec.ts` (14/14 passed) and full unit test suite (290/290 passed).
- Screenshots saved to `screenshots/theme/`. Inner storefront pages (shop, product detail, build your own, cart, checkout, login) left for subsequent milestones.
