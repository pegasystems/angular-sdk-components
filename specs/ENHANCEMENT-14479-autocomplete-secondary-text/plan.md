# Implementation Plan: AutoComplete Secondary Text

**Branch**: `001-autocomplete-secondary-text` | **Date**: 2026-09-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-autocomplete-secondary-text/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Add optional secondary (contextual) text to `AutoCompleteComponent` options, sourced from
`columns`/`columnsFormatter` metadata that is not the primary display field. Multiple
secondary values are normalized, joined with a middle-dot (`·`) separator, and rendered
beneath the primary text inside each Angular Material `mat-option` using type-appropriate
formatting. Search/filter is extended to match against secondary values in addition to the
existing primary-text match, reusing the component's existing client-side `_filter()`
mechanism (Angular Material does not provide built-in filtering — userland filtering is
already the standard pattern the component follows). The existing column-processing flow
(`preProcessColumns` / `getDisplayFieldsMetaData`) is extended, not replaced, and the feature
is scoped to datapage/prompt-list-sourced options only, per the spec's clarifications.

## Technical Context

**Language/Version**: TypeScript, Angular ^21.x (standalone components)

**Primary Dependencies**: `@angular/material` ^21.2.2 (`MatAutocompleteModule`, `MatOptionModule`, `MatFormFieldModule`, `MatInputModule`), `@angular/cdk` ^21.2.2, RxJS (`Observable`, `map`, `startWith`), `@pega/constellationjs` (PCore/PConnect APIs consumed via `pConn$`)

**Storage**: N/A — option data comes from the Data Page API via `DatapageService`/`PCore.getDataApiUtils()`; no local persistence

**Testing**: Karma + Jasmine (unit, `*.component.spec.ts`), Playwright (E2E, `projects/angular-test-app/tests/e2e`) per [testing.instructions.md](../../.github/instructions/testing.instructions.md)

**Target Platform**: Browser — Angular SPA embedded in Pega Constellation portal and embedded application modes

**Project Type**: Single Angular library (`packages/angular-sdk-components`) consumed by the downstream `angular-sdk` repo; validated locally via `projects/angular-test-app`

**Performance Goals**: Option list rendering/filtering remains as responsive as the current AutoComplete for typical Data Page result sizes; no new perceptible input lag when secondary text and per-option formatting are added

**Constraints**: No horizontal scroll in the option panel at any secondary-text length (FR-003/FR-005); existing keyboard navigation, highlighting, selection, and accessibility behavior of `mat-autocomplete`/`mat-option` MUST be unchanged; no breaking changes to the existing `AutoCompleteProps`/option object shape for consumers that only use primary text

**Scale/Scope**: One field component (`AutoCompleteComponent`) plus its column-processing helpers; a possible narrowly-scoped, additive change to `FieldValueListComponent` (new `inline-compact` variant) only if existing styling cannot satisfy wrapping requirements; no new components, no bridge/container changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Notes |
|---|---|---|
| I. Platform Boundary | PASS | All data continues to flow through `pConn$` (`resolveConfigProps`, `getRawMetadata`, `createComponent`) and `PCore.getDataApiUtils()`/`DatapageService`. No direct REST calls, no custom store. |
| II. Component Contracts | PASS | `AutoCompleteProps` remains a typed interface extending `PConnFieldProps` (extended, not replaced). Value propagation continues via `handleEvent(actionsApi, 'changeNblur', ...)` on selection (unchanged). Display-mode rendering continues to delegate to `<component-mapper name="FieldValueList">`. Any per-secondary-field PConnect objects are rendered via `<component-mapper>`, never a hard-coded selector. |
| III. Backward Compatibility | PASS (pending design) | New fields (`secondary` column flag, per-option secondary data) are additive/optional. Existing consumers with no `columnsFormatter`/secondary columns get identical rendering and search behavior — this must be covered by unit tests for both the legacy and new paths. |
| IV. Infrastructure Protection | N/A | No changes to `_bridge/` or `infra/Containers`. |
| V. Security | PASS | No secrets, tokens, or URLs introduced; metadata is read through existing `pConn$` accessors. |
| VI. Testing Standards | ACTION REQUIRED | Unit tests must cover: options with/without secondary text, multiple secondary columns joined, empty/whitespace secondary values, search-by-secondary-text, and the no-`columnsFormatter` legacy path. No case-flow/assignment impact, so full E2E is not mandated by the constitution, but a Playwright visual check for wrapping/no-horizontal-scroll is recommended. |
| VII. Spec and Plan Separation | PASS | `spec.md` remains technology-agnostic; this `plan.md` carries all file/API-level decisions. |
| VIII. Minimal Change and Code Health | PASS (pending design) | Plan reuses existing `preProcessColumns`/`getDisplayFieldsMetaData` flow and the existing `createComponent` DISPLAY_ONLY pattern (already used by `ScalarListComponent`/`ObjectReferenceComponent`) rather than inventing a parallel mechanism. `FieldValueList` is modified only if analysis (Phase 1) proves existing styling insufficient. |
| IX. UX Consistency | PASS | Rendering stays within Angular Material (`mat-option`, `mat-autocomplete`); no raw HTML form controls; no new hard-coded user-facing strings (the `·` separator is punctuation, not localizable text). |

No principle is violated outright; two items ("Testing Standards", "Minimal Change") are marked
ACTION REQUIRED / pending design and are resolved by the research and design decisions below
rather than by relaxing the constitution. **Complexity Tracking is not required.**

### Post-Design Re-check (after Phase 1)

| Principle | Resolution |
|---|---|
| VI. Testing Standards | `quickstart.md` enumerates the required unit-test coverage (legacy path, single/multiple secondary columns, empty values, search-by-secondary, search-by-primary regression). Confirmed achievable with Karma/Jasmine only — no case-flow impact, so E2E remains optional. |
| VIII. Minimal Change and Code Health | `research.md` confirms `FieldValueList` requires **no change** (feature is edit-mode/option-list only); the only modified files are `auto-complete.component.ts/.html/.scss`. Column/option-object changes (`data-model.md`) are additive extensions of the existing `preProcessColumns`/`getDisplayFieldsMetaData` flow, not a parallel implementation. |

Both ACTION REQUIRED items are now resolved by design; the Constitution Check gate **PASSES**
after Phase 1.

## Project Structure

### Documentation (this feature)

```text
specs/001-autocomplete-secondary-text/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── autocomplete-option-contract.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
packages/angular-sdk-components/src/lib/
├── _components/
│   └── field/
│       └── auto-complete/
│           ├── auto-complete.component.ts     # Column/option/search logic (primary change surface)
│           ├── auto-complete.component.html   # mat-option template (secondary line markup)
│           └── auto-complete.component.scss   # Wrapping / no-horizontal-scroll styles, scoped panel class
└── _types/
    └── PConnProps.interface.ts                # No change expected (AutoCompleteProps lives in the component file)

projects/angular-test-app/
└── tests/e2e/                                 # Optional Playwright coverage for wrap/no-scroll behavior
```

**Structure Decision**: Single-project Angular library structure (matches the existing
`packages/angular-sdk-components` layout — none of the template's generic Option 1/2/3 shapes
apply as-is). All logic changes are confined to the `field/auto-complete/` component.
`template/field-value-list/` was considered and ruled out — research.md §6 confirms this
feature is edit-mode/option-list only, so `FieldValueList` (which only renders the read-only
display mode of the already-selected value) requires no change. No new files/components/
directories are introduced.

## Complexity Tracking

> No constitution violations require justification. This section is intentionally empty.
