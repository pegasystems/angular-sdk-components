# Tasks: Create AutoComplete Records

**Input**: Design documents from `/specs/001-create-autocomplete-record/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/auto-complete-create-new.md](contracts/auto-complete-create-new.md), [quickstart.md](quickstart.md)

**Tests**: Karma/Jasmine unit tests and Playwright E2E tests are required by the project constitution and validation guide.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated as an incremental delivery.

## Phase 1: Setup

**Purpose**: Establish the test seams and source boundaries for the existing field; no new project structure or dependencies are required.

- [X] T001 Review and extend the existing AutoComplete test fixtures to mock PConnect, PCore actions, option data, and PubSub completion events in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.spec.ts`

---

## Phase 2: Foundational

**Purpose**: Add the additive typed configuration and shared lifecycle helpers required by all creation flows.

**⚠️ CRITICAL**: Complete this phase before user-story tasks.

- [X] T002 Extend the typed AutoComplete configuration with optional creation inputs, component-owned completion subscription state, reusable option refresh logic, and cleanup on destruction in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.ts`

**Checkpoint**: Existing field configuration remains additive and all creation flows have a single lifecycle foundation.

---

## Phase 3: User Story 1 - Create a missing referenced record (Priority: P1) 🎯 MVP

**Goal**: Let users invoke Create New from eligible editable Data Reference and Object Reference AutoComplete fields, then refresh and select the created record.

**Independent Test**: Configure an eligible editable AutoComplete for each supported reference type, invoke Create New, emit the matching completion event, and verify the new identifier is committed and options are refreshed.

### Tests for User Story 1

- [X] T003 [US1] Add failing unit tests for Create New visibility, configured versus fallback localized labels, Data Reference completion, Object Reference completion, and unmatched Object Reference events in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.spec.ts`

### Implementation for User Story 1

- [X] T004 [US1] Render an accessible, conditionally visible Angular Material Create New action in the existing option panel without changing the flat or grouped option selection behavior in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.html`
- [X] T005 [US1] Add scoped option-panel action styling that preserves the current AutoComplete layout and keyboard interaction affordances in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.scss`
- [X] T006 [US1] Implement the Create New handler: register the correct Data Reference or Object Reference completion listener before invoking the parent-supplied creation callback, refresh options after matching completion, select the created identifier through the shared field event path, and unsubscribe in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.ts`

**Checkpoint**: An eligible field can create and select a new referenced record without affecting unrelated field modes.

---

## Phase 4: User Story 2 - Resume the interrupted form (Priority: P2)

**Goal**: Apply existing mapped-property behavior and record-change notification when a new record is selected, while retaining unrelated form state.

**Independent Test**: Set unrelated form values and configure selected-record mappings, complete Data Reference and Object Reference creation, then verify mapped values and record-change notification match manual selection while unrelated values remain unchanged.

### Tests for User Story 2

- [X] T007 [US2] Add failing unit tests for created Data Reference mapping, Object Reference mapping after refresh, returned-identifier fallback when a refreshed option is absent, and normal `onRecordChange` emission in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.spec.ts`

### Implementation for User Story 2

- [X] T008 [US2] Extract and reuse selected-record mapped-property updates for both manual and created selections, preserving unrelated form values and emitting the normal record-change output in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.ts`

**Checkpoint**: A newly created record behaves identically to a manually selected record for configured mappings and parent notifications.

---

## Phase 5: User Story 3 - Preserve existing AutoComplete behavior (Priority: P3)

**Goal**: Keep ineligible, read-only, display-only, cancellation, failure, and repeated-creation behavior safe and unchanged.

**Independent Test**: Exercise ineligible and read-only/display-only fields, then cancel, fail, destroy, and repeat an eligible creation attempt; verify no unwanted action, state mutation, listener leak, or regression in existing interactions.

### Tests for User Story 3

- [X] T009 [US3] Add failing unit tests proving no action is rendered for ineligible/read-only/display-only configurations and that cancellation, initiation failure, destruction, and repeated creation preserve prior values and clean up completion listeners in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.spec.ts`

### Implementation for User Story 3

- [X] T010 [US3] Guard rendering and creation by eligibility and editability, preserve selections and mapped values on cancellation/failure, prevent duplicate active subscriptions, and support sequential successful creations in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.ts`

**Checkpoint**: Existing configurations remain unchanged and creation lifecycle failures cannot mutate the form or leave subscriptions behind.

---

## Phase 6: Polish and Cross-Cutting Validation

**Purpose**: Validate the complete workflow in both application modes and run repository quality gates.

- [ ] T011 [P] Add a portal E2E workflow covering successful Data/Object Reference creation, selection, mapped values, cancellation, and ineligible-field regression in `projects/angular-test-app/tests/e2e/MediaCo/portal.spec.js`
- [ ] T012 [P] Add an embedded E2E workflow covering successful Data/Object Reference creation, selection, mapped values, cancellation, and ineligible-field regression in `projects/angular-test-app/tests/e2e/MediaCo/embedded.spec.js`
- [ ] T013 Run focused AutoComplete unit tests and fix feature regressions in `packages/angular-sdk-components/src/lib/_components/field/auto-complete/auto-complete.component.spec.ts`
- [ ] T014 Run lint and SDK compilation, then resolve only feature-related failures using `package.json`
- [ ] T015 Run the portal and embedded Playwright validation scenarios from `specs/001-create-autocomplete-record/quickstart.md`

---

## Dependencies and Execution Order

### Phase Dependencies

- **Phase 1**: Starts immediately.
- **Phase 2**: Depends on T001 and blocks all user stories.
- **Phase 3 (US1)**: Depends on T002 and delivers the MVP.
- **Phase 4 (US2)**: Depends on the selected-record lifecycle from T006.
- **Phase 5 (US3)**: Depends on the lifecycle from T006 and can follow US1; it validates compatibility independently of mapping enhancements.
- **Phase 6**: Depends on completion of all selected user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after foundational work; no dependency on later stories.
- **US2 (P2)**: Builds on US1's successful creation lifecycle to apply equivalent mapping and notification behavior.
- **US3 (P3)**: Builds on US1's creation lifecycle to ensure eligibility gates, failure safety, and compatibility.

### Parallel Opportunities

- T004 and T005 can proceed in parallel after T002 because they modify separate template and stylesheet files.
- T011 and T012 can proceed in parallel after unit behavior is stable because portal and embedded tests are separate files.

## Parallel Example: User Story 1

```text
After T002:
- T004 Render the conditional Create New action in auto-complete.component.html
- T005 Add scoped action styling in auto-complete.component.scss
```

## Implementation Strategy

### MVP First

1. Complete T001-T002 to establish test seams and lifecycle foundations.
2. Complete T003-T006 for User Story 1.
3. Run the User Story 1 unit tests and demonstrate a newly created Data Reference and Object Reference record being selected.

### Incremental Delivery

1. Deliver US1 creation, refresh, and selection.
2. Add US2 mapping and parent-notification parity.
3. Add US3 compatibility, failure safety, and repeated-creation coverage.
4. Validate both portal and embedded workflows, then lint and compile.

## Notes

- All 15 tasks use the required checkbox, task ID, optional parallel marker, user-story label where applicable, and exact file path format.
- No bridge, registry, backend, or generated build-output files are in scope.
