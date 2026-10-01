---
name: sdk-verify
description: Run, interpret and fix failures of the repository verification suite (npm run verify and each underlying check) after any change to Angular SDK Components code, tooling, or docs. Use before declaring work done.
---

# Verifying changes

## Commands

```bash
npm run verify -- --quick        # ~10 s: lint, noImplicitAny ratchet, catalogue, script tests, agent assets, sdk-config
npm run verify                   # ~30 s: + library build, API report, overrides build + type-check, tarballs, unit tests
npm run verify -- --only unit,api --keep-going
npm run verify -- --json         # machine-readable: { ok, results[{id,ok,seconds,command,fix,logTail}], skipped[] }
```

Step ids: `lint`, `any`, `docs`, `scripts`, `agents`, `changelog`, `config`, `build`, `api`, `overrides`, `pack`, `unit`. The runner stops at the first failure unless `--keep-going`; it prints the last 40 log lines and the remedy.

When to run which: after each logical edit -> `--quick`; docs-only changes -> `--only lint,docs`; component change -> `--only lint,any,unit,docs` while iterating and the full run before finishing; public API/bridge change -> full run.

## Failure remedies

| Step        | Typical cause                                                                       | Remedy                                                                                                                                                                            |
| ----------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lint`      | ESLint or Prettier                                                                  | `npm run fix`, then fix what remains. `sonarjs/cognitive-complexity` max is 20: split functions                                                                                   |
| `any`       | a file has more compiler errors under `--noImplicitAny` than its baseline           | add types to the file named in the output; if you fixed errors run `npm run check:any:update` and commit `scripts/implicit-any-baseline.json`                                     |
| `docs`      | component map changed                                                               | `npm run docs:components` and commit                                                                                                                                              |
| `scripts`   | tooling test failed                                                                 | `npm run test:scripts`; fix script or test                                                                                                                                        |
| `agents`    | agent/skill front matter wrong, or a doc mentions an npm script that does not exist | fix the name in the file the message points to (`name` must equal the file/directory name)                                                                                        |
| `changelog` | `CHANGELOG.md` does not follow the format                                           | read the message; add entries only with `npm run changelog -- add ...` (skill `sdk-changelog`); never edit older releases                                                         |
| `config`    | `sdk-config.json` invalid                                                           | read the message (it names the field and the `SDK_*` variable)                                                                                                                    |
| `build`     | TypeScript/Angular compile error                                                    | read the first error; template errors come from `strictTemplates`                                                                                                                 |
| `api`       | public API changed                                                                  | intended -> `npm run build-angular-sdk-components && npm run api:update`, review and commit `etc/angular-sdk-components.api.md`; unintended -> revert the export/signature change |
| `overrides` | overrides package does not compile                                                  | stale `dist/` (the test-app build replaces it) -> rerun `build`; otherwise an import not rewritten by `scripts/build-overrides.js`                                                |
| `pack`      | tarball missing files                                                               | run `build` and `overrides` first; check `ng-package.json`                                                                                                                        |
| `unit`      | failing spec                                                                        | run `npm run test:unit` alone; random order: a spec that passes alone but fails in the suite leaks global state (`PCore`, `TestBed`)                                              |

## Not covered by verify (say so in your report)

- Playwright E2E (`npm test`) needs a Pega Infinity server with the sample app.
- Real-engine runtime behaviour (re-render frequency, timing).

## Gotchas

- `npm run build` (test app) overwrites `dist/` and removes the library build; `verify` rebuilds it for you.
- Coverage floor: `npm run test:coverage` fails if coverage drops below `packages/angular-sdk-components/karma.conf.js` thresholds.
- Never make a check pass by skipping or deleting it.
