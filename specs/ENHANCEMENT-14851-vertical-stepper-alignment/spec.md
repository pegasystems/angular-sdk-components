# Feature Specification: Vertical Stepper Alignment

**Feature Branch**: `mod/dec/ENHANCEMENT-14851`

**Created**: 2026-09-21

**Status**: Draft

**Input**: User description: "Implement support for vertical navigation stepper alignment in angular-sdk-components."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Use a right-aligned vertical stepper (Priority: P1)

As a case worker using an assignment configured for vertical navigation, I want the stepper displayed on the right so that the assignment follows the configured navigation layout.

**Why this priority**: Correctly placing the navigation is the primary outcome of the feature and keeps assignment navigation consistent with the established reference behavior.

**Independent Test**: Open a multi-step assignment configured for vertical navigation and verify that the stepper is vertical and appears to the right of the assignment content.

**Acceptance Scenarios**:

1. **Given** a multi-step assignment configured for vertical navigation, **When** the assignment is displayed, **Then** the navigation stepper is vertical and appears on the right of the assignment content.
2. **Given** a vertical navigation assignment with a current step and completed steps, **When** it is displayed, **Then** the current and completed step indicators remain accurate.

### User Story 2 - Use a left-aligned vertical stepper (Priority: P1)

As a case worker using an assignment configured for left vertical navigation, I want the stepper displayed on the left so that the configured layout is honored.

**Why this priority**: Left alignment is a distinct supported navigation configuration and must not be interpreted as the default vertical alignment.

**Independent Test**: Open a multi-step assignment configured for left vertical navigation and verify that the stepper is vertical and appears to the left of the assignment content.

**Acceptance Scenarios**:

1. **Given** a multi-step assignment configured for left vertical navigation, **When** the assignment is displayed, **Then** the navigation stepper is vertical and appears on the left of the assignment content.
2. **Given** the navigation template uses different letter casing, **When** the assignment is displayed, **Then** the same left-aligned vertical layout is used.

### User Story 3 - Preserve existing navigation behavior (Priority: P1)

As a case worker, I want existing horizontal, standard, and single-step assignment navigation behavior to remain unchanged so that adding vertical alignment does not alter established assignment flows.

**Why this priority**: Assignment navigation is a core workflow; regression prevention is as important as the new layouts.

**Independent Test**: Display assignments configured for horizontal, standard, and single-step navigation and verify that each retains its current navigation visibility and placement.

**Acceptance Scenarios**:

1. **Given** a multi-step assignment configured for horizontal navigation, **When** it is displayed, **Then** the existing horizontal stepper layout is retained.
2. **Given** an assignment configured for standard navigation, **When** it is displayed, **Then** the navigation stepper remains hidden.
3. **Given** an assignment with one navigation step, **When** it is displayed, **Then** the navigation stepper remains hidden regardless of its configured template.

### Edge Cases

- If no navigation configuration is available, the assignment retains its existing non-stepper presentation.
- Unrecognized navigation template values retain the existing horizontal navigation behavior when multiple steps are available.
- Empty or unavailable step lists do not display a vertical stepper.
- Existing assignment actions and validation messages remain usable in both vertical alignments.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a multi-step assignment's navigation vertically on the right when its navigation template is configured as `vertical`, regardless of letter casing.
- **FR-002**: The system MUST display a multi-step assignment's navigation vertically on the left when its navigation template is configured as `vertical-left`, regardless of letter casing.
- **FR-003**: The system MUST preserve the existing horizontal navigation layout for horizontal and unrecognized navigation templates.
- **FR-004**: The system MUST preserve the existing behavior that hides navigation for standard templates.
- **FR-005**: The system MUST hide navigation when an assignment has exactly one navigation step, regardless of navigation template.
- **FR-006**: The system MUST preserve the current, completed, and available statuses of navigation steps in every supported layout.
- **FR-007**: The system MUST preserve existing assignment content, actions, validation messages, and navigation interactions in every supported layout.
- **FR-008**: Automated verification MUST cover right vertical, left vertical, horizontal, standard, and single-step navigation configurations.

## Key Entities *(include if feature involves data)*

- **Navigation template**: The assignment configuration that selects the presentation and alignment of navigation steps.
- **Navigation step**: A configured assignment stage with a name and status that may be current, completed, or available.
- **Assignment content**: The user-facing work area shown alongside navigation when navigation is visible.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In 100% of tested multi-step assignments configured for `vertical`, the stepper is visible, vertical, and placed to the right of assignment content.
- **SC-002**: In 100% of tested multi-step assignments configured for `vertical-left`, the stepper is visible, vertical, and placed to the left of assignment content.
- **SC-003**: In 100% of tested horizontal, standard, and single-step configurations, navigation visibility and layout match the behavior before this feature.
- **SC-004**: In 100% of tested supported layouts, users can complete existing assignment actions and navigate between available steps without layout-related failure.
- **SC-005**: All defined navigation-template scenarios have automated verification coverage.

## Assumptions

- The assignment configuration already provides a navigation template and its step list.
- The existing right and left vertical layout conventions are the authoritative reference for expected placement.
- This feature is limited to assignment navigation presentation; it does not change step availability, navigation permissions, or assignment lifecycle behavior.
- Existing responsive behavior continues to govern how the assignment is displayed on smaller screens.
