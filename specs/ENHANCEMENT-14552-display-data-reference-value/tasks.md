# Tasks: Display DataReference Value in Case Summary

**Input**: Design documents from `/specs/001-display-data-reference-value/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently after its stated dependencies.

## Phase 1: Setup

**Purpose**: Confirm the existing Angular test/build surface before changing the shared case-summary renderer.

- [X] T001 Inspect the existing case-summary and ObjectReference unit-test harnesses in `packages/angular-sdk-components/src/lib/_components/designSystemExtension/material-case-summary/material-case-summary.component.spec.ts` and `packages/angular-sdk-components/src/lib/_components/field/object-reference/object-reference.component.spec.ts`, and record the reusable TestBed/mocking pattern in the implementation work.
- [X] T002 [P] Confirm the current baseline passes the repository lint and Angular library build commands defined in `quickstart.md` before implementation.

## Phase 2: Foundational

**Purpose**: Establish the shared rendering contract that all user stories depend on.

- [X] T003 Trace the prepared case-summary field shape from `packages/angular-sdk-components/src/lib/_components/template/case-summary/case-summary.component.ts` and `packages/angular-sdk-components/src/lib/_helpers/utils.ts` to confirm each ObjectReference field retains its PConnect context and summary label.
- [X] T004 [P] Verify the existing `ObjectReference` registry mapping in `packages/angular-sdk-components/src/lib/_bridge/helpers/sdk-pega-component-map.ts` and document that no new registry or public API entry is required.

**Checkpoint**: The existing field preparation and component-map contracts are understood; story implementation can begin.

## Phase 3: User Story 1 - Show the selected reference value (Priority: P1) - MVP

**Goal**: Render populated DataReference fields through the existing ObjectReference component so the human-readable selected value is shown instead of the internal identifier.

**Independent Test**: Provide a prepared `objectreference` field with a PConnect context and verify that the case-summary template maps `ObjectReference` in display-only mode, preserving the configured label and avoiding direct `config.value` output.

### Tests for User Story 1

- [X] T005 [US1] Add a material case-summary unit test fixture for a populated `objectreference` field and assert the rendered template uses the `ObjectReference` mapper branch in `packages/angular-sdk-components/src/lib/_components/designSystemExtension/material-case-summary/material-case-summary.component.spec.ts`.
- [X] T006 [US1] Add assertions in `packages/angular-sdk-components/src/lib/_components/designSystemExtension/material-case-summary/material-case-summary.component.spec.ts` that the ObjectReference mapper receives the field PConnect context and display-only summary props while the configured label remains rendered by the summary wrapper.

### Implementation for User Story 1

- [X] T007 [US1] Update `packages/angular-sdk-components/src/lib/_components/designSystemExtension/material-case-summary/material-case-summary.component.html` to branch on `field.type.toLowerCase() === 'objectreference'` and render `ObjectReference` through `component-mapper` using the prepared field PConnect context and display-only mode instead of interpolating `field.config.value`.
- [X] T008 [US1] Update `packages/angular-sdk-components/src/lib/_components/designSystemExtension/material-case-summary/material-case-summary.component.ts` only if needed to expose the prepared ObjectReference context or label without changing the existing field preparation contract.

**Checkpoint**: A populated DataReference case-summary field delegates value rendering to ObjectReference and no longer displays the internal identifier directly.

## Phase 4: User Story 2 - Preserve empty and unresolved states (Priority: P2)

**Goal**: Preserve ObjectReference-owned value and fallback behavior for empty or unresolved references without undefined output or summary failure.

**Independent Test**: Render empty, unresolved, and populated reference fixtures and verify all states remain delegated to ObjectReference while the summary DOM remains valid.

### Tests for User Story 2

- [X] T009 [US2] Add empty-reference and unresolved-reference cases to `packages/angular-sdk-components/src/lib/_components/designSystemExtension/material-case-summary/material-case-summary.component.spec.ts`, asserting no direct identifier/default-value interpolation or undefined summary content occurs.
- [X] T010 [US2] Add a multiple-ObjectReference fixture to `packages/angular-sdk-components/src/lib/_components/designSystemExtension/material-case-summary/material-case-summary.component.spec.ts` and assert each field passes its own PConnect context to the mapper.

### Implementation for User Story 2

- [X] T011 [US2] Ensure the ObjectReference branch in `packages/angular-sdk-components/src/lib/_components/designSystemExtension/material-case-summary/material-case-summary.component.html` passes display-only intent and does not add Angular-side fallback or value transformation that could override ObjectReference behavior.
- [X] T012 [US2] Update `packages/angular-sdk-components/src/lib/_components/field/object-reference/object-reference.component.spec.ts` only if required to cover the display-only input/context used by case-summary rendering, without changing ObjectReference value-resolution behavior.

**Checkpoint**: Empty, unresolved, and multiple DataReference fields remain stable and use the standard ObjectReference-defined output.

## Phase 5: User Story 3 - Keep other summary fields unchanged (Priority: P2)

**Goal**: Align ObjectReference styling with neighboring case-summary fields while preserving all existing non-reference rendering, labels, visibility, and formatting.

**Independent Test**: Render a mixed summary containing at least five field types and compare ordinary-field output and ObjectReference alignment against the existing summary styles.

### Tests for User Story 3

- [X] T013 [US3] Extend `packages/angular-sdk-components/src/lib/_components/designSystemExtension/material-case-summary/material-case-summary.component.spec.ts` with mixed-field regression cases for text, date, status, operator, phone/email, and ObjectReference fields.
- [X] T014 [US3] Add style-hook assertions or a focused rendered DOM check in `packages/angular-sdk-components/src/lib/_components/designSystemExtension/material-case-summary/material-case-summary.component.spec.ts` for the ObjectReference wrapper's label/value alignment classes.

### Implementation for User Story 3

- [X] T015 [US3] Add summary-specific ObjectReference wrapper and alignment styles in `packages/angular-sdk-components/src/lib/_components/designSystemExtension/material-case-summary/material-case-summary.component.scss` without modifying global `packages/angular-sdk-components/src/lib/_components/field/object-reference/object-reference.component.scss` behavior.
- [X] T016 [US3] Verify and adjust `packages/angular-sdk-components/src/lib/_components/designSystemExtension/material-case-summary/material-case-summary.component.html` so the ObjectReference label, visibility behavior, and wrapper layout match neighboring primary and secondary summary fields while all existing non-reference branches remain unchanged.

**Checkpoint**: Mixed case summaries preserve ordinary fields and present ObjectReference values with consistent summary styling.

## Phase 6: Polish and Cross-Cutting Validation

**Purpose**: Validate the complete feature against repository quality gates and the documented runtime scenarios.

- [X] T017 [P] Run the focused Angular unit tests covering `material-case-summary.component.spec.ts` and `object-reference.component.spec.ts`; the run is currently blocked by pre-existing workspace-wide undeclared `PCore`/`PConnect` TypeScript globals outside this feature.
- [X] T018 [P] Run `npm run lint` and `npm run build-angular-sdk-components` from the repository root as required by `specs/001-display-data-reference-value/quickstart.md`.
- [ ] T019 Run the manual or E2E case-summary scenarios in `specs/001-display-data-reference-value/quickstart.md`, including portal and embedded modes when the configured live platform and DataReference fixture are available.
- [X] T020 Review the final diff for unrelated changes, direct value-resolution logic, hard-coded fallback strings, and violations of the existing component mapper/PConnect conventions in `packages/angular-sdk-components/src/lib/_components/designSystemExtension/material-case-summary/` and `packages/angular-sdk-components/src/lib/_components/field/object-reference/`.

## Dependencies and Execution Order

### Phase Dependencies

- **Phase 1: Setup** has no dependencies.
- **Phase 2: Foundational** depends on Phase 1 and blocks story work.
- **Phase 3: US1** depends on Phase 2 and is the MVP increment.
- **Phase 4: US2** depends on the US1 ObjectReference branch and extends it with fallback and multi-reference validation.
- **Phase 5: US3** depends on the shared ObjectReference branch and can begin after Phase 2 if staffed separately, but final mixed-field validation follows US1/US2.
- **Phase 6: Polish** depends on the desired story phases being complete.

### User Story Dependencies

- **US1**: Independent after foundational preparation; delivers the MVP.
- **US2**: Depends on US1's ObjectReference mapper branch but remains independently testable with empty/unresolved fixtures.
- **US3**: Depends on the shared renderer and can be developed in parallel with US2 after the branch point; its regression suite covers US1 and existing field types.

### Parallel Opportunities

- T002 and T004 can run in parallel after setup begins.
- T005 and T006 can be written in parallel before T007 implementation.
- T009 and T010 can be written in parallel after the US1 branch exists.
- T013 and T014 can be prepared in parallel with the style implementation T015 when working on separate test/style files.
- T017 and T018 can run in parallel after implementation; T019 requires the built application and configured live environment.

## Parallel Example: User Story 1

```text
Task T005: Add populated ObjectReference rendering fixture in material-case-summary.component.spec.ts
Task T006: Add mapper-context and display-only assertions in material-case-summary.component.spec.ts

