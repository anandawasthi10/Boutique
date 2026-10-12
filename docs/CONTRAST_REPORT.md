# Colour Contrast Report (WCAG 2.1 AA Compliance)

This report audits the contrast ratios for all text and background colour pairings derived from the design tokens specified in the Frontend Specification and configured in `app/globals.css`.

---

## 1. Design Token Definitions

| Token Name | Hex Code | Role |
| --- | --- | --- |
| `--color-bg` | `#FAF6EF` | Global Page Canvas Background |
| `--color-surface` | `#F3EBDD` | Cards, Drawers, Modals Background |
| `--color-surface-alt` | `#EDE2D1` | Configurator Panels, Alternating Sections |
| `--color-border` | `#E3D8C9` | Dividers, Borders, Outlines |
| `--color-primary` | `#4A3A33` | Primary Action Buttons, Brand Accents |
| `--color-text` | `#4A3A33` | Primary Body Text, Headings, Form Labels |
| `--color-text-muted` (Original) | `#7A655B` | Subheadings, Captions, Secondary Labels |
| `--color-text-muted` (Adjusted) | `#735E54` | Darkened for strict WCAG AA on `--color-surface-alt` |
| `--color-primary-text` | `#FAF6EF` | High-contrast text on Primary Buttons |
| `--color-error` | `#B3463F` | Error Messages, Destructive States |
| `--color-warning` (Original) | `#B7883A` | Warning notifications |
| `--color-warning` (Adjusted) | `#855A12` | Accessible amber for warning text and icons |
| `--color-sage-deep` | `#6F8470` | Non-text badges, graphical UI elements |

---

## 2. Text on Background Contrast Matrix

WCAG 2.1 AA requirements:
- **Normal text (< 18pt or < 14pt bold)**: Minimum 4.5:1
- **Large text (>= 18pt or >= 14pt bold)**: Minimum 3.0:1
- **UI components & Graphical objects**: Minimum 3.0:1

### Comprehensive Contrast Audit Table

| Foreground Token | Background Token | Contrast Ratio | Evaluation | Fix / Rule Applied |
| --- | --- | --- | --- | --- |
| `text` (`#4A3A33`) | `bg` (`#FAF6EF`) | **10.03:1** | **Pass (AAA)** | Primary copy on default canvas |
| `text` (`#4A3A33`) | `surface` (`#F3EBDD`) | **9.12:1** | **Pass (AAA)** | Primary copy on cards & panels |
| `text` (`#4A3A33`) | `surface-alt` (`#EDE2D1`) | **8.44:1** | **Pass (AAA)** | Primary copy on alternating panels |
| `text` (`#4A3A33`) | `border` (`#E3D8C9`) | **7.68:1** | **Pass (AAA)** | Input field text on borders |
| `text-muted` (`#735E54`) | `bg` (`#FAF6EF`) | **5.64:1** | **Pass (AA)** | Captions on default canvas |
| `text-muted` (`#735E54`) | `surface` (`#F3EBDD`) | **5.13:1** | **Pass (AA)** | Captions on cards |
| `text-muted` (`#735E54`) | `surface-alt` (`#EDE2D1`) | **4.74:1** | **Pass (AA)** | *Fixed from original #7A655B (4.27:1) by darkening to #735E54* |
| `primary-text` (`#FAF6EF`) | `primary` (`#4A3A33`) | **10.03:1** | **Pass (AAA)** | Button label on primary button background |
| `error` (`#B3463F`) | `bg` (`#FAF6EF`) | **5.04:1** | **Pass (AA)** | Form field error messages |
| `error` (`#B3463F`) | `surface` (`#F3EBDD`) | **4.59:1** | **Pass (AA)** | Error alerts inside surface cards |
| `warning` (`#855A12`) | `bg` (`#FAF6EF`) | **5.62:1** | **Pass (AA)** | *Fixed from original #B7883A (2.96:1) by adjusting to #855A12* |
| `warning` (`#855A12`) | `surface` (`#F3EBDD`) | **5.11:1** | **Pass (AA)** | Warning notifications inside cards |
| `warning` (`#855A12`) | `surface-alt` (`#EDE2D1`) | **4.73:1** | **Pass (AA)** | Warning notifications on alternating panels |
| `sage-deep` (`#6F8470`) | `bg` (`#FAF6EF`) | **3.74:1** | **Pass (UI / Large AA)** | Reserved for graphical badges and icons, not small body copy |
| `sage-deep` (`#6F8470`) | `surface` (`#F3EBDD`) | **3.40:1** | **Pass (UI / Large AA)** | Reserved for graphical badges and icons, not small body copy |

---

## 3. Summary of Discovered Failures & Fixes Applied

1. **Warning Token Text Contrast**:
   - *Issue*: Original token `#B7883A` on `#FAF6EF` yielded a contrast ratio of `2.96:1`, failing the WCAG AA threshold of `4.5:1`.
   - *Fix Applied*: Darkened `--color-warning` to `#855A12`, yielding `5.62:1` on page canvas and `5.11:1` on surface cards.
2. **Muted Text on Surface-Alt**:
   - *Issue*: Original token `#7A655B` on `--color-surface-alt` (`#EDE2D1`) yielded `4.27:1`, marginally below normal text threshold (4.5:1).
   - *Fix Applied*: Refined `--color-text-muted` to `#735E54`, increasing contrast to `4.74:1` on `--color-surface-alt` and `5.64:1` on default canvas.
3. **Usage Guardrails**:
   - `primary-text` (`#FAF6EF`) is strictly restricted to dark surfaces (primarily `--color-primary` `#4A3A33`).
   - Accent shades (`#9CAF98`, `#E8C4C0`, `#B9A9D1`) are used solely as background tints or decorative swatches, paired with dark text (`#4A3A33`).
