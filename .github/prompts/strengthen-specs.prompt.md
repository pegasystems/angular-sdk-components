---
description: Replace placeholder 'should create' specs with behaviour tests
agent: sdk-test-writer
---

Strengthen the placeholder specs for `${input:target:folder or component, for example template/list-view}` following the "Strengthening placeholder specs" section of the `sdk-write-unit-tests` skill. Keep every spec passing, mutation-check each new assertion, run `npm run verify`, and raise `coverageThresholds` in `angular.json` to just below the new coverage.
