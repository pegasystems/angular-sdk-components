# Tasks: DataReference Details Rendering

**Input**: Design documents in `specs/001-datareference-details/`

**Status**: Implementation completed; focused automated coverage remains.

## Phase 1: Setup

- [x] T001 Create the feature specification and quality checklist in `specs/001-datareference-details/`
- [x] T002 Record design decisions, data model, contract, and validation guide in `specs/001-datareference-details/`

## Phase 2: Foundational Context Resolution

- [x] T003 Resolve DataReference metadata from the selected context page when display text no longer identifies the relationship in `packages/angular-sdk-components/src/lib/_helpers/semanticLink-utils.ts`
- [x] T004 Preserve ObjectReference relationship context through the readonly rendering path in `packages/angular-sdk-components/src/lib/_components/field/object-reference/object-reference.component.ts`
- [x] T005 Preserve and consume readonly reference context inputs in `packages/angular-sdk-components/src/lib/_components/template/single-reference-readonly/single-reference-readonly.component.ts`

## Phase 3: User Story 1 - View a Referenced Value in Details (Priority: P1)

**Goal**: Render populated and empty DataReference values in the Details grid without extra spacing.

**Independent Test**: Open Details with populated and empty DataReference fields and compare their value-column layout with standard fields.

- [x] T006 [US1] Delegate ObjectReference field rendering from the Details template in `packages/angular-sdk-components/src/lib/_components/designSystemExtension/material-details-fields/material-details-fields.component.html`
- [x] T007 [US1] Scope readonly reference spacing to Details rendering in `packages/angular-sdk-components/src/lib/_components/template/single-reference-readonly/single-reference-readonly.component.html`
- [x] T008 [US1] Add Details-only empty-value spacing override in `packages/angular-sdk-components/src/lib/_components/template/single-reference-readonly/single-reference-readonly.component.scss`

## Phase 4: User Story 2 - Open Referenced Details (Priority: P1)

**Goal**: Open the referenced record details when the selected DataReference value is clicked.

**Independent Test**: Select a populated DataReference value and verify the referenced details view opens without a missing data-context error.

- [x] T009 [US2] Normalize missing relationship context before metadata resolution in `packages/angular-sdk-components/src/lib/_components/field/semantic-link/semantic-link.component.ts`
- [x] T010 [US2] Guard referenced-details navigation against unresolved data contexts in `packages/angular-sdk-components/src/lib/_components/field/semantic-link/semantic-link.component.ts`

## Phase 5: Validation and Follow-up

- [x] T011 Run the development build with `npm run build:dev`
- [ ] T012 [P] Add focused unit coverage for populated and empty DataReference Details rendering in `packages/angular-sdk-components/src/lib/_components/designSystemExtension/material-details-fields/material-details-fields.component.spec.ts`
- [ ] T013 [P] Add focused interaction coverage for referenced-details navigation in `packages/angular-sdk-components/src/lib/_components/field/semantic-link/semantic-link.component.spec.ts`
- [ ] T014 Validate populated and empty DataReference fields in portal and embedded scenarios using `projects/angular-test-app/tests/`

## Dependencies and Execution Order

- T001-T002 establish the feature record.
- T003-T005 establish the context required by both user stories.
- T006-T008 deliver Details rendering.
- T009-T010 deliver referenced-details navigation.
- T011 validates the completed code; T012-T014 close the remaining test coverage gap.

## Implementation Strategy

The completed implementation delivered context resolution before navigation and then scoped presentation changes to Details mode. The remaining work is focused automated and end-to-end validation.
