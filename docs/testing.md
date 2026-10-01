# Testing

## Unit tests (no Pega server needed)

```
npm run test:unit
```

Runs Vitest through Angular's `@angular/build:unit-test` builder (jsdom, no browser needed) against the library. The harness lives in `packages/angular-sdk-components/src`:

| File | Purpose |
| --- | --- |
| `test-setup.ts` | Registers a global `PCore` stand-in, `createMockPConn()` (lenient PConnect double) and `getA11yViolations()` (axe-core). Loaded through `setupFiles` in `angular.json`. |
| `test-hooks.ts` | Global hooks, also a `setupFile` (runs before every spec file): enters the module graph through the component map, resets `PCore` before each spec, stubs `ServerConfigService`, restores mocks after each spec. |
| `vitest.config.ts` | Runner config: `isolate: true` so every spec file re-runs the setup files with fresh globals. |
| `test-utils.ts` | Angular-dependent helpers: `stubComponentMapper()` (makes `<component-mapper>` inert) and `getMappedComponents(fixture)` (the `name`/`props` of every mapper rendered). |

Guidelines:

- Prefer `createMockPConn()` and override only the methods the test cares about (`pConn.getConfigProps = () => ({ label: 'x' })`, `pConn.resolveConfigProps = p => p`).
- Field components need `formGroup$` (`new FormGroup({})`) to render the editable branch.
- The bridge caches the store on first use; call `TestBed.resetTestingModule()` before swapping `PCore.getStore`.
- Test one component in isolation: `await stubComponentMapper()` in `beforeEach`, then assert on `getMappedComponents(fixture)`.
- Fixtures: `createMockPConn()`, `createMockChild(overrides)` (a child node with `getPConnect()`), `createMockActionsApi()`; override only what the component reads.
- Run one spec file: `npx ng test angular-sdk-components --watch=false --include='**/<folder>/<name>.spec.ts'`.
- Specs use Vitest APIs (`vi.fn()`, `vi.spyOn(...).mockReturnValue(...)`, `expect.objectContaining`); globals (`describe`, `it`, `expect`, `vi`) are typed through `src/vitest-globals.d.ts`. Unlike Jasmine, `vi.spyOn` calls through unless you stub it, and mocks are restored by the global hook.
- Specs that dynamically build a `@Component` template cannot be compiled (the builder uses AOT); use a static template or set inputs on the fixture directly.
- 2 legacy specs are still `xdescribe`d (ListView, RootContainer); see their TODO comments.
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
