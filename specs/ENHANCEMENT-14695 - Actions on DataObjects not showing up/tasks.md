---
description: "Task list for Data Object Actions and Modal Submission"
---

# Tasks: Data Object Actions and Modal Submission

**Input**: Design documents from `/specs/ENHANCEMENT-14695 - Actions on DataObjects not showing up/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Test tasks **are included and are not optional** for this feature. Constitution
Principle VI requires unit tests for every behavior change and E2E validation for changes
affecting case flow or form behavior, and the Constitution Check in [plan.md](./plan.md)
commits to them.

**Organization**: Tasks are grouped by user story. All three stories are P1; they are
ordered so that User Story 1 alone is a shippable increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in every task

## Path Conventions

All source paths are relative to the repository root. Library source lives under
`packages/angular-sdk-components/src/`. There is no separate tests tree — Karma specs sit
beside the components they cover, per existing repository convention.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish an attributable baseline and confirm the environment can exercise the feature

- [X] T001 Record a green baseline by running `npm run lint` and `npx ng test angular-sdk-components --watch=false` from the repository root, so any later failure is attributable to this feature
- [ ] T002 [P] Confirm the Infinity application referenced by `sdk-config.json` exposes a data object with at least one record action and one create-case action, a data object with **no** actions, and a work case type for regression comparison, as required by the scenarios in [quickstart.md](./quickstart.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared typed contracts consumed by all three user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Create the shared action metadata interfaces (`DataObjectAction`, `CreateCaseAction`, `CreateCaseInput`, `DataRecordContext`) in `packages/angular-sdk-components/src/lib/_types/data-object-action.types.ts` per [data-model.md](./data-model.md), mirroring the export convention already used by `packages/angular-sdk-components/src/lib/_types/PConnProps.interface.ts`

**Checkpoint**: Shared types available — user story implementation can begin

---

## Phase 3: User Story 1 - Use actions on a data object record (Priority: P1) 🎯 MVP

**Goal**: A data object record's Actions menu lists its record actions and create-case actions, each opening in a modal; the trigger is disabled when there are no entries at all.

**Independent Test**: Open a data object record with actions and confirm the menu is populated and each entry opens a modal; open a record with no actions and confirm the Actions button is disabled. Work case menus are unchanged. Requires no modal footer work.

### Tests for User Story 1

- [X] T004 [P] [US1] Extend `packages/angular-sdk-components/src/lib/_components/template/case-view/case-view.component.spec.ts` to cover `dataInfo` action sourcing, the `[]` fallback when the `dataInfo` context is absent, and `bActionsMenuDisabled$` being true only when all four action arrays are empty
- [X] T005 [P] [US1] Extend `packages/angular-sdk-components/src/lib/_components/template/self-service-case-view/self-service-case-view.component.spec.ts` with the same coverage, plus an assertion that the existing `showCaseActions` configuration gate still controls visibility

### Implementation for User Story 1

- [X] T006 [US1] In `packages/angular-sdk-components/src/lib/_components/template/case-view/case-view.component.ts`, read `pConn$.getValue('.actions', 'dataInfo')` inside the existing `fullUpdate()` pass and populate new `arDataObjectActions$`, `arCreateCaseActions$`, and `bActionsMenuDisabled$` properties, leaving the existing `caseInfo` reads and `editAction` logic untouched
- [X] T007 [US1] In `packages/angular-sdk-components/src/lib/_components/template/case-view/case-view.component.ts`, add `_menuDataObjectActionClick` and `_menuCreateCaseActionClick` handlers following the existing `_menuActionClick` / `_menuProcessClick` style, per [contracts/case-view-data-object-actions.md](./contracts/case-view-data-object-actions.md) (depends on T006)
- [X] T008 [US1] In `packages/angular-sdk-components/src/lib/_components/template/case-view/case-view.component.html`, add two `ng-container` loops emitting `mat-menu-item` buttons for the new arrays after the existing two loops, and bind `[disabled]="bActionsMenuDisabled$"` on the Actions trigger button (depends on T007)
- [X] T009 [P] [US1] Apply the equivalent sourcing and handlers to `packages/angular-sdk-components/src/lib/_components/template/self-service-case-view/self-service-case-view.component.ts`, preserving its `getCaseLocaleReference()`-derived `localeKey` rather than copying the case-view localization approach (see [research.md](./research.md) R6)
- [X] T010 [US1] Apply the equivalent rendering to `packages/angular-sdk-components/src/lib/_components/template/self-service-case-view/self-service-case-view.component.html`, keeping the surrounding `showCaseActions` gate intact (depends on T009)

**Checkpoint**: Data object action menus work on both views and are disabled when empty. Shippable on its own.

---

## Phase 4: User Story 2 - Edit or create a data object record (Priority: P1)

**Goal**: A single-record data object modal shows a Cancel button and one correctly labeled primary button that saves the record and closes the modal.

**Independent Test**: Open an edit modal and confirm the primary button reads "Update"; open a create modal or record action and confirm it reads "Submit". Confirm a valid save closes the modal and Cancel discards the change. Confirm the multi-record modal is unaffected.

### Tests for User Story 2

- [X] T011 [P] [US2] Create `packages/angular-sdk-components/src/lib/_components/field/data-view-action-buttons/data-view-action-buttons.component.spec.ts` covering the label mapping for all three `RESOURCE_STATUS` values and the correct actions-API branch per status. The spec must stub `globalThis.PCore` **before** component instantiation (the component reads `PCore.getLocaleUtils()` in a field initializer) and must register the standalone component via `imports:`, not `declarations:`

### Implementation for User Story 2

- [X] T012 [P] [US2] Create `packages/angular-sdk-components/src/lib/_components/field/data-view-action-buttons/data-view-action-buttons.component.ts` with the typed inputs and `closeActionsDialog` output defined in [contracts/data-view-action-buttons.md](./contracts/data-view-action-buttons.md), using the `$`-suffix and `b`-prefix conventions
- [X] T013 [P] [US2] Create `packages/angular-sdk-components/src/lib/_components/field/data-view-action-buttons/data-view-action-buttons.component.html` with an Angular Material Cancel button and primary button, both labels resolved through `PCore.getLocaleUtils().getLocaleValue` under the `Data Object` category, and both bound to `[disabled]="bDisabled$"`
- [X] T014 [P] [US2] Create `packages/angular-sdk-components/src/lib/_components/field/data-view-action-buttons/data-view-action-buttons.component.scss` mirroring `list-view-action-buttons.component.scss`
- [X] T015 [US2] Implement the primary-button branching in `data-view-action-buttons.component.ts` — `createDataObject(context$)`, `updateDataObject(context$, keys$)`, or `submitDataObjectAction(context$, keys$, actionID$)` — publishing `DATA_OBJECT_CREATED` or `DATA_OBJECT_UPDATED` on success and emitting `closeActionsDialog` (depends on T012)
- [X] T016 [US2] Implement `onCancel` in `data-view-action-buttons.component.ts` to emit `closeActionsDialog` then call `cancelDataObject(context$)`, guarding against its non-Promise return type documented in [research.md](./research.md) R2 (depends on T012)
- [X] T017 [US2] Register `DataViewActionButtons` in `packages/angular-sdk-components/src/lib/_bridge/helpers/sdk-pega-component-map.ts` by adding the import and map entry alongside the existing `ListViewActionButtons` entry — add only, remove nothing
- [X] T018 [P] [US2] Add `export * from './lib/_components/field/data-view-action-buttons/data-view-action-buttons.component';` to `packages/angular-sdk-components/src/public-api.ts` (required by AGENTS.md rule 3 and Principle II even though the `ListViewActionButtons` precedent omits it — see [research.md](./research.md) R7)
- [X] T019 [US2] In `packages/angular-sdk-components/src/lib/_components/infra/Containers/modal-view-container/modal-view-container.component.ts`, promote the existing `createView()` locals to the fields `dataObjectAction$`, `dataObjectActionID$`, `dataObjectKey$`, `dataObjectClassID$`, and add `bIsDataObjectRecord$ = isDataObject && !isMultiRecordData`, leaving `this.isMultiRecord` and the `title$` expression unchanged and adding a one-line comment explaining the flag (infrastructure container — additive only)
- [X] T020 [US2] In `packages/angular-sdk-components/src/lib/_components/infra/Containers/modal-view-container/modal-view-container.component.html`, render the new component through `<component-mapper>` inside a block gated on `bIsDataObjectRecord$`, as a sibling of the existing `*ngIf="isMultiRecord"` block, reusing the existing `closeActionsDialog` handler (depends on T017, T019)

**Checkpoint**: Data object modals save and cancel correctly; embedded-data modals unchanged.

---

## Phase 5: User Story 3 - Recover from a failed save (Priority: P1)

**Goal**: A rejected save surfaces an in-modal error banner, keeps the modal open with data intact, and cannot be double-submitted.

**Independent Test**: Force a server rejection and confirm an error banner appears inside the modal, the modal stays open with entered data preserved, both buttons are disabled during the request, and a retry succeeds.

### Tests for User Story 3

- [X] T021 [P] [US3] Extend `packages/angular-sdk-components/src/lib/_components/field/data-view-action-buttons/data-view-action-buttons.component.spec.ts` to assert that a rejected save does **not** emit `closeActionsDialog`, that `bDisabled$` is true while the promise is pending, and that it resets to false after both resolution and rejection
- [X] T022 [P] [US3] Extend `packages/angular-sdk-components/src/lib/_components/infra/Containers/modal-view-container/modal-view-container.component.spec.ts` to assert `getBanners()` includes `httpMessages` sourced from `angularPConnectData`, and that its output is unchanged when `httpMessages` is absent

### Implementation for User Story 3

- [X] T023 [US3] In `packages/angular-sdk-components/src/lib/_components/infra/Containers/modal-view-container/modal-view-container.component.ts`, merge `httpMessages: this.angularPConnectData.httpMessages` into the `getBanners()` call with a one-line comment noting the bridge stores it outside state props — do not modify `_helpers/case-utils.ts` or `_bridge/angular-pconnect.ts` (see [research.md](./research.md) R4)
- [X] T024 [US3] Ensure both the primary and Cancel buttons are disabled while a save is in flight in `data-view-action-buttons.component.ts` and its template — note the `ListViewActionButtons` precedent disables only its submit button, which does not satisfy FR-009 (depends on T015, T016)
- [ ] T025 [US3] Validate against a live rejection that the banner actually renders; if it does not, trigger change detection from the failure path in `data-view-action-buttons.component.ts` rather than altering the bridge's props diffing, per the risk recorded in [research.md](./research.md) R5 (depends on T023)

**Checkpoint**: All three user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T026 [P] Run `npm run lint` and resolve every issue — the repository enforces `--max-warnings=0`
- [X] T027 Run `npx ng test angular-sdk-components --watch=false` and confirm coverage has not regressed against the baseline recorded in T001
- [ ] T028 Execute quickstart scenarios 1–8 in **portal** mode against a live server per [quickstart.md](./quickstart.md)
- [ ] T029 Execute quickstart scenarios 1–8 in **embedded** mode — required for infrastructure container changes by Principle IV
- [X] T030 [P] Run `npm run build-overrides` and confirm it succeeds with the new component present in the generated `packages/angular-sdk-overrides/` output
- [ ] T031 Confirm the FR-012 regressions explicitly: work case action menus, work case modals, work case banners, and the multi-record embedded-data modal footer are all unchanged
- [X] T032 [P] Review the diff for convention compliance — no `any` on the new typed inputs, `$`-suffix and `b`-prefix template properties, no hard-coded user-facing strings, no unrelated changes or dead code

---

## Implementation Notes

### Outstanding tasks (require a live Pega Infinity server)

T002, T025, T028, T029, and T031 remain unchecked because they can only be verified against
a running application and a configured Infinity environment. All code-level work is complete
and unit-tested; these are live-environment validation steps.

### Blockers discovered and fixed during implementation

1. **The unit test suite did not compile.** `packages/angular-sdk-components/tsconfig.spec.json`
   overrode `types` with `["jasmine"]`, dropping `pcore-pconnect-typedefs` inherited from the
   root config. Because `types` replaces rather than merges, every reference to the global
   `PCore` failed with TS2304. Fixed by restoring the type entry; this blocked all mandated
   test tasks.

2. **The application is zoneless.** `provideZonelessChangeDetection()` is used at bootstrap and
   `zone.js` is not a dependency. Async promise callbacks therefore do not trigger change
   detection on their own, so the new component and the banner refresh both call
   `markForCheck()` explicitly. The existing `ListViewActionButtons` pattern was intentionally
   **not** copied, since its `.finally()` reset would not re-render.

3. **`httpMessages` was never reaching the banner builder**, confirming research R4. In
   addition, because the bridge excludes `httpMessages` from its props diff, a rejected save
   does not flag an update at all — so `refreshBanners()` was added to the modal container's
   no-update path (research R5 fallback) rather than altering the bridge.

4. **`AngularPConnectData` did not declare `httpMessages`**, even though the bridge assigns it
   at runtime through an untyped parameter. An optional property was added so the container
   can read it type-safely.

### Pre-existing test suite state (not caused by this feature)

The library's Karma suite was already largely broken: 118 of 125 tests failed at baseline
because the legacy specs use `waitForAsync()` (requires zone.js, absent) and register
standalone components via `declarations:`. Repairing all of them is outside this feature's
scope. The four spec files touched here were rewritten to work in the zoneless environment.

| | Total | Passing | Failing |
|---|---|---|---|
| Baseline | 125 | 7 | 118 |
| After this feature | 152 | 37 | 115 |

All 27 new tests pass, 3 previously-failing tests were fixed, and no test regressed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 only. Independent of US2 and US3
- **User Story 2 (Phase 4)**: Depends on Phase 2 only. Independent of US1
- **User Story 3 (Phase 5)**: Depends on Phase 2; T024 depends on US2 implementation (T015, T016). T023 and T022 are independent of US2 and may proceed in parallel with it
- **Polish (Phase 6)**: Depends on all targeted stories being complete

### User Story Dependencies

- **US1 (P1)**: Fully independent — touches only the two case view components
- **US2 (P1)**: Fully independent of US1 — touches the new component, registration, and the modal container
- **US3 (P1)**: Shares files with US2. The banner fix (T023) is independent, but the in-flight disabling (T024) extends the component built in US2

### Within Each User Story

- Tests are written alongside implementation and must pass before the story is considered complete
- Component TypeScript before its template, since the template binds properties defined in the class
- Component creation before registration; registration before the container renders it

### Parallel Opportunities

- T002 runs parallel to T001
- **US1 and US2 can be built simultaneously by two people** — they share no files
- Within US1: the case-view group (T006→T007→T008) and the self-service group (T009→T010) touch different components and run in parallel
- Within US2: T012, T013, T014, and T018 are different files and can start together
- Test tasks T004/T005, T011, and T021/T022 are each in separate files and parallelizable
- In Polish: T026, T030, and T032 are independent

---

## Parallel Example: User Story 1

```text
Developer A: T006 → T007 → T008    (case-view component)
Developer B: T009 → T010           (self-service-case-view component)
Both:        T004 and T005 in parallel (separate spec files)
```

---

## Implementation Strategy

### MVP scope

**User Story 1 alone is the MVP.** It resolves the most visible defect — the Actions menu
that opens completely empty — and requires no changes to the modal container or any new
component. It can be merged and shipped before US2 and US3 exist.

### Incremental delivery

1. Complete Phase 1 and Phase 2 (3 tasks) → shared types in place
2. Complete Phase 3 → **MVP shippable**: action menus populated and correctly disabled
3. Complete Phase 4 → data object modals become usable end to end
4. Complete Phase 5 → failure handling hardened
5. Complete Phase 6 → validated in both modes and ready for review

### Risk sequencing

The highest-uncertainty task is **T025** (banner rendering after a rejected save), because
`httpMessages` is deliberately excluded from the bridge's props diff. Tackle T023 early in
Phase 5 so any need for the change-detection fallback is discovered before the phase closes,
and keep the remedy inside the new component so the shared bridge stays untouched.
