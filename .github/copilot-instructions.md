# Copilot Instructions for angular-sdk-components

## Project Overview

This is the **Pega Constellation Angular SDK Components** monorepo (`@pega/angular-sdk-components` v25.1.12). It produces two npm packages consumed by the `angular-sdk` repo:

- **`@pega/angular-sdk-components`** — The core UI component library (fields, templates, widgets, infra, design system extensions) built with Angular and Material Design.
- **`@pega/angular-sdk-overrides`** — A package that allows customers to override existing components and apply custom modifications on top of the base components.

## Architecture

### Monorepo Structure

- `packages/angular-sdk-components/` — The publishable library (built via ng-packagr)
- `packages/angular-sdk-overrides/` — Override layer for customer customizations
- `projects/angular-test-app/` — Test application demonstrating both Portal and Embedded modes

### Core Layers

| Layer | Path | Purpose |
|-------|------|---------|
| Bridge | `src/lib/_bridge/` | `AngularPConnectService` connects Angular components to Pega's PConnect/PCore layer; `ComponentMapperComponent` dynamically resolves and renders components |
| Components | `src/lib/_components/` | UI components organized by category: `field/`, `template/`, `widget/`, `infra/`, `designSystemExtension/` |
| Helpers | `src/lib/_helpers/` | Utility functions (date formatting, currency, case utils, etc.) |
| Services | `src/lib/_services/` | Angular services (endpoints, server config, etc.) |
| Messages | `src/lib/_messages/` | Inter-component messaging (progress spinner, error messages) |

### Application Modes

- **Portal Mode** (`/portal`, `/fullportal`) — Full Pega portal experience with navigation, case management, and worklists. Uses `FullPortalComponent`.
- **Embedded Mode** (`/embedded`, `/mashup`) — Embeddable widget for integrating Pega case creation into external applications. Uses `EmbeddedComponent`.
- **Simple Portal** (`/simpleportal`) — Lightweight portal with basic navigation.

### Key Dependencies

- **`@pega/constellationjs`** (~0.26.1) — Core Constellation JS engine providing PCore, PConnect APIs, and DX API communication
- **`@pega/auth`** (~0.2.37) — OAuth authentication (portal and mashup client flows)
- **`@pega/pcore-pconnect-typedefs`** (~4.1.0) — TypeScript type definitions for PCore/PConnect globals
- **Angular** (^21.x) with **Angular Material** (^21.x) — UI framework and Material Design component library
- **dayjs** — Date manipulation
- **ngx-currency** — Currency input formatting
- **mat-tel-input** — Phone number input with country codes
- **TinyMCE** — Rich text editor

### Component Resolution

Components are resolved at runtime via `ComponentMapperComponent`:
1. Checks `localSdkComponentMap` (customer overrides in `sdk-local-component-map.ts`)
2. Falls back to `pegaSdkComponentMap` (Pega-provided defaults)

This is how the overrides package works — customers place their component implementations in the local map, which takes priority.

## Development Guidelines

### Build Commands

- `npm run build:prod` — Production build (lint + build)
- `npm run build:dev` — Development build (lint + build)
- `npm run start-dev` — Serve on port 3500
- `npm run build-angular-sdk-components` — Build just the component library
- `npm run build-overrides` — Build the overrides package
- `npm run lint` — Run ESLint + Prettier checks
- `npm run fix` — Auto-fix lint and format issues

### Testing

- **E2E tests**: Playwright (`npm run test`) — tests both Portal and Embedded modes against MediaCo sample app
- **Unit tests**: Karma/Jasmine (Angular standard)
- Test structure: `projects/angular-test-app/tests/e2e/` with `DigV2/` and `MediaCo/` suites

### Code Conventions

- Angular standalone components with `imports` array (no NgModules for new components)
- SCSS for styling
- `PCore` and `PConnect` are globals provided by `@pega/constellationjs` — do not import them, they are available at runtime
- All components subscribe to the Redux store via `AngularPConnectService` for state updates
- Use `ComponentMapperComponent` (`<component-mapper>`) to render child components dynamically
- Field components extend `FieldBase` (`field.base.ts`)
- Configuration is in `sdk-config.json` (auth, server URLs, app settings)

### Coding Standards

- TypeScript strict mode (with `noImplicitAny: false`)
- ESLint with sonarjs plugin for code quality
- Prettier for formatting
- No implicit returns, no fallthrough in switch statements
- Use `dayjs` for date operations (not native Date or moment)

### When Creating New Components

1. Create component in the appropriate category folder under `src/lib/_components/`
2. Export it from `public-api.ts`
3. Register it in the Pega SDK component map (`sdk-pega-component-map`)
4. Follow the existing pattern: inject `AngularPConnectService`, subscribe to store, implement `OnInit`/`OnDestroy`

### When Creating Override Components

1. The overrides package copies components from `src/lib/_components/` into `packages/angular-sdk-overrides/lib/`
2. Customers modify the copied components for their needs
3. Register overrides in `sdk-local-component-map.ts` to take priority over defaults

## Configuration

- `sdk-config.json` — SDK runtime config (auth, server URLs, app alias, case types)
- `angular.json` — Angular workspace config (two projects: library + test app)
- `tsconfig.json` / `tsconfig.build.json` — TypeScript configuration
- `eslint.config.mjs` — Flat ESLint config
- `playwright.config.js` — E2E test configuration
