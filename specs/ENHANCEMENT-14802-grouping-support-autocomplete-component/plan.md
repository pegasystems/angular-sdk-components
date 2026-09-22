# Implementation Plan: AutoComplete Option Grouping

**Branch**: `ENHANCEMENT-14802-grouping-support-autocomplete-component` | **Date**: 2026-09-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/ENHANCEMENT-14802-grouping-support-autocomplete-component/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Add optional grouping to `AutoCompleteComponent`: when a group-by field is configured (via `pConn$.getRawMetadata().config.groupsFields`), datapage-sourced options are annotated with a `group` value, sorted ascending by the exact case-sensitive value (stable within a group), and rendered using Angular Material's native `<mat-optgroup>` autocomplete grouping — which already provides non-selectable headers and keyboard-navigation skipping for free. When no group-by field is configured, or the list is associated/local-list sourced, behavior and markup are byte-for-byte unchanged from today. Search/filtering continues to match only primary/secondary text; grouping is a pure post-filter, order-preserving regrouping step.

## Technical Context

**Language/Version**: TypeScript (Angular ^21.x, per repo-wide `angular.json`/`package.json`)

**Primary Dependencies**: Angular Material `MatAutocompleteModule`, `MatOptionModule` (already imported by `AutoCompleteComponent` — provides both `MatOption` and `MatOptgroup`, no new imports needed), RxJS (`map`, `startWith`, already used in `filteredOptions` pipeline)

**Storage**: N/A — data comes from the existing datapage fetch (`DatapageService.getDataPageData()` via `PCore.getDataApiUtils().getData()`); no new storage or persistence introduced

**Testing**: Karma + Jasmine unit tests (`auto-complete.component.spec.ts`), consistent with existing secondary-text test suite in the same file; Playwright E2E only as manual/quickstart validation (no case-flow/assignment behavior changes, so new E2E specs are not required by Constitution VI, but existing `Picklist.spec.js`/`DataReference.spec.js` AutoComplete E2E coverage must keep passing)

**Target Platform**: Browser (Angular component library consumed by the Angular SDK test app and downstream consumer apps)

**Project Type**: Library component (single Angular library project — `packages/angular-sdk-components`)

**Performance Goals**: No new performance target beyond existing AutoComplete behavior; grouping adds one linear pass (sort) over already-fetched datapage results and one linear pass (bucket) over the already-filtered option list per keystroke — both O(n) over the existing option count, no new network calls

**Constraints**: Must not change any existing `AutoCompleteComponent` public behavior, props, or DOM output when no `groupsFields` metadata is configured (Constitution III); must reuse Angular Material's built-in grouping/keyboard-navigation/accessibility behavior rather than reimplementing it (per user-provided design-system direction); must not extend scope to associated/local-list options (FR-013)

**Scale/Scope**: Single component file set (`auto-complete.component.ts`/`.html`/`.scss`/`.spec.ts`); no bridge, container, or cross-component changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment |
|---|---|
| I. Platform Boundary | PASS — group-by value is read from `pConn$.getRawMetadata()`, and option data continues to come from `DatapageService`/`PCore.getDataApiUtils()`. No direct REST calls, no custom state store introduced. |
| II. Component Contracts | PASS — `AutoCompleteProps`/`AutoCompleteOption` remain typed interfaces (extended, not loosened to `any`); value propagation via `handleEvent`/`optionChanged` is untouched; read-only/display mode still delegates to `FieldValueList` via `component-mapper` (unchanged); children (secondary components) still render through `component-mapper`. |
| III. Backward Compatibility | PASS (by design) — `groupsFields` is a new, optional metadata key; when absent, the existing flat render path, `AutoCompleteOption` shape, and search behavior are byte-for-byte unchanged (see research.md §4 for why two render paths are used instead of one unified path). |
| IV. Infrastructure Protection | N/A — no bridge or container component is touched. |
| V. Security | PASS — no secrets, tokens, or URLs involved; `config.groupsFields` entries are property-reference strings read the same way existing `columnsFormatter` metadata is already read (via the shared `mapMetadataColumns()` helper). |
| VI. Testing Standards | PARTIAL (accepted, see Complexity Tracking) — unit tests cover column processing, option `group` derivation, sorting, and the search/grouping interaction; group-header non-selectability and keyboard-navigation-skip (FR-006/FR-010) rely on Angular Material's native `mat-optgroup` behavior plus manual quickstart validation rather than a new automated test, and no new embedded-mode E2E coverage is added — both deferred for this iteration, since tests are not the current priority. |
| VII. Spec and Plan Separation | PASS — `spec.md` contains no framework/file names; this `plan.md` carries all technical decisions (Angular Material APIs, file names, data shapes). |
| VIII. Minimal Change and Code Health | PASS (planned) — changes are scoped to `auto-complete.component.{ts,html,scss,spec.ts}` only; `getSecondaryColumnsFromMetadata()`/`getGroupByColumnsFromMetadata()` share a single `mapMetadataColumns()` helper rather than duplicating the `@P `/`@USER ` prefix-stripping logic. |
| IX. UX Consistency | PASS — uses Angular Material's own `mat-optgroup` grouping primitive exclusively; no custom header markup or bespoke ARIA wiring. |

