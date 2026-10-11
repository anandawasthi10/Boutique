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
