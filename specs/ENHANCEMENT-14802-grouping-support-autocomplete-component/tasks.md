# Tasks: AutoComplete Option Grouping

**Input**: Design documents from `/specs/ENHANCEMENT-14802-grouping-support-autocomplete-component/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included — Constitution Principle VI ("Unit tests MUST be added or updated for every behavior change") makes unit-test tasks mandatory for this change, not optional.

**Organization**: Tasks are grouped by user story (from spec.md) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Single Angular library project. All paths are under:
`packages/angular-sdk-components/src/lib/_components/field/auto-complete/`

- `auto-complete.component.ts` — component logic
- `auto-complete.component.html` — template
- `auto-complete.component.scss` — styles
- `auto-complete.component.spec.ts` — unit tests

---

## Phase 1: Setup

**Purpose**: Establish a verified pre-change baseline; no new tooling/dependencies are required (Angular Material's `MatOptionModule`, which exports `MatOptgroup`, is already imported by the component — research.md §4).

- [X] T001 Run the existing suite (`npx ng test angular-sdk-components --include='**/auto-complete/**/*.spec.ts' --watch=false`) against `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.spec.ts` and record the passing baseline, per quickstart.md §1 — note: the isolated `--include` filter hits a pre-existing, unrelated webpack circular-init error; baseline was instead confirmed via the full-suite run (one pre-existing, environment-related AutoComplete failure unrelated to this feature; 118 pre-existing failures repo-wide)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared data-shape and metadata-reading scaffolding that every user story depends on. These changes are additive/no-ops when no `groupsFields` metadata is configured, so they do not themselves alter existing behavior.

**⚠️ CRITICAL**: No user story task can begin until this phase is complete

- [X] T002 Extend the `AutoCompleteOption` interface with an optional `group?: string` field in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.ts` (data-model.md → Entity: `AutoCompleteOption`)
- [X] T003 Add the internal `AutoCompleteGroup` view-model interface (`{ label: string; options: AutoCompleteOption[] }`) in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.ts` (data-model.md → Entity: `AutoCompleteGroup`)
- [X] T004 Add a `getGroupByColumnsFromMetadata()` method that reads `pConn$.getRawMetadata()?.config?.groupsFields` (array, corrected during implementation from an initially-assumed single `groupBy` string), mapping each entry the same way `getSecondaryColumnsFromMetadata()` does (strip a leading `@P `/`@USER ` prefix), returning column descriptors marked `{ groupBy: 'true', display: 'false', useForSearch: false }` in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.ts` (research.md §1, contracts/auto-complete-grouping-contract.md)
- [X] T005 In `generateColumnsAndDataSource()`, when `listType !== 'associated'` and `getGroupByColumnsFromMetadata()` resolves any descriptors, append them to the working `columns` array in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.ts` (research.md §2, data-model.md → Entity: group-by column descriptor, FR-013)
- [X] T006 Add a `hasGroupBy` boolean component property, derived from whether a group-by column descriptor was produced in T005, in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.ts` (contracts/auto-complete-grouping-contract.md → rendering contract)

**Checkpoint**: Foundation ready — group-by metadata can be resolved and carried through column processing, with zero effect on existing option shape or rendering until Phase 3 wires it up.

---

## Phase 3: User Story 1 - Scan a large option list organized by category (Priority: P1) 🎯 MVP

**Goal**: When a group-by field is configured, options are grouped under one non-selectable header per distinct group value, sorted so same-group options are contiguous.

**Independent Test**: Configure an AutoComplete field with a group-by field set, open the dropdown, and verify options are displayed under headers matching each distinct group value, with all options sharing a group value appearing together.

### Implementation for User Story 1

