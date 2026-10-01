# AGENTS.md — Angular SDK Components

## Project Identity

This is the **Angular SDK Components** repository — the source for two npm packages consumed by the [Constellation Angular SDK](https://github.com/pegasystems/angular-sdk):

| Package | Purpose |
|---------|---------|
| `@pega/angular-sdk-components` | Bridge (PConnect integration) + SDK components built with Angular Material |
| `@pega/angular-sdk-overrides` | Override templates for SDK consumers who want to customize components |

The Angular SDK (`pegasystems/angular-sdk`) is the main project developers use to build applications. This repo provides the component source code and bridge that the Angular SDK depends on.

For architecture, runtime flow, startup sequence, and how the SDK connects to the Pega platform, see [docs/architecture.md](docs/architecture.md).

---

## Start Here (for AI agents and new contributors)

**The loop:** make a change → `npm run verify -- --quick` (≈10 s, static checks) → before finishing `npm run verify` (≈30 s: lint, library build, public-API report, overrides build + type-check, tarballs, unit tests). Use `npm run verify -- --json` for machine-readable results and `--only unit,api` to rerun specific steps. A failing step prints its log tail and the exact fix command.

**Definition of done** — a change is complete when all of these hold:

1. `npm run verify` passes.
2. New/changed behaviour has a unit test (harness: `docs/testing.md`; use `createMockPConn()`, never hand-roll a PCore).
3. New components were created with `npm run new:component` (or are registered in BOTH `public-api.ts` and `sdk-pega-component-map.ts`), and `npm run docs:components` was rerun.
4. Public API changes are intentional: `npm run api:update` and the report diff is committed.
5. You did not add implicit-`any` errors (`check:any`); lowering the baseline with `npm run check:any:update` after fixing errors is welcome.
6. Conventional commit message (`feat:`, `fix:`, `chore:`, `docs:` ...) — enforced by commitlint.
6a. User-visible changes (features, fixes, behaviour, dependencies consumers see) have a `CHANGELOG.md` entry in the established format: `npm run changelog -- add --type <feature|fix|refactor> --pr <n> --text "..."` (open the PR first to get the number; skill `sdk-changelog`). `npm run changelog:check` is part of `verify`.
7. You state what was NOT verified. E2E (Playwright) needs a Pega Infinity server; if you changed rendering behaviour, say E2E was not run.

**Task recipes**

| Task | Do this |
|------|---------|
| Add a field/template/widget component | `npm run new:component -- field star-rating StarRating`, implement, add a spec, `npm run verify` |
| Fix a component bug | Reproduce in a unit spec first (mock `pConn$`), fix, `npm run verify` |
| Change the bridge (`_bridge/`) | Read `.github/instructions/bridge.instructions.md`; extend `angular-pconnect.service.spec.ts` BEFORE changing behaviour |
| Change `sdk-config.json` handling | `scripts/lib/sdk-config.js` + `scripts/__tests__`; docs in `docs/configuration.md` |
| Update docs for a component list | `npm run docs:components` (generated; do not hand-edit `docs/components.md`) |
| Public API changed | `npm run build-angular-sdk-components && npm run api:update` |

**Pitfalls that cost time**

- `npm run build` (test app) writes to `dist/` and **replaces the library build**. Run `npm run build-angular-sdk-components` again before `check:overrides`/`api:check` (`verify` does this for you).
- `packages/angular-sdk-overrides/lib` is generated and git-ignored; edit the source components and run `npm run build-overrides`.
- Unit tests: `component -> mapper -> component map -> component` is an import cycle that only initialises when entered through the map. `src/_hooks.spec.ts` (loads first, hence the underscore) does that; never import the component map from a spec, and always include `_hooks.spec.ts` when running a single spec file with `--include`. Use `stubComponentMapper()` to test a component without rendering its children. The bridge caches `PCore.getStore()` per service instance, so call `TestBed.resetTestingModule()` before swapping it.
- Field components are `OnPush` when they only change state synchronously. State changed from promises/timers/subscriptions needs `markForCheck()` (or stay on Default). Store-driven updates are flagged by the bridge via `FieldBase.markForCheck()`.
- `ng test` runs in random order; a spec that passes alone but fails in the suite is leaking global state (`PCore`, `TestBed`).
- Do not rely on `console` output in unit tests; spy on it.
- Use the `view`/search tools on `packages/angular-sdk-components/src`; avoid reading `dist/`, `node_modules/` (except `@pega/pcore-pconnect-typedefs/`) and `package-lock.json`.

**Map of the docs** (all in `docs/`): `architecture.md` (runtime flow), `testing.md`, `configuration.md`, `ci-cd.md`, `customizing.md`, `theming.md`, `troubleshooting.md`, `components.md` (generated catalogue), `adr/` (decisions and the reasons for deferred work). Scoped rules for each area live in `.github/instructions/`. Reusable prompts: `.github/prompts/`; specialised agents: `.github/agents/`; skills: `.github/skills/`.

**Agents** (`.github/agents/`): `sdk-component-author` (build/change components end to end), `sdk-bug-fixer` (reproduce-first fixes), `sdk-bridge-engineer` (bridge changes with invariants), `sdk-test-writer` (tests, un-skipping specs, coverage), `sdk-a11y-auditor` (WCAG audit and fixes), `sdk-docs-maintainer` (docs/ADR/agent-asset drift), `sdk-release-manager` (release preparation with confirmation gates), `sdk-reviewer` (read-only review).

**Skills** (`.github/skills/`, load the one that matches the task): `sdk-add-component`, `sdk-pconnect-api`, `sdk-write-unit-tests`, `sdk-unskip-specs`, `sdk-change-detection`, `sdk-public-api-change`, `sdk-debug-rendering`, `sdk-override-component`, `sdk-upgrade-dependencies`, `sdk-localization`, `sdk-accessibility`, `sdk-docs`, `sdk-changelog`, `sdk-release`, `sdk-verify`. `npm run check:agents` (part of `verify`) keeps these files consistent with the real npm scripts.

---

## Version Constraints (do not change without an explicit decision)

- **Angular 21.x** (latest 21.x patch; Angular 22 is out of scope), Angular Material/CDK 21.x.
- **Node 24.x** (`engines: ^24.0.0`; CI uses 24.x).
- **TypeScript 5.9.x** (`^5.9.3`, locked at 5.9.3; never 6 or 7: Angular 21 supports `>=5.9 <6.0`).
- Update within these lines only (`sdk-upgrade-dependencies`); a major bump of any of them is a breaking change for consumers.

## Tech Stack & Tooling

| Layer | Technology |
|-------|-----------|
| UI Framework | Angular (^21.x) |
| Component Library | Angular Material (^21.x) |
| Language | TypeScript |
| Bundler | ng-packagr (library), Angular CLI (app) |
| Date handling | Day.js |
| Rich Text | Tiptap (via @tiptap/core and @tiptap/starter-kit) |
| Styling | SCSS |
| Auth | @pega/auth (OAuth 2.0 PKCE) |
| Engine | @pega/constellationjs (provides PCore/PConnect APIs, owns Redux store) |
| Unit Tests | Karma + Jasmine |
| E2E Tests | Playwright |
| Linting | ESLint (with sonarjs) + Prettier |

---

## Directory Map

```
angular-sdk-components/
├── packages/
│   ├── angular-sdk-components/     # Main source — DO NOT confuse with the consuming angular-sdk repo
│   │   ├── src/
│   │   │   ├── public-api.ts      # All public exports — every new component MUST be listed here
│   │   │   ├── sdk-local-component-map.ts  # Local component overrides — customer use only
│   │   │   └── lib/
│   │   │       ├── _bridge/       # AngularPConnectService + ComponentMapper (modify with care)
│   │   │       ├── _components/   # SDK components: field/, template/, widget/, infra/, designSystemExtension/
│   │   │       ├── _helpers/      # Utility functions (event-util, date-format, case-utils, etc.)
│   │   │       ├── _services/     # Angular services (endpoints, server config)
│   │   │       ├── _messages/     # Inter-component messaging (spinner, errors)
│   │   │       └── _types/        # PConnFieldProps interface
│   │   └── ng-package.json        # ng-packagr config (entry: public-api.ts, dest: dist/)
│   └── angular-sdk-overrides/      # Generated override package — do not edit directly
├── projects/
│   └── angular-test-app/           # Test application
│       ├── src/app/_samples/       # FullPortal, Embedded, SimplePortal entry components
│       └── tests/                  # Playwright E2E tests (common.js, config.js, e2e/)
├── scripts/                        # Node.js build automation — see build-scripts.instructions.md
├── docs/                           # Architecture docs
├── sdk-config.json                 # Runtime config: Infinity URL, OAuth client IDs, app settings
├── angular.json                    # Angular workspace (2 projects: library + test app)
└── tsconfig.json                   # TypeScript config
```

---

## Commands

| Command | What it does |
|---------|-------------|
| `npm run build-angular-sdk-components` | ng-packagr build → `dist/angular-sdk-components/` |
| `npm run build:dev` | Lint + Angular CLI dev build → `dist/` |
| `npm run build:prod` | Lint + Angular CLI prod build (brotli/gzip) → `dist/` |
| `npm run start-dev` | Angular dev server (port 3500) |
| `npm run start-dev-https` | Same but with HTTPS (uses `keys/`) |
| `npm run start-prod` | Angular prod server (port 3500) |
| `npm run test` | Playwright E2E (chromium, MediaCo portal+embedded) |
| `npm run lint` | ESLint + Prettier check |
| `npm run fix` | ESLint + Prettier auto-fix |
| `npm run build-overrides` | Generate override templates package |
| `npm run create_and_install_sdk_packages` | Build, pack, and install into angular-sdk repo |
| `npm run verify` / `verify -- --quick` | **Run all CI checks with a compact report** (see Start Here) |
| `npm run test:coverage` | Unit tests with coverage and a threshold floor (`packages/angular-sdk-components/karma.conf.js`) |
| `npm run test:unit` | Headless Karma/Jasmine unit tests (no Pega server) — see docs/testing.md |
| `npm run new:component -- <kind> <kebab-name> <PegaName>` | Scaffold a component and register it in `public-api.ts` + component map |
| `npm run check:any` / `check:any:update` | `noImplicitAny` per-file ratchet (do not add new implicit-any errors) |
| `npm run api:check` / `api:update` | Public API report guard (`etc/angular-sdk-components.api.md`) |
| `npm run check:overrides` | Type-check the generated overrides package against the built library |
| `npm run doctor` / `npm run configure` | Pre-flight environment check / render `sdk-config.json` from `SDK_*` env vars (see docs/configuration.md) |
| `npm run changelog -- add ...` / `changelog:check` | Add/validate `CHANGELOG.md` entries in the project's format (skill `sdk-changelog`) |
| `npm run release:version -- <x.y.z>` | Set the release version in root, both packages and the lock file (skill `sdk-release`) |
| `npm run check:agents` | Validate agent/skill front matter and that every npm script they mention exists |
| `npm run test:scripts` | Unit tests for the tooling scripts (`scripts/__tests__`) |
| `npm run docs:components` | Regenerate `docs/components.md` from the component map |

### Prerequisites

1. Node.js (LTS) + npm
2. `npm install` at root
3. For E2E tests: app running at `http://localhost:3500` + Pega Infinity server accessible

---

## Prohibitions & Do-Not-Touch Zones

| Rule | Reason |
|------|--------|
| No direct REST calls to Infinity | All data access goes through `pConn$` (PConnect) API |
| Do not edit `sdk-pega-component-map.ts` without adding the corresponding component | This file is the SDK's master component registry — every new component must be imported and mapped here. Only add entries; do not remove or rename existing ones without updating all references |
| Do not edit `sdk-local-component-map.ts` in base development | This file is for customer overrides only — base SDK development never touches it |
| Do not edit files in `dist/` | Build output — regenerated on every build |
| Do not create a custom Redux store | Use `PCore.getStore()` — the engine owns all state |
| Do not bypass PConnect for component data | PConnect manages lifecycle, visibility, validation |
| Do not bypass `AngularPConnectService` for state | All components must register/subscribe through the bridge service |
| Do not bypass `<component-mapper>` for rendering children | Dynamic component creation must go through ComponentMapperComponent |
| Do not modify `@pega/constellationjs` bundles | Pre-built engine, not source code |
| Do not hardcode auth tokens or Infinity URLs | Use `@pega/auth` and `sdk-config.json` |
| Do not commit `node_modules/` or `dist/` | Build artifacts — recreate via npm scripts |
| Do not forget `public-api.ts` exports | New components invisible to consumers without explicit export |
| Infra/container components (`_components/infra/Containers/`) | Can be modified but require extra vigilance: changes must be backward compatible, well-tested, and include clear comments explaining the reasoning. These are rarely changed and affect the entire rendering pipeline |

---

## Repo-Specific Conventions

These are non-obvious rules specific to this codebase that a new contributor would get wrong:

1. **Field value propagation differs by field type.** Text-input fields buffer locally and propagate on blur. Selection fields propagate immediately on change. Both must go through the shared `handleEvent()` utility in `_helpers/event-util.ts` — never call the engine's action API directly for field change/blur scenarios.

2. **Display mode rendering delegates to the design system extension.** Field components must never render raw markup for read-only display. They delegate to a `FieldValueList` component resolved via `<component-mapper>`.

3. **Every new component must be registered in TWO places.** Export from `public-api.ts` AND register in `sdk-pega-component-map.ts`. Missing either makes the component invisible. `npm run new:component` does both.

4. **Template children must go through `<component-mapper>`.** Templates render children by iterating `pConn$.getChildren()` and passing each child's `getPConnect()` to `<component-mapper>`. Never render PConnect children by directly referencing Angular component selectors.

5. **`ComponentMapperComponent` must be imported via `forwardRef()`.** Use `forwardRef(() => ComponentMapperComponent)` in the `imports` array to avoid circular dependencies. This is required for any component that renders children.

6. **Field components must extend `FieldBase`.** This base class provides the full store subscription lifecycle (register, subscribe, checkAndUpdate, unsubscribe). Do not reimplement this manually in field components.

7. **PCore/PConnect API reference lives in `node_modules/@pega/pcore-pconnect-typedefs/`.** When you need to know what methods are available on `pConn$` or `PCore`, read the `.d.ts` files there — they are the authoritative, version-locked API definitions.

8. **The `$` suffix convention is meaningful.** Properties suffixed with `$` (e.g., `value$`, `label$`, `pConn$`, `configProps$`) are template-bound. Boolean template properties use the `b` prefix (e.g., `bVisible$`, `bReadonly$`). This is a codebase-wide convention, not an Observable convention.
