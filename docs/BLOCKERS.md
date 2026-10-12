# Blockers Log

This document records persistent build, test, or contract blockers after 5 genuine fix attempts.

---

### BL-01: Licensed sound files for audio feedback (FE-37)
- **Ticket**: FE-37 (Optional sounds)
- **Status**: Blocked
- **Reason**: No licensed audio files (for fabric swatch selection, add-to-cart, drawer opening) have been supplied by the client or team. As specified in Section 6 and Open Decisions in Feature Ticket List ("Licensed sound files block FE-37"), audio files must be officially licensed and their license source recorded in `/docs`.
- **Frontend Readiness**: Preference state (`usePreferences`) and header sound toggle control were fully implemented in FE-10 (`soundEnabled: false` by default, browser persistent). Playback wiring remains blocked until sound files are provided.

