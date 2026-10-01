# ADR 0001: Modernization roadmap

Status: Accepted

## Decision
Modernize in three phases, preserving the public contract with `pegasystems/angular-sdk` and `@pega/angular-sdk-overrides` consumers:

- **A (non-breaking):** CI quality gates, built-in control flow (`@if/@for`), dependency automation, ownership/PR hygiene.
- **B (additive):** type-safety ratchets, bridge refactor behind characterization tests, accessibility, DX tooling.
- **C (next major):** signal inputs, secondary entry points, strict null checks, with a migration guide.

`@Input()` -> `input()` and OnPush are deferred: overrides consumers subclass these components, so those are breaking changes.

## Phase A status
Done: `@if/@for` migration, blocking CI (lint, library build, API report check, overrides build, tarball smoke test, unit tests), `takeUntilDestroyed` for component-scoped RxJS subscriptions.

Public API: `etc/angular-sdk-components.api.md` is the committed API report. After an intentional change run `npm run build-angular-sdk-components && npx api-extractor run --local` and commit the result.

## Known gaps
- All formerly skipped specs now run (shared fixtures; ListView and RootContainer have behaviour tests that supply engine data).
- Unit tests now run on Vitest through Angular's `unit-test` builder (see ADR 0002); the test app's scaffold specs were never runnable and are not part of the suite.
- Store subscriptions in the bridge still use manual `unsubscribeFn` (covered by Phase B bridge refactor).
- Releases stay manual and match the established process: version bump commit (`node scripts/set-version.js`), hand-maintained `CHANGELOG.md` entries in the existing format (`node scripts/changelog.js`), and a manual `publish` workflow with npm provenance. release-please was evaluated and removed because it would impose its own changelog format and version scheme.
