---
description: Add meaningful unit tests for a component or helper
agent: sdk-test-writer
---

Add unit tests for `${input:target:path or component name}`.

1. Read the code and list its behaviours (render branches, value propagation, store-driven updates, error paths).
2. Write specs with `createMockPConn()` and the helpers in `test-setup.ts`/`test-utils.ts` (`stubComponentMapper`, `getMappedComponents`, `getA11yViolations`).
3. Mutation-check each new test (break the behaviour, confirm it fails, restore).
4. Run `npm run test:unit` three times and `npm run verify`; report spec count and coverage change.
