# ADR 0003: Follow-ups after the modernization PR

Status: Open (living list; remove items as they ship)

Everything in PR #608 is unit-tested but has not been run against a Pega Infinity server. Items are grouped by what they need.

## Before merging PR #608 (needs a Pega server)
Run the Playwright MediaCo suite (portal and embedded) and check:
- OnPush field and presentational components re-render on store updates.
- Material transitions (dialog, menu, select) still look right after removing `@angular/animations` and `provideAnimations()` from the test app. If transitions are missing, re-add the package and the provider.
- `localizeText` output in a non-English locale (it replaces the deprecated `getLocalizedValue`).
- `FieldBase.ngOnInit` now resolves `actionsApi` and `propName` before the first `updateSelf()`.
- Multiselect now assigns `listType`, so `associated` lists skip the display-field metadata and the data API init.
- RadioButtons shows `<mat-error>` (the hidden input is now bound to the control); Location shows the stored value on first render; SemanticLink hides when `visibility` is `false`.

## Follow-up PRs (no server decision needed)
1. **Localization and accessibility**
   - `FieldBase.getErrorMessage` returns hard-coded English; route it through `localizeText`.
   - Rich-text toolbar `aria-label`s are hard-coded English.
   - Add ARIA and axe tests for templates and widgets (axe currently covers 12 field components).
2. **Behaviour tests for the remaining placeholder specs** (about 80 still assert only "should create"): containers, templates, widgets, then design-system components. Prioritise components with branching logic; skip trivial wrappers. Use the mutation check from the `sdk-write-unit-tests` skill and raise `coverageThresholds` in `angular.json` as coverage grows (currently 48/45/45/46).
3. **`noImplicitAny` baseline** (about 1,000 errors in `scripts/implicit-any-baseline.json`): reduce by folder, then `npm run check:any:update`.
4. **Bridge**: `angular-pconnect.ts` already delegates prop resolution and form-field cleanup to `_bridge/helpers`. Splitting subscription, registration and `shouldComponentUpdate` into separate services is higher risk; add more characterization tests first.
5. **Known smaller items**
   - Constructor injection to `inject()` (enable the `prefer-inject` lint rule once done).
   - 66 `::ng-deep` usages in component styles.
   - `@angular/material-moment-adapter` in the date fields (switch to the native or Day.js adapter).
   - CI unit tests take about 3 to 4 minutes (per-file jsdom and setup cost). A custom Vitest runner that resets state per test would make `isolate: false` safe; accepted as-is for now.

## Needs a decision
- Google Places: `AutocompleteService` is deprecated for new customers; migrate to the Places (New) API. The usage carries an `eslint-disable` with the reason.
- Test app: move from the webpack custom builders (they pull in `uuid@8`) to the esbuild application builder.
- `@pega/pcore-pconnect-typedefs` is on 4.1.0 while 5.x exists; confirm it matches the engine version in use before upgrading.
- Future major release: signal inputs, `@defer` for heavy widgets, secondary entry points, OnPush for the remaining async components, and Angular 22 with Vitest 5 (see ADR 0002 for the reasons each was deferred).
