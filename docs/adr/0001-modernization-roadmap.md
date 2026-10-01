# ADR 0001: Modernization roadmap

Status: Accepted

## Decision
Modernize in three phases, preserving the public contract with `pegasystems/angular-sdk` and `@pega/angular-sdk-overrides` consumers:

- **A (non-breaking):** CI quality gates, built-in control flow (`@if/@for`), dependency automation, ownership/PR hygiene.
- **B (additive):** type-safety ratchets, bridge refactor behind characterization tests, accessibility, DX tooling.
- **C (next major):** signal inputs, secondary entry points, strict null checks, with a migration guide.

`@Input()` -> `input()` and OnPush are deferred: overrides consumers subclass these components, so those are breaking changes.

## Phase A status
Done: `@if/@for` migration, blocking CI (lint, library build, API report check, overrides build, tarball smoke test, unit tests), release-please, Dependabot, `takeUntilDestroyed` for component-scoped RxJS subscriptions.

Public API: `etc/angular-sdk-components.api.md` is the committed API report. After an intentional change run `npm run build-angular-sdk-components && npm run api:update` and commit the result.

## Known gaps
- 43 legacy "should create" specs are `xdescribe`d (marked TODO): they need engine-level PConnect/PCore fixtures beyond the shared mocks in `src/test-setup.ts`. The remaining 104 specs run in CI.
- Karma is deprecated by Angular; moving to the `unit-test` builder (Vitest) and adding a coverage threshold is deferred until the skipped specs are restored.
- Store subscriptions in the bridge still use manual `unsubscribeFn` (covered by Phase B bridge refactor).
- Releases are proposed by release-please PRs; publishing (with npm provenance) remains a manual step.
