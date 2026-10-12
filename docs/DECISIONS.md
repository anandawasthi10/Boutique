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

### FE-35: Session resumption and uncommitted changes inspection
- **Question**: Uncommitted changes found in working directory during session resume: `app/about/`, `lib/config/about.ts`, `tests/A/fe-35.test.tsx`.
- **Decision**: Inspected changes and verified they belong to the unfinished ticket FE-35 (About the brand). The implementation holds all text in centralized config `lib/config/about.ts`, provides clearly marked client founder story placeholder copy, avoids invented history/awards/metrics/testimonials, renders responsive atelier figure with real alt text and captions, and includes comprehensive tests in `tests/A/fe-35.test.tsx`. Kept, verified against full test suite, and finalized for FE-35 commit.


