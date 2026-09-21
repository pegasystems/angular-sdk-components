# Tasks: SimpleTable Add Label Parity

**Input**: Design documents from `specs/001-simple-table-add-label/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

**Tests**: Included because the specification explicitly requires coverage for labels, visibility, configuration updates, and record creation.

**Organization**: Tasks are grouped by the two P1 user stories. User Story 1 delivers the MVP label parity behavior; User Story 2 protects the existing add-action behavior.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the focused unit-test surface for the existing standalone component.

- [X] T001 Update the SimpleTableManual Jasmine fixture and mocks in `packages/angular-sdk-components/src/lib/_components/template/simple-table-manual/simple-table-manual.component.spec.ts` so the component can be created with mocked PConnect, AngularPConnectService, Utils, and localization behavior before feature assertions are added.

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Confirm the existing component update lifecycle is the shared setup for both stories.

- [X] T002 Add reusable test helpers in `packages/angular-sdk-components/src/lib/_components/template/simple-table-manual/simple-table-manual.component.spec.ts` for resolved configuration updates and rendering the Add button without changing production behavior.

**Checkpoint**: The focused component fixture can exercise initial rendering and a subsequent resolved-configuration update.

## Phase 3: User Story 1 - Display the Configured Add-Record Label (Priority: P1) 🎯 MVP

**Goal**: Show the localized target-class-specific Add label, with the localized default Add fallback.

**Independent Test**: Render an editable SimpleTableManual with a target class label, without one, and after a configuration update; assert the visible button text in each state.

### Tests for User Story 1

- [X] T003 [US1] Add Jasmine assertions in `packages/angular-sdk-components/src/lib/_components/template/simple-table-manual/simple-table-manual.component.spec.ts` for a configured target class label, missing or empty target class label fallback, and label refresh after resolved configuration changes.

### Implementation for User Story 1

- [X] T004 [US1] Add a derived localized Add-button label in `packages/angular-sdk-components/src/lib/_components/template/simple-table-manual/simple-table-manual.component.ts` using `targetClassLabel` and the existing `SimpleTable` localization category, with the default localized Add fallback.
- [X] T005 [US1] Bind the Add button in `packages/angular-sdk-components/src/lib/_components/template/simple-table-manual/simple-table-manual.component.html` to the derived label while preserving its existing visibility condition, styling, and `addRecord()` click handler.

**Checkpoint**: User Story 1 is independently functional and the Add button displays the expected custom or fallback label.

## Phase 4: User Story 2 - Preserve Add Availability and Behavior (Priority: P1)

**Goal**: Ensure label support does not alter visibility rules or record creation.

**Independent Test**: Render read-only, add-disabled, and add-enabled configurations; assert hidden/visible states and verify that selecting the enabled Add button invokes the existing add-record operation.

### Tests for User Story 2

- [X] T006 [US2] Add Jasmine regression assertions in `packages/angular-sdk-components/src/lib/_components/template/simple-table-manual/simple-table-manual.component.spec.ts` for read-only and add-disabled visibility, enabled-button rendering, and the existing `addRecord()` action invocation.

### Implementation for User Story 2

- [X] T007 [US2] Verify the label integration in `packages/angular-sdk-components/src/lib/_components/template/simple-table-manual/simple-table-manual.component.ts` leaves `showAddRowButton`, permission handling, and `addRecord()` behavior unchanged; make only narrowly scoped corrections if the regression tests expose a change.

**Checkpoint**: Both user stories work independently, with label customization added and existing add behavior preserved.

## Phase 5: Polish & Cross-Cutting Validation

**Purpose**: Validate the complete feature against repository quality gates and the documented run guide.

- [ ] T008 Run `ng test angular-sdk-components --watch=false` against `packages/angular-sdk-components/tsconfig.spec.json` and confirm all SimpleTableManual label, visibility, configuration-update, and add-action assertions pass.
- [X] T009 Run `npm run lint` and `npm run build-angular-sdk-components` from the repository root `package.json` scripts to verify no lint, formatting, or library-build regressions in the changed component and test files.
- [ ] T010 When the platform test environment is available, run the existing portal and embedded Playwright validation from `specs/001-simple-table-add-label/quickstart.md` and confirm configured-label parity in both modes.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 starts immediately.
- **Foundational (Phase 2)**: T002 depends on T001 and blocks feature-story work.
- **User Story 1 (Phase 3)**: T003 depends on T002; T004 and T005 depend on T003.
- **User Story 2 (Phase 4)**: T006 depends on T005; T007 depends on T006.
- **Polish (Phase 5)**: T008 and T009 depend on T007. T010 depends on T007 and a reachable platform test environment.

### User Story Dependencies

- **User Story 1 (P1)**: Depends only on the shared test foundation; delivers the MVP independently.
- **User Story 2 (P1)**: Uses the label implementation from User Story 1 but is independently validated through regression assertions for visibility and action behavior.

### Parallel Opportunities

- No implementation tasks are marked `[P]` because the production and test changes are concentrated in the same SimpleTableManual slice.
- After T007, T008 and T009 can run in parallel because they are independent validation commands.
- T010 can run in parallel with T008/T009 when the platform environment is available, subject to shared build/server resources.

## Parallel Example: Final Validation

```text
Task: T008 Run the focused Angular unit suite in the repository
Task: T009 Run lint and the Angular SDK component library build
Task: T010 Run portal and embedded Playwright validation when the platform environment is available
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001-T002 to establish the focused fixture.
2. Add the User Story 1 assertions in T003.
3. Implement the derived label and template binding in T004-T005.
4. Run T008 to validate custom-label and fallback behavior.

### Incremental Delivery

1. Add User Story 1 and validate the configured/fallback labels.
2. Add User Story 2 regression coverage and confirm visibility/action behavior.
3. Run lint, library build, and available portal/embedded validation.

## Notes

- `[P]` is intentionally unused for implementation tasks because the changed component and colocated spec share the same file-level slice.
- Every task includes an exact repository path and follows the required checkbox, task ID, optional parallel marker, story label, and description format.
- No contracts directory is required because this feature changes no public API or external service contract.
- T008 is blocked by pre-existing workspace-wide missing `PConnect`/`PCore` declaration errors in unrelated components before tests execute.
- T010 was not run because a reachable Pega Infinity platform test environment was not available in this session.
