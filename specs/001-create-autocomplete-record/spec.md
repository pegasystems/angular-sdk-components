# Feature Specification: Create AutoComplete Records

**Feature Branch**: `001-create-autocomplete-record`

**Created**: 2026-09-22

**Status**: Draft

**Input**: User description: "Implement a Create New capability for eligible AutoComplete fields backed by Data Reference or Object Reference records."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a missing referenced record (Priority: P1)

As a user completing a form, I want to create a record directly from an eligible AutoComplete field when the record I need is unavailable, so I can continue the current task without leaving the form.

**Why this priority**: This is the core value of the feature: it removes the interruption of navigating elsewhere to create a required referenced record.

**Independent Test**: Open an eligible Data Reference and Object Reference AutoComplete field, invoke Create New, complete creation, and verify the new record becomes the selected field value.

**Acceptance Scenarios**:

1. **Given** an editable Data Reference AutoComplete field configured to allow record creation, **When** the user opens its option list, **Then** a Create New action is available in addition to the existing selectable options.
2. **Given** an editable Object Reference AutoComplete field configured to allow record creation, **When** the user invokes Create New and completes the creation flow, **Then** the new object is selected in the originating AutoComplete field.
3. **Given** an eligible AutoComplete field, **When** the user completes creation of a new Data Reference record, **Then** the field's option list includes the new record and the record is selected.

---

### User Story 2 - Resume the interrupted form (Priority: P2)

As a user, I want the originating form to retain my work while I create a referenced record and then return me to the field with that record selected, so I can complete the form efficiently and accurately.

**Why this priority**: The creation action only removes friction when it returns the user to the interrupted task with the expected value and related data in place.

**Independent Test**: Enter values in other form fields, create a referenced record from AutoComplete, return to the form, and verify existing entries remain unchanged while the new record and its configured related values are applied.

**Acceptance Scenarios**:

1. **Given** a user has entered values elsewhere in the form, **When** they create a record from an AutoComplete field and return, **Then** their unrelated form entries are retained.
2. **Given** the AutoComplete configuration maps fields from a selected record to related form values, **When** a new record is created and selected, **Then** those mapped values are populated using the new record just as they are for a pre-existing selection.
3. **Given** a consumer listens for a record-selection change, **When** creation selects the new record, **Then** it receives the same selection notification it would receive for a manually chosen existing record.

---

### User Story 3 - Preserve existing AutoComplete behavior (Priority: P3)

As a form author using existing AutoComplete fields, I want fields that do not allow record creation, are read-only, or use unsupported reference types to behave exactly as before, so existing forms require no changes.

**Why this priority**: Compatibility protects current consumers while confining the new behavior to explicitly eligible configurations.

**Independent Test**: Exercise existing editable and read-only AutoComplete fields that do not allow record creation, including filtering, keyboard navigation, clearing, and option selection, and verify no Create New action or behavioral change appears.

**Acceptance Scenarios**:

1. **Given** an AutoComplete field that is not configured to allow record creation, **When** the user opens the option list, **Then** no Create New action is displayed and all existing interactions are unchanged.
2. **Given** a read-only or display-only AutoComplete field, **When** its value is shown, **Then** no Create New action is available.
3. **Given** an eligible AutoComplete field, **When** the user cancels creation, **Then** the originating field value and all other form values remain unchanged.

### Edge Cases

- What happens when creation finishes but the new record is not immediately returned in the refreshed option list? The field still selects the newly created record by its identifier, and the list refreshes again when updated data becomes available.
- What happens when the creation flow fails or is unavailable? The field retains its prior value, informs the user through the standard error experience, and keeps Create New available for a retry when permitted.
- What happens when the field has no current selection? Creation may proceed; after success the new record becomes the first selected value.
- What happens when a field has a configured Create New label that is empty or unavailable? The field uses the standard localized Create New label.
- What happens when an option list is filtered by typed text before creation starts? The created record is refreshed into the complete option data; the active filter continues to govern which options are visible.
- What happens when the user creates multiple records sequentially from the same field? Each successful creation refreshes the option list and replaces the field selection with the most recently created record.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a Create New action within an editable AutoComplete option list when the field is configured to allow record creation and represents either a Data Reference or an Object Reference.
- **FR-002**: The system MUST NOT show the Create New action for AutoComplete fields that are read-only, display-only, not configured to allow record creation, or not backed by a supported reference type.
- **FR-003**: Invoking Create New MUST start the configured creation experience for the AutoComplete field's referenced record type without discarding the user's current form state.
- **FR-004**: The Create New action MUST display a configured, localized label when one is available and otherwise use the standard localized Create New label.
- **FR-005**: After successful creation, the system MUST refresh the originating AutoComplete field's available records.
- **FR-006**: After successful creation, the system MUST select the new record in the originating AutoComplete field using the record's returned identifier, including when the record is not yet present in the first refreshed option list.
- **FR-007**: When selecting the new record, the system MUST apply all configured mappings from the selected record to related form fields using the same behavior as an existing option selection.
- **FR-008**: When selecting the new record, the system MUST emit the same record-selection notification supplied for a manual selection of an existing option.
- **FR-009**: If creation is cancelled, fails, or cannot be started, the system MUST retain the originating field's previous selection and MUST NOT update mapped related fields; when creation can be retried, the Create New action MUST remain available.
- **FR-010**: The system MUST preserve current filtering, clearing, keyboard navigation, option selection, accessibility, and display behavior for every existing AutoComplete configuration that does not meet the eligibility conditions in FR-001.
- **FR-011**: The Create New action MUST be reachable using the same supported input methods as other AutoComplete list actions and MUST expose an accessible name matching its displayed label.
- **FR-012**: The feature MUST support creating and selecting more than one new record during the same form session; each completed creation MUST refresh options and select that creation's record.

### Key Entities

- **AutoComplete field**: A form field that presents a filtered list of existing records and stores the identifier of the selected record. It may be configured to permit creation for a supported reference type.
- **Referenced record**: A Data Reference or Object Reference record that can appear in the AutoComplete field's option list, be selected by its identifier, and provide values for configured related fields.
- **Create New action**: A labeled, accessible option-list action that starts creation of a referenced record from the originating AutoComplete field.
- **Record mapping**: A configured relationship that copies values from a selected referenced record to related fields in the current form.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In 100% of tested eligible Data Reference and Object Reference configurations, users can start creation from the AutoComplete field and select the newly created record without leaving or reloading the originating form.
- **SC-002**: In 100% of successful creation test cases, the new record is present in the field's refreshed choices or is selected by its returned identifier within one completed creation flow.
- **SC-003**: In 100% of test cases with configured record mappings, selecting a newly created record updates the same related fields and emits the same selection notification as selecting an existing record.
- **SC-004**: In 100% of cancellation and failure test cases, the original AutoComplete selection and unrelated form values remain unchanged.
- **SC-005**: In 100% of regression test cases for ineligible or existing AutoComplete configurations, no Create New action is shown and current filtering, selection, keyboard, display, and accessibility behavior remains unchanged.

## Assumptions

- Creation eligibility is supplied by the existing field configuration; no new permission model is introduced by this feature.
- Data Reference and Object Reference identify the two supported reference types; other field types and associated/local option lists are outside this feature's scope unless they are already represented as one of those reference types.
- The configured creation experience supplies a completion result that identifies the newly created record, either directly or through refreshed field data.
- The current form and any values already entered by the user remain available while the creation experience is active.
- The standard application error and localization behavior is reused for labels and creation failures.
- Existing AutoComplete behavior, including display-only presentation and current option-list features, remains unchanged unless the field is explicitly eligible for creation.
