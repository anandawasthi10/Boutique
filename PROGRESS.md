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
