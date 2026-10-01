---
name: sdk-upgrade-dependencies
description: Upgrade Angular, Angular Material, Tiptap or other dependencies of this repository safely - peer dependency ranges of the published library, schematics, verification, API report and what must be tested end to end.
---

# Upgrading dependencies

**Project constraints:** stay on **Angular 21.x** (latest 21.x patch), **Node 24.x** and **TypeScript 5.9.x** (`^5.9.3`, locked at 5.9.3). Do not run `ng update` to a new major, do not widen peer ranges to Angular 22, and do not move TypeScript to 6 or 7. Patch/minor updates inside these lines are fine.

Angular packages peer-pin each other exactly (for example `@angular/platform-browser` pins `@angular/animations`), so update the whole family together: set all `@angular/core|common|compiler|forms|platform-browser|platform-browser-dynamic|router|animations|compiler-cli` ranges to the same patch in `package.json`, then `npm install --force` (npm's resolver cannot move a locked family one package at a time), and confirm `npm ls` reports no invalid entries.

This repo publishes a **library** with peer dependencies: ranges in `packages/angular-sdk-components/package.json` are a contract with consumers. The root `package.json` pins what this repository itself builds with.

## Procedure

1. Branch from `master`; one ecosystem per PR (Angular family together; Tiptap together; others individually).
2. Angular family: use the official tool and read its output.
   ```bash
   npx ng update @angular/core@<N> @angular/cli@<N> @angular/cdk@<N> @angular/material@<N> --force   # review each migration
   ```
   Also check `@angular/material-experimental`, `@angular/material-moment-adapter`, `@angular/google-maps`, `@danielmoncada/angular-datetime-picker`, `mat-tel-input`, `ngx-currency`, `@angular-eslint/*`, `typescript-eslint` for compatible versions.
3. Update `packages/angular-sdk-components/package.json` peer ranges to match what you now support (do not widen to untested majors). Keep root and package ranges consistent.
4. `npm install` (refresh `package-lock.json`), then:
   ```bash
   npm run verify
   npm run build            # test app dev build
   npm run prod-build-angularsdk   # production budgets (styles/initial bundle) - see angular.json
   ```
5. Expect and review: API report diff (`npm run api:update`; type changes from newer Angular typings can show up), `check:any` baseline changes, ESLint rule changes, Material token/CSS changes (visual regressions need a manual look in the test app).
6. Run Playwright E2E against a Pega Infinity environment when available; otherwise say clearly that rendering was not exercised end to end.
7. Commit as `chore(deps): ...`; if consumers must upgrade too (peer range bump), call it out in the PR and treat it as a **breaking** change for `@pega/angular-sdk-components` (see `sdk-public-api-change`).

## Pitfalls

- `@pega/constellationjs` and `@pega/pcore-pconnect-typedefs` versions move with the Pega platform; upgrading them changes the API surface components compile against - read the typedef diff.
- Do not hand-edit `package-lock.json`.
- Tiptap majors change extension APIs: run the rich-text unit and accessibility specs and test the editor manually.
- Dependabot opens one grouped PR per ecosystem per quarter; treat it as a starting point and still run this procedure.