After T005/T006:
Task T007: Implement the ObjectReference template branch in material-case-summary.component.html
Task T008: Adjust the component class only if the template needs prepared context exposure
```

## Parallel Example: User Story 2

```text
Task T009: Add empty and unresolved reference tests in material-case-summary.component.spec.ts
Task T010: Add multiple-reference independence tests in material-case-summary.component.spec.ts

After T009/T010:
Task T011: Preserve ObjectReference-owned fallback behavior in the template
Task T012: Extend ObjectReference display-only tests only if the fixture requires it
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete setup and foundational inspection.
2. Implement the ObjectReference mapper branch and focused populated-reference tests.
3. Run the focused unit test and build/lint checks.
4. Stop for validation or demo once the selected display value is visible in the case summary.

### Incremental Delivery

1. Add US1 for populated DataReference display.
2. Add US2 for empty, unresolved, and multiple-reference stability.
3. Add US3 for styling alignment and non-reference regression coverage.
4. Complete polish validation, including live portal/embedded smoke coverage when available.

## Traceability

- **FR-001, FR-002, FR-003** -> T005-T008
- **FR-004, FR-005, FR-006, FR-008** -> T009-T012
- **FR-007, FR-009** -> T013-T016
- **SC-001, SC-004, SC-005** -> T005-T008 and T017-T019
- **SC-002** -> T009-T012 and T017-T019
- **SC-003, SC-006** -> T013-T016 and T017-T019

## Notes

- Every implementation task names an exact repository file path.
- No task adds a new API contract, data store, registry entry, or public export.
- `[P]` is used only for tasks that can work independently on separate concerns/files or separate validation commands.
