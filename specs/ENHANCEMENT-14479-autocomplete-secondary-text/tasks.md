---

description: "Task list template for feature implementation"
---

# Tasks: AutoComplete Secondary Text

**Input**: Design documents from `/specs/001-autocomplete-secondary-text/`

**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required for user stories), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Included. The project constitution (VI. Testing Standards) requires unit tests for every behavior change, so test tasks are mandatory here, not optional.

**Organization**: Tasks are grouped by user story (from `spec.md`) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

All work is confined to the existing Angular library structure (per `plan.md`'s Project
Structure / Structure Decision — single project, no new files or directories):

- `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.ts`
- `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.html`
- `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.scss`
- `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.spec.ts`
- `projects/angular-test-app/tests/e2e/` (optional Playwright coverage only)

---

## Phase 1: Setup

**Purpose**: Resolve the one open verification item from `research.md` before any typed/code
changes depend on it.

- [ ] T001 Confirm the real secondary-field metadata shape (`columnFormatter` vs
  `columnsFormatter`, exact nesting under `config`, and whether `.config.value` is the correct
  path) against a live/authored AutoComplete field configuration, and record the confirmed
  shape in `specs/001-autocomplete-secondary-text/research.md` (resolves the ⚠️ OPEN QUESTION
  in research.md §1) **[BLOCKED: no live Pega Infinity/authoring instance reachable in this
  environment — implementation proceeded using the documented Multiselect precedent
  (`columnsFormatter`, plural, via `getRawMetadata()`) as the working assumption; re-verify
  against a real authored AutoComplete field before shipping]**

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the column/option data model and metadata processing so both the display
(US1) and search (US2) stories have the data they need. No user story can be completed until
this phase is done.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 [P] Add the `secondary` column flag and the additive `AutoCompleteOption` shape
  (`secondaryComponents`, `secondarySearchText`, per
  [data-model.md](./data-model.md)) to the type definitions in
  `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.ts`
- [X] T003 Implement secondary-field metadata extraction/normalization
  (`pConn$.getRawMetadata()?.config?.columnsFormatter`, per the shape confirmed in T001;
  strip only a leading `@P ` or `@USER ` token) as a helper function in
  `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.ts`
  (depends on T001, T002)
- [X] T004 Update `generateColumnsAndDataSource()` in
  `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.ts`
  to append secondary columns (`display: 'true'`, `useForSearch: true`, `secondary: 'true'`)
  built from T003's normalized fields, preserving their configured order (depends on T003)
- [X] T005 Update `getDisplayFieldsMetaData()` in
  `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.ts`
  to classify a column as secondary only when `display === 'true' && secondary === 'true'`
  (explicit flag check, not an implicit "else" bucket) (depends on T002)
- [X] T006 Implement `secondaryComponents` construction in `fillOptions()`/`setOptions()` in
  `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.ts`:
  for each configured secondary column (in order), resolve its raw value from the current Data
  Page result row and create a read-only component via
  `pConn$.createComponent({ type: <columnsFormatter field type>, config: { value, displayMode: 'DISPLAY_ONLY', readOnly: true, label } }, '', 0, {})`
  (mirrors `ScalarListComponent`'s pattern) and push `{ property, component }` onto the option's
  `secondaryComponents` array — **regardless of whether the value is empty**, so `FieldValueList`'s
  own empty-value placeholder (e.g. "Product Name: ---") renders instead of omitting the field
  (depends on T004, T005; research.md §4a)
- [X] T007 Implement `secondarySearchText` construction in `fillOptions()`/`setOptions()` in
  `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.ts`:
  independently of T006, for the same configured secondary columns, convert each *raw* value to
  a lowercase plain string, exclude empty/whitespace values, and join the remainder with a
  single space into `secondarySearchText` on the option — never derived from `secondaryComponents`'
  rendered output (depends on T004, T005; research.md §4b)

**Checkpoint**: Foundation ready — option objects now carry secondary display and search data;
user story implementation can begin.

---

## Phase 3: User Story 1 - View contextual detail for an option (Priority: P1) 🎯 MVP

**Goal**: Show each option's secondary (contextual) text beneath its primary text in the
dropdown, wrapping within the option's width with no horizontal scroll, while options without
secondary text remain visually unchanged.

**Independent Test**: Configure an AutoComplete field with secondary columns, open the
dropdown, and confirm each option shows primary text with secondary text beneath it (wrapping,
no horizontal scroll at any length); confirm an option with no secondary data looks unchanged.

### Tests for User Story 1

- [X] T011 [P] [US1] Add unit tests in
  `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.spec.ts`
  covering: an option with secondary fields renders one component per field via
  `component-mapper`, separated by `·`; an option without secondary fields renders no extra
  components (unchanged, primary text only); an option with an empty/whitespace secondary value
  still creates a component for that field so `FieldValueList` renders its own empty-value
  placeholder (quickstart.md checks #2–#4)

### Implementation for User Story 1

- [X] T008 [P] [US1] Render `opt.secondaryComponents` inside each `mat-option`, guarded by
  `*ngIf="opt.secondaryComponents?.length"`, iterating in order via `*ngFor` and
  `<component-mapper [name]="comp.getPConnect().getComponentName()" [props]="{ pConn$: comp.getPConnect(), formGroup$ }">`
  for each entry, with a literal `·` separator element between adjacent entries (not before the
  first or after the last), in
  `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.html`
  (depends on T006)
- [X] T009 [US1] Add a scoped CSS class via `mat-autocomplete`'s `class` input (per
  research.md §3) and override the option's wrapping/height (`white-space: normal`,
  `height: auto`) plus the panel's `overflow-x: hidden`, in
  `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.scss`
  (depends on T008)
