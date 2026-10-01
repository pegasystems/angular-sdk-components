# ADR 0002: Phase B and C outcomes

Status: Accepted

## Delivered
**Phase B (additive)**
- `noImplicitAny` per-file ratchet (`npm run check:any`); `_bridge` is clean. Strict null checks were already enabled through `strict: true`.
- `FieldBase<TValue = any>` generic (non-breaking default) and a `markForCheck()` hook.
- Bridge characterization tests (`AngularPConnectService`, component map) so the bridge can be refactored safely.
- axe-core accessibility checks for 12 field components.
- `npm run new:component` scaffolds and registers components; `npm run check:overrides` type-checks the generated overrides package. This found and fixed a real defect: `build-overrides` did not rewrite `import type` paths, so the shipped `field.base.ts` in `@pega/angular-sdk-overrides` pointed at a non-existent relative module.
- Generated component catalogue (`docs/components.md`), testing and theming guides.

**Phase C (applied where it is verifiable without a Pega server)**
- `OnPush` for 17 synchronous field components and 6 presentational design-system components. The bridge calls `markForCheck()` after store callbacks so store-driven updates re-render.
- Material 3 token theming is documented (`docs/theming.md`).

## Deferred, with reasons
- **Signal inputs (`input()`/`model()`)**: the `ComponentMapper` already uses `setInput`, so it is compatible, but every `$`-suffixed property is also an override contract (consumers copy and subclass components). Converting ~99 components is a breaking change for them and needs a major release plus a codemod and migration guide.
- **OnPush for the remaining components** (templates, infra, widgets, async fields such as AutoComplete/Dropdown/Location): these mutate state in promise/subscription callbacks and in the containers' rendering pipeline. Zoneless + OnPush there needs each mutation site to call `markForCheck()` or move to signals, and must be validated end-to-end against Infinity (Playwright MediaCo), which was not available here.
- **Secondary entry points** (`/fields`, `/templates`, `/widgets`): components import each other and the bridge by relative path; ng-packagr entry points require package-name imports across entries and would change public import paths. Needs its own design and a major release.
- **`@defer` for heavy widgets** (rich text/maps): changes loading behavior; validate with E2E first.
- **Bridge split**: the characterization tests are in place; splitting `angular-pconnect.ts` into registry/subscription/diff services is the next step.

## Verification required before release
The OnPush changes are covered by unit tests but **must be exercised end-to-end** (MediaCo portal + embedded) before merging, since runtime store-driven rendering cannot be fully reproduced with mocks.

## Version constraints
The project stays on Angular 21.x (latest patch, currently 21.2.25), Node 24.x and TypeScript 5.9.x (`^5.9.3`). Angular 22, Node 26 and TypeScript 7 were evaluated as out of scope; moving to them is a separate major-version decision (see the upgrade skill).