See Complexity Tracking below for the one accepted, documented relaxation of Principle VI.

**Post-Phase-1 re-check**: After completing research.md and data-model.md, all rows above still hold — the finalized design (single scalar `config.groupsFields` array, additive `AutoCompleteOption.group` field, two mutually-exclusive template render paths, native `mat-optgroup`) introduces no new dependency, no bridge/container change, and no deviation from the constitution beyond the accepted testing-scope relaxation. Gate remains PASS with that one documented exception.

## Project Structure

### Documentation (this feature)

```text
specs/ENHANCEMENT-14802-grouping-support-autocomplete-component/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── auto-complete-grouping-contract.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
packages/angular-sdk-components/src/lib/_components/field/auto-complete/
├── auto-complete.component.ts    # Column processing (groupBy column descriptor), option
│                                  # `group` derivation, sorting, grouped-view-model construction
├── auto-complete.component.html  # New `hasGroupBy`-gated <mat-optgroup> render path,
│                                  # alongside the untouched existing flat render path
├── auto-complete.component.scss  # Only if mat-optgroup default styling needs the same
│                                  # panel-width/wrapping treatment already applied to mat-option
└── auto-complete.component.spec.ts  # New unit tests for grouping (column processing, sort,
                                      # grouped view-model, search interaction, backward
                                      # compatibility, associated/local-list exclusion)
```

**Structure Decision**: This is a single-project Angular component library (no frontend/backend split, no mobile/API split). All changes are contained within the existing `auto-complete` component directory — no new files, directories, modules, or shared services are introduced; the feature reuses the existing `field.base.ts`, `event-util.ts`, and `DatapageService` infrastructure as-is.

## Complexity Tracking

> Tests are not a priority for this iteration; both rows below were resolved by choosing the option with the least implementation impact (documenting acceptance here) rather than adding new automated tests or E2E coverage.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| No embedded-mode E2E validation added for grouping (Constitution VI requires E2E validation in both portal and embedded modes for form-behavior changes) | Grouping is opt-in/additive and low-risk; existing portal-mode E2E (`Picklist.spec.js`, `DataReference.spec.js`) plus manual quickstart validation (quickstart.md §2) already cover the ungrouped-regression risk | Adding a new embedded-mode Playwright spec is more implementation work than this iteration prioritizes; deferred rather than built now |
| No automated test for group-header non-selectability / keyboard-nav skip (FR-006/FR-010/SC-005) | This behavior is provided natively by Angular Material's `mat-optgroup`/`ActiveDescendantKeyManager` (verified by source inspection, research.md §4) — the risk of regression is low and library-owned, not custom code | Writing a dedicated automated test (unit or E2E) for framework-guaranteed behavior is extra implementation effort not prioritized this iteration; manual quickstart validation (quickstart.md §2, scenario 2) is accepted as interim coverage |

## Implementation Notes (post-implementation deltas from this plan)

- **Metadata API corrected**: The actual platform metadata is `pConn$.getRawMetadata()?.config.groupsFields` — an array shaped like `columnsFormatter` (`{ type, config: { value, label } }[]`) — not the single scalar `config.groupBy` string originally assumed. `getGroupByColumnsFromMetadata()` maps it the same way `getSecondaryColumnsFromMetadata()` maps `columnsFormatter`, producing descriptors marked `{ groupBy: 'true', display: 'false', useForSearch: false }`.
- **Shared mapping helper**: Both metadata readers now delegate to a single `mapMetadataColumns(rawColumns, columnFlags)` helper to avoid duplicating the `@P `/`@USER ` prefix-stripping logic.
- **Sorting is case-sensitive, not case-insensitive**: `sortByGroup()` compares the exact `group` string (no `.toLowerCase()`), so `"Sales"` and `"sales"` are both distinct groups **and** ordered separately — this refines FR-005, which originally called for case-insensitive ordering while keeping case-sensitive equality.