- [X] T007 [US1] In `fillOptions()`, when a group-by column descriptor exists, resolve each result row's raw group value, normalize `null`/`undefined`/whitespace-only to `''`, and set it as `option.group` in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.ts` (data-model.md → `AutoCompleteOption.group`, FR-003/FR-011)
- [X] T008 [US1] Sort the built `optionsData` array (before calling `setOptions()`) ascending by `group` value using a case-sensitive comparator (updated during implementation from an initially case-insensitive comparator) that returns `0` for equal values, relying on native stable sort to preserve each option's original relative order within a group, in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.ts` (research.md §6, FR-005/FR-012)
- [X] T009 [US1] Add a `groupedFilteredOptions$: Observable<AutoCompleteGroup[]>` derived from `filteredOptions` via `map()`, bucketing the already-sorted, already-filtered array into contiguous groups whenever the `group` value changes (case-sensitive equality), using `''` as the label for the blank group, in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.ts` (research.md §4, data-model.md → `AutoCompleteGroup`)
- [X] T010 [US1] Add a second, `hasGroupBy`-gated `<mat-optgroup>` render block inside `mat-autocomplete` that iterates `groupedFilteredOptions$ | async` (nesting the existing per-option markup, including secondary text), leaving the current flat `*ngFor="let opt of filteredOptions | async"` block completely untouched as the non-grouped path, in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.html` (research.md §4, FR-002/FR-004/FR-006/FR-008)
- [X] T011 [P] [US1] Adjust `.psdk-autocomplete-panel` SCSS rules, if visual verification (quickstart.md §2) shows overflow or misalignment, so `mat-optgroup` labels and nested options inherit the same width/wrapping treatment already applied to `mat-option` in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.scss` — evaluated: the existing `.psdk-autocomplete-panel .mat-mdc-option` selector already applies to options nested inside `mat-optgroup` (same DOM class, same panel container), so no SCSS change was needed
- [X] T012 [US1] Add unit tests for group-by field resolution (with/without `@P `/`@USER `/leading-dot prefixes) and column-descriptor derivation guarded by list type, in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.spec.ts` (quickstart.md §1)
- [X] T013 [US1] Add unit tests for `group` population and blank-value normalization in `fillOptions()`, and for ascending/case-sensitive/stable sorting (including that same-group options keep their original relative order), in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.spec.ts` (quickstart.md §1, FR-005/FR-011/FR-012)
- [X] T014 [US1] Add unit tests for `groupedFilteredOptions$` construction: distinct group values produce separate buckets, same-group options stay contiguous, and the blank group's label is `''`, in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.spec.ts` (quickstart.md §1, FR-003/FR-004)

**Checkpoint**: User Story 1 is fully functional and independently testable — grouped display works end-to-end for a configured group-by field.

---

## Phase 4: User Story 2 - Search within a grouped option list (Priority: P2)

**Goal**: Typing a search term still filters correctly when grouping is enabled, with only matching groups/options shown.

**Independent Test**: With grouping configured, type a search term that matches options in more than one group and verify the filtered results remain organized under their respective group headers, with non-matching groups and options omitted.

### Implementation for User Story 2

- [X] T015 [US2] Confirm `_filter()` is unchanged — it must continue to match only `option.value`/`option.secondarySearchText` and never read `option.group` — adding an explicit code comment noting this invariant in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.ts` (research.md §7, FR-007)
- [X] T016 [US2] Add unit tests confirming that after filtering, `groupedFilteredOptions$` includes only groups containing at least one matching option and produces no bucket for groups with zero matches, in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.spec.ts` (quickstart.md §1, FR-007)
- [X] T017 [US2] Add a unit test confirming an option matching only via `secondarySearchText` still appears grouped under its correct header after filtering, in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.spec.ts` (FR-008)
- [X] T018 [US2] Add a unit test confirming a search term matching only a group's value (not any option's own primary/secondary text) does NOT surface that group's options, in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.spec.ts` (FR-007, Clarifications session 2026-09-21)

**Checkpoint**: User Stories 1 AND 2 both work independently — search and grouping compose correctly.

---

## Phase 5: User Story 3 - Existing AutoComplete configurations keep working (Priority: P3)

**Goal**: Zero observable change for any AutoComplete field that does not configure a group-by field, and no grouping applied to associated/local-list options.

**Independent Test**: Load an existing AutoComplete field configuration that has no group-by field defined, exercise typing, filtering, keyboard navigation, and selection, and verify behavior and appearance match the pre-feature experience exactly.

### Implementation for User Story 3

