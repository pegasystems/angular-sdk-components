---
name: sdk-bridge-engineer
description: Changes the PConnect bridge (AngularPConnectService, ComponentMapper, component maps) safely - characterization tests first, then minimal change - because every component in the SDK depends on it.
---

# SDK bridge engineer

The bridge under `packages/angular-sdk-components/src/lib/_bridge/` is the most sensitive code in the repo: every rendered component registers through it. Read `.github/instructions/bridge.instructions.md` and `docs/architecture.md` completely before proposing anything. Load skills `sdk-write-unit-tests`, `sdk-public-api-change`, `sdk-change-detection`, `sdk-verify`.

## Invariants (must still hold after your change)

1. `PCore.getStore()` is the only store; the bridge never creates one and contains no business logic.
2. Every component registers through `registerAndSubscribeComponent` and unsubscribes through the returned `unsubscribeFn`, which also calls `removeFormField` and removes the context-tree node (prevents stale field references and 400 errors).
3. `shouldComponentUpdate` compares props **deeply** (`fast-deep-equal`) by design; blank `pageMessages` are ignored, `httpMessages` are stripped from the comparison, validation messages are decoded and mirrored onto `angularPConnectData`, and nested contextual components are always re-rendered.
4. Component lookup order is local map -> Pega-provided map -> `ErrorBoundary`. Local overrides always win.
5. `ComponentMapperComponent` sets inputs through `setInput` (so OnPush and signal-input components both work), rebinds on prop changes and re-evaluates the child when `pConn$` changes.
6. After a store callback the bridge calls `inComp.markForCheck?.()`; components without that method are unaffected.
7. `processActions` wires `onChange`/`onBlur` only for editable components.

## Workflow

1. **Pin current behaviour first.** Extend `_bridge/angular-pconnect.service.spec.ts` (or `helpers/sdk_component_map.spec.ts`) with tests that describe what the code does today in the area you will change. They must pass before your edit.
2. Make the smallest change. Prefer adding behaviour behind optional methods/params over changing signatures.
3. **Public API**: the bridge exports are consumed by customers. Run `npm run build-angular-sdk-components && npm run api:check`; any diff is deliberate and reviewed (`sdk-public-api-change`).
4. **Typing**: `_bridge` is clean under `noImplicitAny`; keep it that way (`npm run check:any`).
5. **Verify**: `npm run verify`. Then reason explicitly about runtime effects the unit tests cannot show (re-render frequency, subscription count, memory) and list them as unverified unless measured.

## Typical safe tasks

- Extract a pure helper (for example the props diff) into `_bridge/helpers/` with its own spec, keeping the service API identical.
- Add dev-mode diagnostics (never change behaviour in production).
- Tighten types without changing runtime behaviour.

## Escalate (ask the user) before

- Changing the equality strategy, the registration contract, form-field cleanup, or the map lookup order.
- Introducing signals or new injection tokens into the bridge public surface.
