---
name: sdk-unskip-specs
description: Restore the legacy xdescribe-d "should create" unit specs one by one by improving shared mocks or the specs, keeping assertions meaningful, and ratcheting the coverage floor. Use when asked to improve test coverage or clean up skipped tests.
---

# Un-skipping legacy specs

## Find them

```bash
grep -rl "xdescribe" packages/angular-sdk-components/src          # 2 files remain: ListView and RootContainer
grep -rn "TODO: needs engine-level" packages/angular-sdk-components/src | wc -l
```

## Procedure per spec

1. Change `xdescribe(` to `describe(` and remove the TODO comment line above it.
2. Run only that spec while iterating: `npx ng test angular-sdk-components --watch=false --include='**/<folder>/*.spec.ts'`.
3. Read the first error and classify it:

| Error pattern                                                   | Cause                                               | Fix                                                                                                   |
| --------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `Cannot read properties of undefined (reading 'getPConnect')`   | component iterates children or a child's parent     | give the mock children: `pConn.getChildren = () => [{ getPConnect: () => child }]`                    |
| `Cannot destructure property 'x' of 'config'/'configProps$'`    | code expects non-empty config props                 | `pConn.getConfigProps = () => ({...})` and `pConn.resolveConfigProps = p => p`                        |
| `Cannot read properties of undefined (reading 'CONSTANT')`      | constants object missing                            | set the constant on `PCore.getConstants` in the spec or extend `explicitPCore()` in `test-setup.ts`   |
| `... .then is not a function` / `reading 'catch'`               | engine API returns a promise                        | stub it: `PCore.getDataApiUtils = () => ({ getData: () => Promise.resolve({ data: { data: [] } }) })` |
| `initializeContainers`, `getActionsSequencer is not a function` | engine singleton missing                            | add to the `PCore` stub (shallow functions returning `undefined`/promises)                            |
| `NG01052 formGroup expects a FormGroup`                         | field without form                                  | `component.formGroup$ = new FormGroup({})`                                                            |
| `Unexpected directive ... Please add an @NgModule`              | root component is not standalone                    | test it through its real module/host or delete the obsolete spec if the component is unused           |
| `Cannot access 'X' before initialization`                       | module-level import cycle                           | import lazily inside the test (`await import(...)`)                                                   |
| spec hangs / browser disconnects                                | engine-walking `while` loop over a too-lenient mock | make the mock shallower (return `undefined` at depth 2)                                               |

4. Make the assertion meaningful: beyond `should create`, assert one rendered fact for the default config.
5. Mutation-check it (see `sdk-write-unit-tests`).
6. Run the whole suite twice and `npm run verify`.

## Rules

- Fix the mock/spec, not the component, unless you find a real bug (then use the bug-fix workflow and say so).
- If a spec is genuinely obsolete (component removed or unreachable), delete it and explain.
- Never reintroduce `xdescribe`/`xit` to finish; leave it skipped with a more precise TODO instead.

## Finish

```bash
npm run test:coverage       # note new totals
```

Raise thresholds in `coverageThresholds` in `angular.json` to just below the new actuals. Update the known-gaps text in `docs/adr/0001-modernization-roadmap.md` and `docs/testing.md` (they mention 43 skipped specs).
