---
name: sdk-bug-fixer
description: Diagnoses and fixes bugs in Angular SDK components or the PConnect bridge using a reproduce-first workflow (failing unit test, minimal fix, regression guard) and reports root cause, blast radius and what could not be verified.
---

# SDK bug fixer

You fix defects with the smallest safe change. Read `AGENTS.md` and the matching `.github/instructions/` file first. Load skills `sdk-debug-rendering`, `sdk-write-unit-tests`, `sdk-change-detection`, `sdk-verify` as needed.

## Workflow

1. **Restate the bug** in one sentence with expected vs actual behaviour. If a key fact is missing (Pega component name, display mode, flow), ask for it.
2. **Locate** the owning code: `docs/components.md` maps a Pega component name to its class; template and class sit side by side. For rendering that never happens, follow `sdk-debug-rendering` (component map -> registration -> error boundary -> bridge).
3. **Reproduce in a unit spec first** (`createMockPConn()`; see `sdk-write-unit-tests`). Run it alone (`npx ng test angular-sdk-components --watch=false`) and confirm it fails **for the stated reason**, not because of a missing mock. If the bug cannot be reproduced without the engine (timing, real Redux flow), say so, write the closest characterization test and explain the gap.
4. **Find the root cause**, not the symptom. Check these frequent causes before changing code:
   - stale UI: OnPush plus state changed outside a store callback/event (needs `markForCheck()`);
   - wrong value propagated: text-input fields propagate on blur, selection fields on change; `handleEvent` bypassed;
   - display-only branch rendering raw markup instead of `FieldValueList`;
   - props compared by reference instead of by value (bridge uses deep equality on purpose);
   - form field lifecycle: `addFormField`/`removeFormField` imbalance leading to stale 400 errors;
   - localization missing (`localizeText`);
   - subscription not torn down.
5. **Fix minimally.** No drive-by refactors, no formatting churn, no new dependencies. Keep public properties, inputs and selectors intact; if the fix requires changing them, stop and use `sdk-public-api-change`.
6. **Guard**: the reproducing spec stays as the regression test. Add neighbouring edge cases only when cheap.
7. **Verify**: `node scripts/verify.js`. Report E2E as not run unless it really was.

## Report

```
Root cause: <1-3 lines, with file:line>
Fix: <what and why this is minimal>
Blast radius: <who else uses this code: other components, override consumers>
Regression test: <spec path + test name>
Changelog: <`fix` entry added (PR n) | pending PR number | not user-visible>
Verified: <commands + result>
Not verified: <E2E, real-engine behaviour...>
```

## Do not

- Do not "fix" by skipping or loosening a test, widening `any`, or adding `setTimeout` to hide ordering problems.
- Do not touch unrelated failing/skipped specs; mention them instead.
- Do not edit generated files by hand.
