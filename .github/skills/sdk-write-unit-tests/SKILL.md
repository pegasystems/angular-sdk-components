---
name: sdk-write-unit-tests
description: Write reliable unit tests for SDK components, templates, widgets, helpers and the bridge using the repo test harness (createMockPConn, PCore stub, global hooks, axe helper) - patterns, recipes, pitfalls and a mutation check to prove the test is not vacuous.
---

# Writing unit tests

Run: `npx ng test angular-sdk-components --watch=false` (Vitest on jsdom, no Pega server) and `npx ng test angular-sdk-components --watch=false --coverage`. Specs sit next to the code (`*.spec.ts`).

## The harness

| Piece                   | Location                                                                                      | Role                                                                                                                                                                                              |
| ----------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| global `PCore` stub     | `packages/angular-sdk-components/src/test-setup.ts` (a `setupFile` in `angular.json`) | lenient stand-in for the engine; reset before every spec by `test-hooks.ts`                                                                                                                  |
| `createMockPConn()`     | same file                                                                                     | lenient PConnect double: known getters return empty values (`getConfigProps` -> `{}`, `getChildren` -> `[]`, ...), anything else is a no-op, `getPConnect()` returns itself, `meta.config` exists |
| `getA11yViolations(el)` | same file                                                                                     | axe-core (WCAG 2.0/2.1 A and AA) over a rendered element                                                                                                                                          |
| `test-hooks.ts` | `src/` | setup file run before every spec file: enters the module graph through the component map, resets `PCore`, stubs `ServerConfigService.getSdkConfigServer`, restores mocks after each spec |
| `stubComponentMapper()`, `getMappedComponents(fixture)` | `src/test-utils.ts` | make `<component-mapper>` inert and read what it was asked to render |
| `createMockChild(overrides)`, `createMockActionsApi()` | `src/test-setup.ts` | child node with `getPConnect()`; actions API whose methods are bindable no-ops |

Rules of the house: standalone components go in `imports` (never `declarations`); no `waitForAsync` (zoneless) - use `async`/`await` and `await fixture.whenStable()`; do not import the component map ahead of the setup file (circular import; `test-hooks.ts` handles it). Spec APIs are Vitest's: `vi.fn()`, `vi.spyOn(obj, 'm').mockReturnValue(x)` (calls through unless stubbed), `expect.objectContaining`; do not build a `@Component` with a dynamic template string (AOT compile fails); never commit `xdescribe`/`xit`/`fit`/`fdescribe`.

## Recipe: field component

```ts
beforeEach(async () => {
  await TestBed.configureTestingModule({ imports: [TextInputComponent] }).compileComponents();
});

it('renders label from config', () => {
  const pConn = createMockPConn();
  pConn.getConfigProps = () => ({ label: 'Name', value: 'x' });
  pConn.resolveConfigProps = (p: any) => p; // otherwise props resolve to {}
  const fixture = TestBed.createComponent(TextInputComponent);
  fixture.componentInstance.pConn$ = pConn;
  fixture.componentInstance.formGroup$ = new FormGroup({}); // editable branch needs a form
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('Name');
});
```

## Recipe: store-driven update (OnPush-safe)

`ComponentFixture.detectChanges()` force-refreshes the component under test and can hide missing `markForCheck()`. Use a default-strategy host component and capture the store listener:

```ts
TestBed.resetTestingModule(); // the bridge caches PCore.getStore() per injector
let listener: () => void = () => undefined;
(globalThis as any).PCore.getStore = () => ({ getState: () => ({}), subscribe: (cb: () => void) => ((listener = cb), () => undefined) });

@Component({ imports: [TextInputComponent], template: '<app-text-input [pConn$]="pConn" [formGroup$]="fg"></app-text-input>' })
class Host {
  pConn = pConn;
  fg = new FormGroup({});
}

TestBed.configureTestingModule({ imports: [Host] });
const fx = TestBed.createComponent(Host);
fx.detectChanges();
label = 'Second';
listener();
fx.detectChanges();
expect(fx.nativeElement.textContent).toContain('Second');
```

