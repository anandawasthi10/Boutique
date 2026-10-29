# Frontend Development Progress

See full progress log in [docs/PROGRESS.md](docs/PROGRESS.md).

## Featured Pieces - Ivory and Plum Theme Refinement
- **Status**: Completed
- **Changes**:
  - components/catalogue/ProductCard.tsx: Added tone?: 'on-ivory' | 'on-tint' prop. Supports solid ivory image blocks on surface backgrounds without border or shadow. Restyled titles to Cormorant Garamond serif with plum hover underline, prices to medium plum on own line, 2px plum focus rings, and zero-request "Image coming soon" placeholder blocks.
  - components/catalogue/ProductGrid.tsx: Added tone prop forwarding to product cards and matching skeleton tone.
  - app/page.tsx: Applied solid surface background, plum 20% alpha divider, muted uppercase eyebrow, ink serif heading, tone="on-tint" product grid, plum desktop link, and 48px mobile outline button to #featured-pieces.
  - docs/DECISIONS.md & DECISIONS.md: Documented D-18.
  - docs/PROGRESS.md & PROGRESS.md: Logged progress and verification.
- **Verification**: Verified via Playwright across all 7 target viewports (360x640, 390x844, 430x932, 768x1024, 1024x768, 1366x768, 1920x1080). Screenshots saved to screenshots/theme/.

## Ratings & Reviews - Ivory and Plum Theme Refinement
- **Status**: Completed
- **Changes**:
  - `app/globals.css`: Added `--color-rose-pale: #EBC6D2` in `:root` and `@theme`.
  - `components/reviews/ReviewsSection.tsx`: Applied solid plum background (`--color-plum`), 20% alpha ivory dividers, transparent verified pill with rose-light star, ivory serif heading, 82% ivory intro paragraph, 48px ivory "Write a Review" button, 48px outline "View on Google" button, and modal restyled in ivory/plum without blur.
  - `components/reviews/RatingOverview.tsx`: Restyled summary box on plum-raised without border/shadow; score in ivory serif, stars in rose-light, breakdown tracks in 22% alpha ivory and fills in rose-light, customer highlights in rose-pale/rose-light; filter pills and desktop speed/flow/playback controls restyled with ivory border/selected states and min 44px tap targets.
  - `components/reviews/ReviewsMarquee.tsx`: Removed edge-fade gradient overlays; replaced emerald status dot with rose-light; preserved mobile swipeable snap row and desktop marquee.
  - `components/reviews/ReviewCard.tsx`: Restyled review cards on plum-raised with 4px radius, no border, no shadow; initial avatars in rose-light with plum letter; tags in rose-pale; review body in 88% ivory with 1.6 line-height; heart/share buttons with min 44x44px touch targets; verified client in rose-pale.
  - `docs/DECISIONS.md` & `DECISIONS.md`: Documented Decision D-19.
  - `docs/PROGRESS.md` & `PROGRESS.md`: Logged task completion.
- **Verification**: Verified via Playwright in `e2e/reviews-section-theme.spec.ts` across 7 target viewports (360x640, 390x844, 430x932, 768x1024, 1024x768, 1366x768, 1920x1080). Screenshots saved to `screenshots/theme/`.
