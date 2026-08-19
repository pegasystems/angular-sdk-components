# Architecture & Runtime Flow

This repo produces two npm packages (`@pega/angular-sdk-components` and `@pega/angular-sdk-overrides`) consumed by the [Constellation Angular SDK](https://github.com/pegasystems/angular-sdk). The SDK provides an alternative Angular/Material frontend for the Pega Constellation architecture, connecting to the Pega Infinity platform through:

- **`@pega/constellationjs`** — the engine that manages case lifecycle, assignments, view hierarchy, and state. It provides the `PCore` global API and `PConnect` per-component API. It also owns the Redux store (`PCore.getStore()`).
- **`@pega/auth`** — handles OAuth 2.0 PKCE authentication with the Pega Infinity server.

The SDK does NOT talk to Pega REST APIs directly — all interaction with the platform goes through PCore/PConnect provided by `@pega/constellationjs`.

## Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Pega Infinity Server                              │
│  (Case engine, Rules, Data pages, REST APIs, OAuth 2.0 provider)        │
└────────────────────┬────────────────────────────────────────────────────┘
                     │ REST
┌────────────────────▼────────────────────────────────────────────────────┐
│                    Pega-Provided Packages (not SDK source)               │
│                                                                          │
│  @pega/auth                    @pega/constellationjs                     │
│  OAuth 2.0 PKCE login          bootstrap-shell.js → PCore global         │
│  loginIfNecessary()            Manages: case lifecycle, assignments       │
│  Token management              Owns: Redux store (PCore.getStore())      │
│                                Exposes: PConnect objects per component    │
└────────────────────┬────────────────────────────────────────────────────┘
                     │ PConnect objects (component tree metadata)
┌────────────────────▼────────────────────────────────────────────────────┐
│                 SDK Bridge Layer (this repo)                              │
│  AngularPConnectService: store subscriptions, prop comparison, actions   │
│  ComponentMapperComponent: dynamic component rendering via ViewContainer │
│  sdk_component_map.ts: component registry (local + Pega-provided)        │
└────────────────────┬────────────────────────────────────────────────────┘
                     │ @Input() props (pConn$, formGroup$, field values)
┌────────────────────▼────────────────────────────────────────────────────┐
│              SDK Angular / Material Components (this repo)                │
│  Field │ Template │ Widget │ Infra │ DesignSystemExtension                │
└─────────────────────────────────────────────────────────────────────────┘
```

## Startup Sequence

1. Browser loads `index.html` → Angular bootstraps `AppComponent`
2. Angular Router routes to `FullPortalComponent` (`/portal`) or `EmbeddedComponent` (`/embedded`)
3. `@pega/auth`: `loginIfNecessary()` initiates OAuth 2.0 PKCE flow → redirects to Infinity login → returns with auth code → exchanges for token
4. `@pega/constellationjs` bootstrap-shell loads → fires `SdkConstellationReady` event
5. `PCore.onPCoreReady(renderObj)` callback fires with the initial PConnect render tree
6. `getSdkComponentMap(localSdkComponentMap)` initializes the component registry (merges local + Pega-provided mappings)
7. `ComponentMapperComponent` dynamically creates the root SDK component via `ViewContainerRef.createComponent()`
8. For each child PConnect node, `<component-mapper>` resolves the component via `getComponentFromMap()` and renders it
9. `AngularPConnectService` subscribes each component to the Redux store for state-driven updates
10. SDK components render using Angular Material, interacting with the platform through `pConn$` API

## Two Application Modes

| Mode | URL | Entry Component | Use Case |
|------|-----|-----------------|----------|
| **Portal** | `/portal`, `/fullportal` | `FullPortalComponent` | Full case worker portal UI (NavBar, work queues, case views) |
| **Embedded** | `/embedded`, `/mashup` | `EmbeddedComponent` | Mashup — embeds a single case creation flow into external page |
| **Simple Portal** | `/simpleportal` | `NavigationComponent` | Lightweight portal with basic navigation |

## Authentication

- OAuth 2.0 Authorization Code with PKCE
- Config in `sdk-config.json` → `authConfig` section
- `portalClientId` for portal mode, `mashupClientId` for embedded
- Auth handled entirely by `@pega/auth` library — do NOT implement custom auth logic

## Component Anatomy

Every SDK component follows this structure:

```
component-name/
├── component-name.component.ts      # Angular component class
├── component-name.component.html    # Template
├── component-name.component.scss    # Styles
└── component-name.component.spec.ts # Unit test (optional)
```

### Props Interface

```typescript
// Base interface for field components (from _types/PConnProps.interface.ts)
export interface PConnFieldProps {
  label: string;
  required: boolean;
  disabled: boolean;
  value?: string;
  validatemessage: string;
  status?: string;
  onChange: any;
  onBlur?: any;
  readOnly: boolean;
  testId: string;
  helperText: string;
  displayMode?: string;
  hideLabel: boolean;
  placeholder?: string;
  visibility?: boolean;
}
```

### Component Resolution

Components are resolved by name through a 2-layer lookup in `getComponentFromMap()`:
1. Check `SdkComponentMap.getLocalComponentMap()` (from `sdk-local-component-map.ts`) — local overrides win
2. Check `SdkComponentMap.getPegaProvidedComponentMap()` (from `sdk-pega-component-map.ts`) — Pega reference
3. If not found → `ErrorBoundaryComponent` renders

Resolved components are dynamically instantiated via `ComponentMapperComponent` using Angular's `ViewContainerRef.createComponent()`. Inputs are bound via `componentRef.setInput()`.

### Component Lifecycle (Bridge Integration)

```
ngOnInit()
  → AngularPConnectService.registerAndSubscribeComponent(this, onStateChange)
    → assigns compID, subscribes to Redux store, wires onChange/onBlur actions
    → registers form field in engine context tree

Store changes → onStateChange() → checkAndUpdate()
  → shouldComponentUpdate() deep-compares props (fast-deep-equal)
  → if changed → updateSelf() (component re-reads configProps and updates view)

ngOnDestroy()
  → unsubscribeFn() → removeFormField + context tree cleanup + store unsubscribe
```

Field components inherit this lifecycle from `FieldBase`. Template and widget components implement it directly via `AngularPConnectService` injection.

## Key Globals

Set by `@pega/constellationjs`, available at runtime (do not import — they are globals):

| Global | What it provides |
|--------|-----------------|
| `PCore` | Engine API — store, environment info, constants, component lifecycle |
| `PCore.getStore()` | Redux store (read case state, subscriptions) |
| `PCore.onPCoreReady(cb)` | Callback when engine initialization complete |
| `PCore.getConstants()` | Enum values for selection modes, render modes, etc. |
| `PCore.getEnvironmentInfo()` | Server environment details, locale, timezone |
| `PCore.getLocaleUtils()` | Localization utilities (`getLocaleValue`) |
| `PCore.getDataApiUtils()` | Data page access (`getData`, `getDataAsync`) |
| `PCore.getContextTreeManager()` | Context tree node management |

### PCore & PConnect API Reference

For the full list of available methods on `PCore` and the `PConnect` object (passed as `pConn$` `@Input()`), read the TypeScript typedefs at `node_modules/@pega/pcore-pconnect-typedefs/`. These are the authoritative, version-locked API definitions for this project.

## Override System

The `@pega/angular-sdk-overrides` package mirrors the component directory structure. SDK consumers:
1. Install `@pega/angular-sdk-overrides`
2. Copy the component they want to customize into their project
3. Modify the TypeScript source directly (overrides package contains raw `.ts` files, not compiled output)
4. Register it in their local component map (`sdk-local-component-map.ts`) — overrides take priority

Generated via `npm run build-overrides` which:
1. Copies `src/lib/_components/` to `packages/angular-sdk-overrides/lib/`
2. Rewrites relative imports (`../`) to `@pega/angular-sdk-components` package references

## sdk-config.json

Runtime configuration loaded at startup:

| Section | Purpose |
|---------|---------|
| `authConfig.portalClientId` | OAuth client ID for portal mode |
| `authConfig.mashupClientId` | OAuth client ID for embedded/mashup mode |
| `authConfig.mashupUserIdentifier` | Pre-set user for embedded (e.g., `customer@mediaco`) |
| `serverConfig.infinityRestServerUrl` | Full URL to Pega Infinity REST server |
| `serverConfig.appAlias` | Application alias (e.g., `MediaCo`) |
| `serverConfig.appPortal` | Specific portal to load (blank = operator default) |
| `serverConfig.appMashupCaseType` | Case type for embedded mode |
| `serverConfig.excludePortals` | Portals to skip (admin/system portals) |
| `serverConfig.showModalsInEmbeddedMode` | Whether to show modals in embedded mode |
| `theme` | `"light"` or `"dark"` |

## Monorepo Structure

```
angular-sdk-components/
├── packages/
│   ├── angular-sdk-components/     # Library source (built via ng-packagr)
│   │   ├── src/
│   │   │   ├── public-api.ts       # All public exports (entry point)
│   │   │   ├── sdk-local-component-map.ts  # Customer override map
│   │   │   └── lib/
│   │   │       ├── _bridge/        # AngularPConnectService + ComponentMapper
│   │   │       ├── _components/    # field/ template/ widget/ infra/ designSystemExtension/
│   │   │       ├── _helpers/       # Utility functions
│   │   │       ├── _services/      # Angular services
│   │   │       ├── _messages/      # Inter-component messaging
│   │   │       └── _types/         # TypeScript interfaces
│   │   └── ng-package.json         # ng-packagr config (dest: dist/)
│   └── angular-sdk-overrides/      # Override package (generated)
├── projects/
│   └── angular-test-app/           # Test application (Portal + Embedded modes)
│       ├── src/app/_samples/       # FullPortal, Embedded, SimplePortal
│       └── tests/e2e/              # Playwright E2E tests
├── scripts/                        # Build automation
├── angular.json                    # Angular workspace (2 projects: library + app)
└── sdk-config.json                 # Runtime config
```
