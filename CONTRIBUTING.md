# Contributing to Seyn

Keep contributions small, reviewable, and consistent with the existing desktop music-player structure.

Before submitting a change:

```bash
npm ci
npm run build
```

Check that the change does not add credentials, personal media, cache files, `.env` files, or generated installer output. Preserve the existing dark/light theme behavior, keyboard-accessible controls, playback contexts, history semantics, and playlist ordering.

By submitting a contribution, you confirm that you have the right to submit it and understand that original Seyn project code remains reserved under `LICENSE` unless a separate written agreement says otherwise.
