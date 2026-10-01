---
name: sdk-debug-rendering
description: Systematically diagnose why an SDK component does not render, renders the wrong component, shows stale data, or loses values - component map resolution, registration, error boundary, bridge subscription, change detection, props and form wiring.
---

# Debugging rendering problems

Work top-down; stop at the first confirmed cause. State what you checked.

## 1. Is the right component chosen?

- Browser console: `Requested component has neither Local nor Pega-provided implementation: <Name>` -> the Pega component name is not in the map. Check `docs/components.md`; add it with `node scripts/new-component.js` or map it (names are case-sensitive).
- An `ErrorBoundary` card is shown -> same cause (lookup fell back).
- Wrong implementation shown -> a **local** map entry wins over the Pega map (`packages/angular-sdk-components/src/sdk-local-component-map.ts`, customer overrides). Check it.
- Template picks children by `getRawMetadata().type`: verify the type string the engine sends.

## 2. Is the component instantiated and registered?

- Class is a standalone component, imported/exported in `public-api.ts`, mapped in `sdk-pega-component-map.ts`.
- `ComponentMapperComponent` receives `name`/`props` (`pConn$` present? `formGroup$` passed for fields?). Missing `pConn$` -> undefined errors in `ngOnInit`.
- Logs `AngularPConnect: bad call to registerAndSubscribe` -> component passed a null callback or lacks the expected shape.

## 3. Does it receive store updates?

- Component must call `registerAndSubscribeComponent(this, this.onStateChange)` (FieldBase and the template bases do it). A plain component that forgets it never updates.
- `onStateChange` must call `checkAndUpdate()`; `shouldComponentUpdate` returns true only if resolved props **deeply** differ; blank `pageMessages` are ignored; `httpMessages` excluded. If props are equal but you expect a re-render, the data you depend on is not part of `getConfigProps()` (use `additionalProps` or `getInheritedProps`).

## 4. Rendered but stale?

- OnPush component + state assigned outside a store callback/event -> see skill `sdk-change-detection` (missing `markForCheck()`).
- Mutated an object in place that is also an input of an OnPush child.

## 5. Value lost or not saved?

- Propagation must use `handleEvent(this.actionsApi, 'changeNblur', this.propName, value)`. Text inputs propagate on blur; selection controls on change. `propName` is `getStateProps().value`; if empty the field is not bound to a property.
- `bReadonly$`/`bHasForm$`: no `formGroup$` input makes a field read-only and form-less.
- Stale 400 errors after navigation: form field lifecycle imbalance - `unsubscribeFn` must run in `ngOnDestroy` (it calls `removeFormField` and removes the context-tree node).

## 6. Layout/visibility

- `visibility`/`displayMode`/`readOnly` come from config or inherited props (`DetailsTemplateBase` forces `DISPLAY_ONLY` and `readOnly`). Verify the resolved values, not the raw ones.

## 7. Reproduce

Write the failing unit spec first (`sdk-write-unit-tests`), observe it, then fix. If it cannot be reproduced without the engine, say so explicitly and list what must be checked in the MediaCo app.

## Useful commands

```bash
grep -rn "<ComponentName>" packages/angular-sdk-components/src/lib/_bridge/helpers/sdk-pega-component-map.ts
grep -rn "component-mapper name=\"<Name>\"" packages/angular-sdk-components/src
npx ng test angular-sdk-components --watch=false
```

For environment problems (blank page, login loops, CORS) see `docs/troubleshooting.md`.
