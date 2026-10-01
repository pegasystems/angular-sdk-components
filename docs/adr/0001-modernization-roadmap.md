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

Public API: `etc/angular-sdk-components.api.md` is the committed API report. After an intentional change run `npm run build-angular-sdk-components && npm run api:update` and commit the result.

## Known gaps
- 2 legacy specs remain `xdescribe`d with a specific TODO each (`ListViewComponent`, `RootContainerComponent`: they need dedicated list-context and portal-bootstrap fixtures). All other formerly skipped specs now run with shared fixtures (`createMockChild`, `stubComponentMapper`, `getMappedComponents`).
- Karma is deprecated by Angular; moving to the `unit-test` builder (Vitest) and adding a coverage threshold is deferred until the skipped specs are restored.
- Store subscriptions in the bridge still use manual `unsubscribeFn` (covered by Phase B bridge refactor).
- Releases stay manual and match the established process: version bump commit (`npm run release:version`), hand-maintained `CHANGELOG.md` entries in the existing format (`npm run changelog`, skill `sdk-changelog`), and a manual `publish` workflow with npm provenance. release-please was evaluated and removed because it would impose its own changelog format and version scheme.
