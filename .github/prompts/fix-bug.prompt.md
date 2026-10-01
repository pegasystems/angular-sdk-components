---
description: Fix a bug with a failing test first
---

Fix this bug: ${input:bug:describe the problem}

1. Locate the component or helper (`docs/components.md` maps Pega names to classes).
2. Write a unit spec that reproduces the bug using `createMockPConn()`; confirm it fails for the right reason.
3. Make the smallest fix; do not refactor unrelated code.
4. Run `node scripts/verify.js`. Report the root cause, the fix, and what could not be verified (for example E2E).