- [X] T010 [US1] Mark each `·` separator element from T008 `aria-hidden="true"` so screen
  readers announce only the rendered field components' own accessible content, not the
  decorative separators (research.md §7), in
  `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.html`
  (depends on T008)

**Checkpoint**: User Story 1 is fully functional and independently testable — secondary text is
visible, wraps without horizontal overflow, and options without secondary text are unchanged.

---

## Phase 4: User Story 2 - Search by secondary text (Priority: P2)

**Goal**: Let users find an option by typing a term that only appears in its secondary text,
without breaking existing primary-text search.

**Independent Test**: With secondary text visible (US1 complete), type a term that matches
only a secondary value and confirm the option appears; type a term matching only primary text
and confirm it still appears; type a non-matching term and confirm the option is excluded.

### Tests for User Story 2

- [X] T013 [P] [US2] Add unit tests in
  `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.spec.ts`
  covering: a search term matching only `secondarySearchText` returns the option; a search term
  matching only primary text still returns the option (regression guard); a non-matching
  search term excludes the option (quickstart.md checks #5–#7)

### Implementation for User Story 2

- [X] T012 [US2] Update `_filter()` in
  `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.ts`
  to match against `option.value.toLowerCase()` **or** `option.secondarySearchText`, falling
  back to matching only `option.value.toLowerCase()` when `secondarySearchText` is absent
  (depends on T007)

**Checkpoint**: User Stories 1 AND 2 both work independently.

---

## Phase 5: User Story 3 - Existing AutoComplete configurations keep working (Priority: P3)

**Goal**: Guarantee that existing AutoComplete configurations with no secondary columns
continue to render, filter, and select exactly as before this feature shipped.

**Independent Test**: Load an existing AutoComplete configuration with no secondary column
configuration, exercise typing/filtering/selection, and confirm behavior and appearance are
identical to the pre-feature experience.

### Tests for User Story 3

- [X] T014 [P] [US3] Add unit tests in
  `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.spec.ts`
  covering: with no `columnsFormatter`/secondary columns configured, options carry only
  `key`/`value` (no `secondaryComponents`/`secondarySearchText`), rendering shows only primary
  text, and `_filter()` behavior is identical to the pre-feature primary-only match
  (quickstart.md check #1); and separately, with `listType === 'associated'`, options built via
  `utils.getOptionList()` remain plain `{key, value}` untouched by any secondary-column/
  `columnsFormatter` logic (FR-012)

### Implementation for User Story 3

- [ ] T015 [US3] Perform the manual backward-compatibility regression pass from
  `quickstart.md` against an existing AutoComplete sample configuration in
  `projects/angular-test-app` (no code change expected; this task validates T001–T014 did not
  regress the legacy path) **[BLOCKED: requires a running app + reachable Pega Infinity server,
  not available in this environment]**

**Checkpoint**: All three user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup spanning all user stories.

- [ ] T016 [P] Add an optional Playwright spec verifying dropdown wrapping and no horizontal
  scroll in `projects/angular-test-app/tests/e2e/` (per quickstart.md "Optional E2E coverage")
  **[SKIPPED: optional; requires a running app + live server to author/validate against]**
- [ ] T017 Run the full `quickstart.md` manual validation checklist end-to-end (all Success
  Criteria mappings: SC-001–SC-004) **[BLOCKED: requires a running app + reachable Pega
  Infinity server, not available in this environment]**
- [X] T018 Run `npm run lint` and fix any issues introduced by this feature
- [ ] T019 Confirm unit test coverage has not regressed versus `main`, per constitution
  VI. Testing Standards **[BLOCKED: pre-existing Karma/webpack circular-dependency bundling
  issue in this sandbox prevents any spec file from executing — reproduced with an untouched
  component (TextInputComponent), confirming it is unrelated to this feature; fixed an
  unrelated pre-existing `tsconfig.spec.json` regression (missing `pcore-pconnect-typedefs` in
  `types`) that was blocking compilation, but the circular-dependency issue remains and needs a
  maintainer with a working local/CI environment to confirm]**

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001) completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion; no dependency on US2/US3
- **User Story 2 (Phase 4)**: Depends on Foundational completion (specifically T007); best
  demoed after US1 (so secondary text is visible) but does not require US1's UI tasks
  (T008–T010) to be code-complete
- **User Story 3 (Phase 5)**: Depends on Foundational completion; validates that US1/US2
  changes did not break the legacy (no-secondary-column) path
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### Within Each User Story

- Tests are written alongside/before their story's implementation tasks and must fail first
  where feasible (e.g., T011 before T008–T010 are complete)
- Foundational data (Phase 2) before story-specific rendering/search/validation logic
- Story complete before moving to the next priority

### Parallel Opportunities

- T002 (type definitions) can be started in parallel with nothing else in Phase 2 (it is the
  first code task and other Phase 2 tasks depend on it)
- T008 (template) and T011 (tests) within US1 touch different files and can be worked in
  parallel once Phase 2 is complete
- T013 (US2 tests) and T014 (US3 tests) touch the same spec file as T011 but are logically
  independent additions — coordinate to avoid merge conflicts if worked simultaneously
- T016 (Playwright e2e) is in a different project/directory and can run in parallel with any
  Phase 6 task

---

## Parallel Example: User Story 1

```bash
# Once Phase 2 (Foundational) is complete, these two US1 tasks touch different files:
Task: "Render opt.secondaryComponents via component-mapper in auto-complete.component.html"
Task: "Add unit tests for secondary component rendering in auto-complete.component.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T007) — CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T008–T011)
4. **STOP and VALIDATE**: Run quickstart.md's User Story 1 checks (visual/manual) and T011's
   unit tests independently — this alone delivers the spec's core value (users can see
   contextual secondary text) even before search (US2) exists.

### Incremental Delivery

1. Setup + Foundational + US1 → visually complete secondary-text feature, safe to demo/ship
   as an MVP increment
2. Add US2 (T012–T013) → users can now search by secondary text
3. Add US3 validation (T014–T015) → confirms no regression for existing consumers
4. Polish (T016–T019) → E2E coverage, full quickstart pass, lint, coverage check

### Suggested Task Count Summary

- Setup: 1 task (T001)
- Foundational: 6 tasks (T002–T007)
- User Story 1 (P1 — MVP): 4 tasks (T008–T011)
- User Story 2 (P2): 2 tasks (T012–T013)
- User Story 3 (P3): 2 tasks (T014–T015)
- Polish: 4 tasks (T016–T019)
- **Total: 19 tasks**

---

## Phase 7: Convergence

- [X] T020 Fix secondary-field rendering so multiple fields join on one inline line — override
  FieldValueList's `DISPLAY_ONLY` grid layout (`.psdk-container-labels-left`) within a scoped
  selector in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.scss`
  (e.g. under `.psdk-autocomplete-option-secondary`) so each secondary field renders as compact
  inline "label: value" text instead of a stacked two-column grid row, without modifying
  `FieldValueListComponent` itself, per FR-002/FR-004 (contradicts)
- [X] T021 Add the `AutoCompleteColumn` interface documented in data-model.md (with the
  `secondary?: 'true' | 'false'` flag) and use it in place of `any[]`/`any` for `columns`,
  `getSecondaryColumnsFromMetadata()`'s return type, and the `secondaryColumns` parameters in
  `buildSecondaryComponents()`/`buildSecondarySearchText()` in
  `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.ts`,
  per plan: data-model.md `AutoCompleteColumn` interface / Constitution II (partial)
