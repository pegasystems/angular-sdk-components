---
name: sdk-pconnect-api
description: Discover and correctly use the PConnect and PCore APIs (version-locked typedefs) when implementing or debugging SDK components - search recipes, the handful of APIs used everywhere, and how to mock them in tests.
---

# PConnect / PCore API

The engine (`@pega/constellationjs`) exposes two globals the SDK builds on. The authoritative, version-locked API is in `node_modules/@pega/pcore-pconnect-typedefs/` - read it instead of guessing.

| Where                       | Contents                                                                                                                                                                                                                                                                                           |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `interpreter/c11n-env.d.ts` | `PConnect` (per-component API, class `C11nEnv`)                                                                                                                                                                                                                                                    |
| `actions/api.d.ts`          | the object returned by `pConn$.getActionsApi()`                                                                                                                                                                                                                                                    |
| `pcore.d.ts`                | `PCore` global: `getStore`, `getConstants`, `getDataApiUtils`, `getContainerUtils`, `getLocaleUtils`, `getPubSubUtils`, `getEnvironmentInfo`, `getContextTreeManager`, `getMessageManager`, `getCaseUtils`, `getFormUtils`, `getAttachmentUtils`, `getRuntimeParamsAPI`, `getActionsSequencer` ... |
| `constants.d.ts`            | `PCore.getConstants()` shape (`CASE_INFO`, `PUB_SUB_EVENTS`, ...)                                                                                                                                                                                                                                  |

## Search recipes

```bash
T=node_modules/@pega/pcore-pconnect-typedefs
grep -n "^\s*[a-zA-Z]*(.*):" $T/interpreter/c11n-env.d.ts | less     # every PConnect method signature
grep -n "getLocalizedValue" -B12 $T/interpreter/c11n-env.d.ts        # docs + @example above a method
grep -n "^\s*[a-zA-Z]*(.*)" $T/actions/api.d.ts                       # action API
grep -rn "getDataApiUtils" $T/pcore.d.ts
grep -rn "yourSymbol" $T --include=*.d.ts -l
```

Each method carries JSDoc with an `@example`; read it for argument shapes. Then confirm real usage in the repo: `grep -rn "methodName(" packages/angular-sdk-components/src/lib --include=*.ts`.

## APIs used by almost every component

| API                                                                                                    | Purpose                                                                                                  |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `pConn$.getConfigProps()` + `pConn$.resolveConfigProps(props)`                                         | read the rule's config; **always resolve** (expressions like `@P .Name` become values)                   |
| `pConn$.getRawMetadata()`                                                                              | unresolved metadata (`type`, `config`) - used to decide which child to render                            |
| `pConn$.getChildren()` -> each `.getPConnect()`                                                        | child PConnect nodes for `<component-mapper>`                                                            |
| `pConn$.getActionsApi()`                                                                               | `updateFieldValue`, `triggerFieldChange` (used only through `handleEvent`), plus case/assignment actions |
| `pConn$.getStateProps()`                                                                               | state binding, for example `getStateProps().value` -> `propName`                                         |
| `pConn$.getInheritedProps()` / `setInheritedProp(k, v)`                                                | props inherited from parent views (display mode, read-only)                                              |
| `pConn$.clearErrorMessages({ property })`                                                              | clear validation messages when the user edits                                                            |
| `pConn$.getLocalizedValue(text, localePath?, ruleKey?)`                                                | localization of literals                                                                                 |
| `pConn$.getComponentName()`, `getContextName()`, `getPageReference()`, `getValue(ref)`, `isEditable()` | identity, context and value access                                                                       |
| `PCore.getConstants()`                                                                                 | enumerations (`CASE_INFO`, `PUB_SUB_EVENTS`...)                                                          |
| `PCore.getDataApiUtils().getData(view, params, context)`                                               | data pages/views for widgets                                                                             |
| `PCore.getPubSubUtils().subscribe/unsubscribe/publish`                                                 | engine events (always unsubscribe on destroy)                                                            |
| `PCore.getEnvironmentInfo()`                                                                           | locale, time zone, operator info                                                                         |

## Rules

- Components never call Infinity REST; use these APIs.
- Do not read field data from `PCore.getStore().getState()`; use config props (the bridge handles store subscription and re-render).
- Do not mutate objects returned by `getConfigProps()`/`getInheritedProps()`; copy first.
- Version drift: `compareSdkPCoreVersions()` in `_helpers/versionHelpers.ts` exists for behaviour that differs by engine version.

## Testing code that uses these APIs

- `createMockPConn()` (in `src/test-setup.ts`) returns empty values for known getters and no-op functions for others; override only what the test needs: `pConn.getConfigProps = () => ({ label: 'x' }); pConn.resolveConfigProps = p => p;`
- The global `PCore` is a lenient stub reset before each spec; set specific methods on `(globalThis as any).PCore` inside the test (`getStore` -> capture the listener to simulate store updates).
- Unknown `PCore.getXxx()` returns a shallow object: ALL_CAPS members resolve to their own name (constants), other members to no-ops.
