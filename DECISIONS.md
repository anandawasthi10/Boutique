# Architecture Decisions & Specification Resolutions

See full architecture documentation in [docs/DECISIONS.md](docs/DECISIONS.md).

### Latest Decision: D-17 (Explore by Type Ivory & Plum Theme, Placeholder Fallback & Rose-Text Darkening)
- Applied Ivory and Plum theme to `#explore-by-type` with solid colors only, zero gradients/shadows/overlays.
- Section background set to solid ivory (`--color-ivory`). Divider set to line (`--color-line`).
- Darkened `--color-rose-text` from `#A55E7B` to `#9C5774` in `app/globals.css` ensuring WCAG AA contrast ratio (> 5.4:1) for small uppercase text on ivory background.
- Section title set to serif ink (`--color-ink`).
- Category cards: 4:5 image block with surface colour (`--color-surface`), 4px radius, no border/shadow/zoom. Categories without photography display "Photo coming soon" in 12px muted text with zero image network requests.
- Category titles: serif ink with thin plum underline on hover. Description: muted clamped to 2 lines.
- "All products": desktop plum text link with 4px underline offset; mobile 48px outline button with 1px plum border and solid plum hover.
- Focus outlines: 2px plum outline with 2px offset.
- Verified across 7 viewports (360x640, 390x844, 430x932, 768x1024, 1024x768, 1366x768, 1920x1080) with screenshots saved to `screenshots/theme/`.
