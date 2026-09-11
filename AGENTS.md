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

## Tech Stack & Tooling

| Layer | Technology |
|-------|-----------|
| UI Framework | Angular (^21.x) |
| Component Library | Angular Material (^21.x) |
| Language | TypeScript |
| Bundler | ng-packagr (library), Angular CLI (app) |
| Date handling | Day.js |
| Rich Text | TinyMCE (via @tinymce/tinymce-angular) |
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

3. **Every new component must be registered in TWO places.** Export from `public-api.ts` AND register in `sdk-pega-component-map.ts`. Missing either makes the component invisible.

4. **Template children must go through `<component-mapper>`.** Templates render children by iterating `pConn$.getChildren()` and passing each child's `getPConnect()` to `<component-mapper>`. Never render PConnect children by directly referencing Angular component selectors.

5. **`ComponentMapperComponent` must be imported via `forwardRef()`.** Use `forwardRef(() => ComponentMapperComponent)` in the `imports` array to avoid circular dependencies. This is required for any component that renders children.

6. **Field components must extend `FieldBase`.** This base class provides the full store subscription lifecycle (register, subscribe, checkAndUpdate, unsubscribe). Do not reimplement this manually in field components.

7. **PCore/PConnect API reference lives in `node_modules/@pega/pcore-pconnect-typedefs/`.** When you need to know what methods are available on `pConn$` or `PCore`, read the `.d.ts` files there — they are the authoritative, version-locked API definitions.

8. **The `$` suffix convention is meaningful.** Properties suffixed with `$` (e.g., `value$`, `label$`, `pConn$`, `configProps$`) are template-bound. Boolean template properties use the `b` prefix (e.g., `bVisible$`, `bReadonly$`). This is a codebase-wide convention, not an Observable convention.
