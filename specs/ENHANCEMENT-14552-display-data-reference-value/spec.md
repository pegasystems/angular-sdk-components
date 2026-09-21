# Feature Specification: Display DataReference Value in Case Summary

**Feature Branch**: `001-display-data-reference-value`

**Created**: 2026-09-17

**Status**: Draft

**Input**: User description: "I want to display DataReference value in caseSummary view. Currently, the default value is showing in the Selected Product field as an ID. A similar use case is working as expected in the react-sdk-components repo, where you can refer to the CaseSummaryFields component. Ask me if you need more details related to this."

## Clarifications

### Session 2026-09-17

- Q: When a DataReference has an identifier but its human-readable display value cannot be resolved, what should the case summary display? -> A: Render the standard object-reference presentation, including whatever value or fallback it defines, and align its styling with the other case summary fields.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Show the selected reference value (Priority: P1)

When a user opens a case summary containing a DataReference field, the summary shows the human-readable value associated with the selected record, such as the selected product name, instead of the record identifier or internal default value.

**Why this priority**: This is the primary defect and directly affects whether users can understand the case summary.

**Independent Test**: Open a case with a populated DataReference field in the case summary and verify that the displayed value matches the selected record's visible value rather than its identifier.

**Acceptance Scenarios**:

1. **Given** a case summary has a populated DataReference field with a selected record, **When** the case summary is displayed, **Then** the field shows the selected record's human-readable value.
2. **Given** the selected record has both an internal identifier and a visible display value, **When** the case summary is displayed, **Then** the visible display value is shown and the internal identifier is not shown as the field value.

### User Story 2 - Preserve empty and unresolved states (Priority: P2)

When a DataReference field has no selected record or its display value cannot be resolved, the case summary delegates the value and fallback presentation to the standard object-reference display while keeping the summary intact.

**Why this priority**: Empty and incomplete reference data must remain understandable while the populated case path is corrected.

**Independent Test**: View case summaries with an empty DataReference and with a reference whose display value is unavailable, and verify that each state has a stable, user-understandable result.

**Acceptance Scenarios**:

1. **Given** a DataReference field has no value, **When** the case summary is displayed, **Then** the field uses the established empty-value presentation.
2. **Given** a DataReference field has an identifier but no available display value, **When** the case summary is displayed, **Then** the standard object-reference presentation determines the displayed value or fallback without rendering undefined content or failing the surrounding summary.

### User Story 3 - Keep other summary fields unchanged (Priority: P2)

When a case summary contains ordinary fields alongside a DataReference, users continue to see the existing labels, values, formatting, and visibility behavior for those other fields, and the DataReference uses matching summary-field styling.

**Why this priority**: The correction should improve reference fields without changing established case-summary behavior.

**Independent Test**: Open a representative case summary containing text, date, operator, and DataReference fields and compare all non-reference fields with their current expected presentation.

**Acceptance Scenarios**:

1. **Given** a case summary contains multiple field types, **When** the summary is displayed, **Then** only the DataReference presentation changes and the other fields retain their expected output.
2. **Given** a DataReference appears in a summary section that supports display-only values, **When** the summary is refreshed, **Then** its label and resolved value remain aligned with the correct field.

### Edge Cases

- A DataReference field has a null, empty, or missing value.
- A DataReference field has an internal identifier but the corresponding display value is unavailable.
- The selected record's display value is numeric or otherwise falsy but valid and must not be replaced by the empty placeholder.
- The case summary updates after the reference value changes and must show the latest value.
- A case summary contains more than one DataReference field; each field must show its own value.
- Existing non-reference field types continue to use their current display and empty-state behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The case summary MUST display the human-readable value for a populated DataReference field.
- **FR-002**: The case summary MUST NOT display an internal record identifier as the visible value when a human-readable value is available.
- **FR-003**: The case summary MUST preserve the field's configured label while displaying the resolved DataReference value.
- **FR-004**: The case summary MUST provide the established empty-value presentation when a DataReference has no selected value.
- **FR-005**: The case summary MUST use the standard object-reference presentation to determine the displayed value or fallback when a DataReference display value is unavailable, without rendering undefined content or disrupting other summary fields.
- **FR-006**: The case summary MUST update the displayed DataReference value when the underlying selected record changes.
- **FR-007**: The change MUST preserve existing behavior for non-DataReference fields, including their current labels, formatting, visibility, and empty states.
- **FR-008**: Multiple DataReference fields in the same case summary MUST be rendered independently with the correct value for each field.
- **FR-009**: The DataReference presentation MUST use styling aligned with the other fields in the case summary.

### Key Entities *(include if feature involves data)*

- **Case summary field**: A field presented in the summary of a case, including its label, type, visibility, and display value.
- **DataReference**: A case field that points to a selected record and has an internal identifier as well as a human-readable value.
- **Selected record**: The record chosen for a DataReference field, whose visible value is shown to the user.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In 100% of tested populated DataReference case summaries, the visible field value matches the selected record's human-readable value rather than its internal identifier.
- **SC-002**: In 100% of tested empty or unresolved DataReference cases, the summary shows the value or fallback defined by the standard object-reference presentation without undefined text or a rendering failure.
- **SC-003**: In a representative case summary containing at least five mixed field types, all non-DataReference fields retain their expected labels and values after the change.
- **SC-004**: Users can identify the selected record from the case summary without opening a secondary selection or details view.
- **SC-005**: Updating a selected DataReference is reflected in the case summary during the same summary refresh in all tested update scenarios.
- **SC-006**: In a representative case summary containing mixed field types, the DataReference presentation aligns visually with neighboring summary fields.

## Assumptions

- The platform already provides or can provide a human-readable value for a selected DataReference record.
- The standard object-reference presentation defines the value and fallback shown for DataReference fields, including unresolved values.
- This feature is limited to displaying DataReference values in the case summary; selection, searching, editing, persistence, and record retrieval behavior are unchanged.
- Existing permissions, visibility rules, localization, and field labels continue to apply.
- The behavior is expected to be consistent across case-summary entry points that use the shared summary field presentation.
