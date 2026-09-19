# Feature Specification: SimpleTable Add Label Parity

**Feature Branch**: `001-simple-table-add-label`

**Created**: 2026-09-18

**Status**: Draft

**Input**: User description: "Fix Angular SimpleTableManual so the Add button displays the label customized in Pega Infinity, matching the existing React SDK behavior."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Display the configured add-record label (Priority: P1)

As a user working with an editable simple table, I want the Add button to use the label configured in Pega Infinity so that the action is clear and consistent with the application terminology.

**Why this priority**: The configured label is a user-facing platform setting. Ignoring it creates inconsistent behavior between SDK implementations and can make the add-record action ambiguous.

**Independent Test**: Configure a simple table with a target class label, open it in editable mode, and verify that the Add button displays the localized label containing that target class label.

**Acceptance Scenarios**:

1. **Given** an editable simple table with a configured target class label, **When** the table is rendered, **Then** the Add button displays the localized equivalent of `Add {targetClassLabel}`.
2. **Given** an editable simple table without a configured target class label, **When** the table is rendered, **Then** the Add button displays the localized default Add label.
3. **Given** an editable simple table whose resolved configuration changes, **When** the component updates, **Then** the Add button reflects the latest resolved label.

### User Story 2 - Preserve add action availability and behavior (Priority: P1)

As a user, I want the Add button to remain available only when adding records is allowed and to keep its existing behavior when selected.

**Why this priority**: Label parity must not change permissions, visibility, or record-creation behavior.

**Independent Test**: Render the table under editable, read-only, and add-disabled conditions, then select the visible Add button and verify that one record is added using the existing workflow.

**Acceptance Scenarios**:

1. **Given** a read-only simple table, **When** the table is rendered, **Then** the Add button is not displayed.
2. **Given** an editable simple table with adding disabled, **When** the table is rendered, **Then** the Add button is not displayed.
3. **Given** an editable simple table with adding enabled, **When** the user selects the Add button, **Then** the existing add-record operation is invoked and the record list is updated as before.

### Edge Cases

- If the configured target class label is empty, null, or unavailable after resolution, the localized default Add label is used.
- If localization does not provide a translation for the composed label, the existing localization fallback behavior is preserved.
- Label changes must not alter the button's visibility, styling, enabled state, or click action.
- The label must remain correct when the table starts with no records or already contains records.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The simple table MUST display the platform-resolved target class label in the Add button text when that label is configured.
- **FR-002**: The Add button text MUST use the localized form of `Add {targetClassLabel}` when a target class label is available.
- **FR-003**: The simple table MUST use the localized default Add label when the target class label is unavailable or empty.
- **FR-004**: The simple table MUST preserve the existing rules that hide the Add button in read-only mode or when adding records is disabled.
- **FR-005**: Selecting the Add button MUST preserve the existing record-creation behavior.
- **FR-006**: The displayed Add button label MUST update when the resolved component configuration changes.
- **FR-007**: The behavior MUST be consistent with the established reference SDK behavior for configured labels and fallback labels.
- **FR-008**: Automated tests MUST cover configured labels, fallback labels, hidden states, configuration updates, and the existing add-record interaction.

## Key Entities *(include if feature involves data)*

- **Simple table configuration**: The resolved settings for the table, including whether records may be added and the target class label used to describe new records.
- **Add-record label**: The localized user-facing text shown for the action that adds a record.
- **Record list**: The collection of records managed by the simple table and updated by the existing add-record operation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In 100% of tested editable configurations with a target class label, the Add button displays the expected localized custom label.
- **SC-002**: In 100% of tested configurations without a target class label, the Add button displays the expected localized default Add label.
- **SC-003**: In 100% of tested read-only or add-disabled configurations, the Add button remains hidden.
- **SC-004**: In 100% of tested editable configurations with adding enabled, selecting the Add button continues to create a record through the existing workflow.
- **SC-005**: Equivalent simple-table configurations produce the same configured-label and fallback-label outcomes as the established reference behavior.

## Assumptions

- Pega Infinity already supplies the target class label through the simple table's resolved configuration.
- Existing localization resources and fallback behavior are authoritative for the Add label.
- The scope is limited to the Angular SimpleTableManual component; other table variants and unrelated localization strings are out of scope.
- Existing permissions, visibility rules, styling, and record-creation APIs remain unchanged.
