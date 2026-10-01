# Testing

## Unit tests (no Pega server needed)

```
npm run test:unit
```

Runs Karma/Jasmine in headless Chrome against the library. The harness lives in `packages/angular-sdk-components/src`:

| File | Purpose |
| --- | --- |
| `test-setup.ts` | Registers a global `PCore` stand-in, `createMockPConn()` (lenient PConnect double) and `getA11yViolations()` (axe-core). Loaded as a polyfill via `angular.json`. |
| `test-hooks.spec.ts` | Global hooks: loads the component map, resets `PCore` before each spec, stubs `ServerConfigService`. |

Guidelines:

- Prefer `createMockPConn()` and override only the methods the test cares about (`pConn.getConfigProps = () => ({ label: 'x' })`, `pConn.resolveConfigProps = p => p`).
- Field components need `formGroup$` (`new FormGroup({})`) to render the editable branch.
- The bridge caches the store on first use; call `TestBed.resetTestingModule()` before swapping `PCore.getStore`.
- 43 legacy `xdescribe`d specs need richer engine fixtures; un-skip them as fixtures become available.
- Bridge behavior is pinned by characterization tests in `_bridge/angular-pconnect.service.spec.ts`; extend them before changing the bridge.

## Static ratchets

| Command | Guards |
| --- | --- |
| `npm run check:any` | Per-file `noImplicitAny` baseline (`scripts/implicit-any-baseline.json`). Fixing errors? run `npm run check:any:update` to lower it. |
| `npm run api:check` | Public API report (`etc/angular-sdk-components.api.md`). Intentional change? `npm run api:update`. |
| `npm run check:overrides` | The generated overrides package type-checks against the built library. |
| `npm run docs:components:check` | `docs/components.md` matches the component map. |
| `npm run smoke:pack` | Published tarballs contain the expected files. |

## End-to-end

Playwright tests (`npm test`) need a running Pega Infinity server with the MediaCo app; see `projects/angular-test-app/tests`.
