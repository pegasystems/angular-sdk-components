---
applyTo: "packages/angular-sdk-components/src/lib/_bridge/**"
description: "Use when modifying the PConnect bridge layer. Covers AngularPConnectService flow, SdkComponentMap, ComponentMapperComponent, and Redux store subscription patterns."
---
# PConnect Bridge Architecture

This directory is the SDK's integration layer that maps the PConnect component tree (provided by `@pega/constellationjs`) to Angular SDK components. The engine decides **what** to render; this bridge decides **how** to render it.

`@pega/constellationjs` provides: `PCore` (global API), `PConnect` (per-component API), and the Redux store (`PCore.getStore()`). The bridge consumes these to wire SDK components into the engine's component tree.

## Files

| File | Responsibility |
|------|---------------|
| `angular-pconnect.ts` | Injectable service that manages store subscriptions, component registration, prop comparison, action wiring, and form field lifecycle |
| `component-mapper/component-mapper.component.ts` | Dynamic component renderer — resolves component names to Angular component classes and creates them via `ViewContainerRef` |
| `helpers/sdk_component_map.ts` | Singleton component registry — maps names to Angular component classes |
| `helpers/sdk-pega-component-map.ts` | Pega-provided component registry (master map of all SDK components) |

## How AngularPConnectService Works

1. **Store subscription**: `subscribeToStore()` subscribes to `PCore.getStore()` with a wrapped callback that fires `onStateChange()` on the component
2. **Component registration**: `registerAndSubscribeComponent()` assigns a unique componentID, subscribes to the store, processes actions, registers form field, and returns an `AngularPConnectData` object with `compID`, `unsubscribeFn`, `validateMessage`, and `actions`
3. **Prop comparison**: `shouldComponentUpdate()` resolves current config props via `getComponentProps()`, deep-compares against previous props using `fast-deep-equal`, and returns `true` if the component should re-render
4. **Action wiring**: `processActions()` sets up `onChange` → `changeHandler` and `onBlur` → `eventHandler` on the PConnect node via `setAction()` (only for editable fields)
5. **Form field lifecycle**: `addFormField()` on registration, `removeFormField()` + context tree node removal on unsubscribe
6. **Validation**: Updates `angularPConnectData.validateMessage` from resolved props and triggers error/spinner messaging

```
Component ngOnInit()
  → registerAndSubscribeComponent(this, this.onStateChange)
    → processActions() sets onChange/onBlur
    → subscribeToStore() registers Redux listener
    → addFormField() registers in engine's form context
    → returns { compID, unsubscribeFn, validateMessage, actions }

Store changes → onStateChange() callback
  → checkAndUpdate()
    → shouldComponentUpdate(this)
      → getComponentProps() resolves configProps + additionalProps
      → deep compare against previous props
      → updates componentPropsArr[compID]
      → updates validateMessage
      → returns true/false
    → if true → updateSelf() (component-specific rendering logic)

Component ngOnDestroy()
  → unsubscribeFn()
    → removeFormField()
    → removeFieldNode/removeViewNode from context tree
    → store.unsubscribe()
```

### Key exports from angular-pconnect.ts
- `AngularPConnectService` — injectable service (`providedIn: 'root'`)
- `AngularPConnectData` — interface for the data returned by registration: `{ compID, unsubscribeFn, validateMessage, actions }`

### AngularPConnectService method summary
- **`registerAndSubscribeComponent(inComp, inCallback)`** — Main entry point: registers component, subscribes to store, wires actions, returns `AngularPConnectData`
- **`shouldComponentUpdate(inComp)`** — Returns `true` if props changed (component should re-render)
- **`getComponentID(inComp)`** — Returns the component's unique bridge ID
- **`getComponentProp(inComp, propName)`** — Returns a specific resolved prop value
- **`getCurrentCompleteProps(inComp)`** — Returns all current resolved props
- **`changeHandler(inComp, event)`** — Delegates to `pConn$.getActionsApi().changeHandler()`
- **`eventHandler(inComp, event)`** — Delegates to `pConn$.getActionsApi().eventHandler()`
- **`getStore()`** — Returns `PCore.getStore()` (cached)
- **`getState()`** — Returns current Redux state

## ComponentMapperComponent (component-mapper/)

Dynamic component renderer that creates Angular components at runtime:

1. **Resolution**: `getComponentFromMap(name)` looks up the component class from the registry
2. **Creation**: `ViewContainerRef.createComponent(component)` dynamically instantiates it
3. **Input binding**: `bindInputProps()` iterates over `props` object and calls `componentRef.setInput(key, value)` for each
4. **Output binding**: `bindOutputEvents()` subscribes to component `@Output()` EventEmitters
5. **Change detection**: `ngOnChanges()` reloads on name change, rebinds inputs on prop changes
6. **Error fallback**: If component not found, renders `ErrorBoundaryComponent`

```html
<!-- Usage in templates -->
<component-mapper name="TextInput" [props]="{ pConn$, formGroup$ }"></component-mapper>
<component-mapper name="View" [props]="{ pConn$: childPConn, formGroup$ }"></component-mapper>
```

### Inputs
- `name` — Component name as registered in the component map (e.g., `'TextInput'`, `'CaseView'`)
- `props` — Object of inputs to pass to the dynamically created component
- `errorMsg` — Error message for ErrorBoundary fallback
- `outputEvents` — Object mapping output event names to callback functions
- `parent` — Parent component reference (required when `outputEvents` is provided)

## SdkComponentMap (helpers/sdk_component_map.ts)

Singleton pattern with two component maps:

| Map | Source | Priority |
|-----|--------|----------|
| `localComponentMap` | `sdk-local-component-map.ts` | **Checked first** — consumer-side overrides |
| `pegaProvidedComponentMap` | `sdk-pega-component-map.ts` | Fallback — SDK's master component registry |

### Initialization
```typescript
// Called once during app startup (in FullPortal/Embedded component)
const theMap = await getSdkComponentMap(localSdkComponentMap);
```

### Component Lookup
```typescript
// Used by ComponentMapperComponent to resolve each component name
const Component = getComponentFromMap('TextInput');
// Resolution order: localComponentMap → pegaProvidedComponentMap → ErrorBoundary
```

### Key exports
- `SdkComponentMap` — The singleton instance (available after initialization)
- `getSdkComponentMap(localMap)` — Async factory; creates and initializes the singleton
- `getComponentFromMap(name)` — Synchronous lookup; returns Angular component class or ErrorBoundary

## Rules for Modifying Bridge Code

- **Do NOT create a separate Redux store** — `PCore.getStore()` IS the store
- **Do NOT bypass `ComponentMapperComponent`** for rendering PConnect-driven children — always use `<component-mapper>`
- **Do NOT bypass `AngularPConnectService`** for state management — all components must register/subscribe through it
- **Component map priority is intentional** — local always overrides Pega-provided
- **The bridge does NOT contain business logic** — it's purely a mapping/wiring/lifecycle layer
- **`SdkComponentMap` is a singleton** — only one instance exists per app lifecycle
- **Form field lifecycle is critical** — `addFormField` on init and `removeFormField` + context tree cleanup on destroy prevents 400 errors from stale field references
- **The `shouldComponentUpdate` deep comparison is intentional for performance** — do not replace with simple reference equality
- **`forwardRef(() => ComponentMapperComponent)`** is required in component imports to avoid circular dependencies
- **The `processActions` binding only applies to editable fields** — `isEditable()` guards this