See `text-input.component.spec.ts`.

## Recipe: value propagation

Spy on the actions API: `pConn.getActionsApi = () => ({ updateFieldValue: spy1, triggerFieldChange: spy2 })`; trigger blur/change on the DOM element; assert both spies were called with `(propName, value)` for `changeNblur`. Remember `propName` comes from `getStateProps().value`.

## Recipe: test a component without its children
```ts
beforeEach(async () => {
  TestBed.configureTestingModule({ imports: [ObjectPageComponent] });
  await stubComponentMapper();            // <component-mapper> keeps its inputs but renders nothing
  await TestBed.compileComponents();
});

expect(await getMappedComponents(fixture)).toEqual([{ name: 'CaseView', props: expect.objectContaining({ pConn$: pConn }) }]);
```
See `object-page.component.spec.ts` and `inline-dashboard.component.spec.ts`.

## Recipe: template/children

Provide children: `pConn.getChildren = () => [{ getPConnect: () => childPConn }]` where `childPConn.getRawMetadata = () => ({ type: 'Region' })`, and `getComponentName`. Assert on `component-mapper` output or on the chosen names.

## Recipe: bridge

Use `angular-pconnect.service.spec.ts` as the model: build a component double (`createComp`), replace `PCore.getStore`, register, then call `shouldComponentUpdate`.

## Recipe: accessibility

Render in a host with a label and `await getA11yViolations(fx.nativeElement)`; expect `[]`. Unit tests do not load the Material theme, so colour-contrast findings there are not representative.

## Recipe: pure helpers

Table-driven tests (`[input, expected][]` + `forEach`), no TestBed.

## Strengthening placeholder specs
Many specs still assert only `should create`. To make one meaningful:
1. Read the component; list its branches and the engine calls it makes (`grep -n "PCore\.\|pConn\$\." <component>.ts`).
2. Supply the data it needs instead of mocking the component's collaborators: `PCore.getDataApiUtils/getDataPageUtils/getAnalyticsUtils` returning resolved promises, `pConn.getConfigProps/getRawMetadata/getChildren`, `PCore.createPConnect`. `vi.mock` of relative modules is **not supported** by the Angular unit-test builder, and `vi.spyOn` cannot replace ES module exports, so drive the real helpers with realistic inputs (see `list-view.component.spec.ts`).
3. Async engine work: `await vi.waitFor(() => expect(...))` rather than fixed timeouts.
4. Engine-driven updates: capture the store listener (`PCore.getStore` stub) and call it (see `root-container.component.spec.ts`).
5. Stub services with `vi.spyOn(TestBed.inject(Service), 'method').mockResolvedValue(...)`.
6. Assert behaviour (state, rendered text, calls with arguments) and mutation-check it.

## Prove the test can fail (mutation check)

After the test passes, break the behaviour (comment out the line under test or invert the condition), rerun that spec, and confirm it fails; then restore. Passing both ways = vacuous test, rewrite it. (The OnPush test in `text-input.component.spec.ts` is an integration check, not proof that `markForCheck()` is required.)

## Hygiene

- Isolation: each spec file runs in a fresh context; inside a file restore any global you touch (`PCore` is reset per spec and `vi` mocks are restored automatically).
- Spy, do not print: `spyOn(console, 'error')` when the code logs expectedly.
- No real network or timers. Prefer `await fixture.whenStable()`; use `fakeAsync` only for debounce logic that has no alternative.
- Extend the shared mock (`createMockPConn`/`explicitPCore` in `test-setup.ts`) when several specs need the same fixture; keep unknown members shallow so engine-walking loops cannot spin forever.
- Run the suite twice when you changed shared mocks, and once with `npx ng test angular-sdk-components --watch=false --coverage` (parallel runs expose isolation problems).

## Coverage

`npx ng test angular-sdk-components --watch=false --coverage` writes `coverage/angular-sdk-components/`. The threshold floor is `coverageThresholds` in `angular.json`; raise it (to a point or two below actual) whenever you add meaningful coverage, never lower it.