- [X] T019 [US3] Add a regression unit test confirming that when no `config.groupsFields` is present, no option carries a `group` property, `hasGroupBy` is `false`, and `fillOptions()`/`_filter()` output matches the pre-feature `{key, value}` shape exactly, in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.spec.ts` (FR-002/FR-009)
- [X] T020 [US3] Add a regression unit test confirming `listType === 'associated'` never derives a `group` value or sets `hasGroupBy`, even if `config.groupsFields` is present in raw metadata, in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.spec.ts` (FR-013)
- [X] T021 [US3] Run the full `auto-complete.component.spec.ts` suite (existing + new tests from T012–T020) and confirm zero regressions against the Phase 1 (T001) baseline — verified via full-suite run: 149/150 executed, 31 passing (16 new, all passing) vs. the same 118 pre-existing/unrelated failures as baseline
- [ ] T022 [US3] Manually validate quickstart.md §2 scenario 1 (ungrouped baseline) using the existing `projects/angular-test-app/tests/e2e/DigV2/FormFields/Picklist.spec.js` and `projects/angular-test-app/tests/e2e/DigV2/ComplexFields/DataReference.spec.js` E2E coverage to confirm no visual/behavioral change for consumers without a group-by field configured — **not run**: requires a live Pega Infinity server + running test app, unavailable in this environment

**Checkpoint**: All user stories are independently functional; backward compatibility is confirmed by regression tests and existing E2E coverage.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all stories

- [ ] T023 [P] Manually run quickstart.md §2 scenarios 2–5 (grouped display, search-in-groups, blank group, case-sensitivity) against a live datapage configured with a group-by field — **not run**: requires a live Pega Infinity server + running test app, unavailable in this environment
- [X] T024 Run `npm run lint` and fix any issues introduced by the new code (Constitution VI) — `npx eslint` scoped to the auto-complete component reported zero errors/warnings
- [X] T025 Confirm test coverage for `auto-complete.component.ts` has not regressed below the level on `main` (Constitution VI) — coverage increased (53.65% statements / 61.53% functions post-change vs. a near-zero baseline measured via `git stash`), no regression

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001) completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) completion
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) **and** User Story 1 (Phase 3), since grouped search verification exercises `groupedFilteredOptions$` built in Phase 3
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2); can run in parallel with Phase 3/4 since its tests only assert the *absence* of grouping behavior, but is listed last to match its P3 priority and because T021/T022 validate the fully-assembled feature
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### Within Each User Story

- Column/data-shape changes before sort/group-construction changes
- Sort/group-construction changes before template wiring
- Implementation before its corresponding unit tests
- Story complete before moving to the next priority

### Parallel Opportunities

- T011 (SCSS) can run in parallel with T012–T014 (spec.ts tests), since they touch different files
- T023 (manual E2E) can run in parallel with T024/T025 (lint/coverage), since they are independent checks
- Tasks within the same file (`auto-complete.component.ts` or `auto-complete.component.spec.ts`) are **not** marked `[P]` — they must be done sequentially to avoid edit conflicts

---

## Parallel Example: User Story 1

```bash
# T011 (different file: .scss) can run alongside the spec.ts test tasks:
Task: "Adjust .psdk-autocomplete-panel SCSS rules in auto-complete.component.scss"
Task: "Add unit tests for group-by field resolution in auto-complete.component.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (baseline)
2. Complete Phase 2: Foundational (metadata reading, data shape, column descriptor)
3. Complete Phase 3: User Story 1 (grouped display)
4. **STOP and VALIDATE**: Run quickstart.md §1 unit tests and §2 scenario 2 manually
5. Deploy/demo if ready — grouped display alone already delivers the core value

### Incremental Delivery

1. Setup + Foundational → group-by metadata can be read, no visible change yet
2. Add User Story 1 → grouped display works → validate independently
3. Add User Story 2 → search stays correct with grouping → validate independently
4. Add User Story 3 → regression tests lock in backward compatibility → validate independently
5. Polish → full manual quickstart pass, lint, coverage check

---

## Notes

- `[P]` tasks = different files, no dependencies
- `[US1]`/`[US2]`/`[US3]` labels map tasks to spec.md's user stories for traceability
- Tests are included per Constitution Principle VI, not because the spec explicitly requested them
- Commit after each task or logical group
- Stop at any checkpoint to validate a story independently before proceeding
- Avoid: vague tasks, same-file conflicts, cross-story dependencies that break independence
