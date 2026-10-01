---
description: Restore skipped legacy specs
agent: sdk-test-writer
---

Un-skip the remaining `xdescribe` specs (`grep -rl xdescribe packages/angular-sdk-components/src`) following the `sdk-unskip-specs` skill. Work in batches of about five, keep assertions meaningful, never re-skip, and run `npm run verify` after each batch. Finish by raising the coverage floor in `packages/angular-sdk-components/karma.conf.js` and updating the skipped-spec counts in `docs/testing.md` and `docs/adr/0001-modernization-roadmap.md`.
