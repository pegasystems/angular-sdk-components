# Feature Specification: AutoComplete Secondary Text

**Feature Branch**: `001-autocomplete-secondary-text`

**Created**: 2026-09-17

**Status**: Draft

**Input**: User description: "Add secondary text support to the AutoComplete component. Users should be able to view additional contextual information for each option through a secondary text field. Requirements: Each option may contain primary text and optional secondary text. Secondary text should be displayed below the primary text. Secondary text must wrap within the available option width and should never cause horizontal overflow in the options dialog. Options without secondary text should continue to render correctly. Users should be able to search and filter options using either the primary text or the secondary text. Existing AutoComplete functionality must remain backward compatible."

## Clarifications

### Session 2026-09-17

- Q: When an option's data source defines more than one non-primary display column, how should they combine into one secondary text line? → A: Join all secondary columns into one line separated by a middle dot (·); each secondary value may need its own type-specific formatting (e.g., date, currency) rather than being treated as a plain string.
- Q: Should secondary text support extend to associated/local list options, or is it limited to datapage-sourced options for now? → A: Limited to datapage-sourced options only; associated/local list options keep today's key/value-only shape.
- Q: Should secondary text wrap without a line limit, or be capped (e.g. 2 lines with truncation)? → A: No cap — wrap fully, option height grows as needed.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View contextual detail for an option (Priority: P1)

As a user typing into an AutoComplete field, when I open the option list, I want to see a short secondary line of extra context under each option's main text so I can tell apart options that look similar or need more explanation before choosing one.

**Why this priority**: This is the core value of the feature — without visible secondary text, there is nothing else for users to search or rely on. It delivers value on its own even if search-by-secondary-text (Story 2) is not yet available, since users can still visually scan for the right option.

**Independent Test**: Configure an AutoComplete field whose options include both primary and secondary text, open the option list, and verify each option shows the primary text with the secondary text beneath it, wrapping instead of overflowing.

**Acceptance Scenarios**:

1. **Given** an AutoComplete option list where options include secondary text, **When** the user opens the dropdown, **Then** each option displays its secondary text on a line below the primary text.
2. **Given** an option with a very long secondary text value, **When** the option list is rendered, **Then** the secondary text wraps onto multiple lines within the option and the dropdown does not scroll horizontally.
3. **Given** an option that has no secondary text configured, **When** the option list is rendered, **Then** the option displays only the primary text and looks unchanged from current behavior.

---

### User Story 2 - Search by secondary text (Priority: P2)

As a user, I want to find an option by typing a term that only appears in its secondary (contextual) text, not just its primary text, so I can locate the right option even when I don't remember its exact primary label.

**Why this priority**: This extends the value of Story 1 by making the newly visible information actionable, but it depends on secondary text already being present and displayed.

**Independent Test**: With secondary text visible, type a search term that matches only a secondary text value (not any primary text) and verify the matching option(s) appear in the filtered list.

**Acceptance Scenarios**:

1. **Given** an option whose secondary text contains a term, **When** the user types that term into the AutoComplete input, **Then** the option appears in the filtered results.
2. **Given** an option whose primary text contains a term, **When** the user types that term, **Then** the option still appears in the filtered results (existing primary-text search behavior is preserved).
3. **Given** a search term that matches neither primary nor secondary text of an option, **When** the user types that term, **Then** the option is excluded from the filtered results.

---

### User Story 3 - Existing AutoComplete configurations keep working (Priority: P3)

As a developer/consumer who already uses AutoComplete fields without any secondary text configuration, I want my existing forms to keep behaving exactly as before after this feature ships, so I don't need to change anything to avoid regressions.

**Why this priority**: This is a compatibility safeguard rather than new user-facing value, so it is prioritized after the two stories that deliver new capability, but it must hold true before release.

**Independent Test**: Load an existing AutoComplete field configuration that has no secondary text field defined, exercise typing, filtering, and selection, and verify behavior and appearance match the pre-feature experience.

**Acceptance Scenarios**:

1. **Given** an existing AutoComplete configuration with only primary text data, **When** the user opens and filters the option list, **Then** all interactions (display, search, selection) behave exactly as before this feature was added.
2. **Given** an existing AutoComplete configuration, **When** the feature is deployed, **Then** no code or configuration changes are required by the consumer for the field to keep working.

---

### Edge Cases

- What happens when an option has secondary text but the value is an empty string or whitespace only? (The field still renders using its own empty-value placeholder, e.g. "Product Name: ---", rather than being omitted.)
- What happens when secondary text is extremely long (e.g., a full sentence or paragraph)? (Must wrap across as many lines as needed, growing the option's height, without causing horizontal scroll.)
- What happens when an option has more than one secondary display value configured? (All values are joined into a single line separated by a middle dot (·); any value that is empty/whitespace-only is excluded from the joined line.)
- What happens when a secondary display value is a typed value rather than plain text (e.g., a date or currency amount)? (It must be formatted for display according to its own type before being joined into the secondary text line.)
- What happens when two different options share identical primary text but have different secondary text? (Both must remain distinguishable and independently searchable by their secondary text.)
- What happens when a user's search term matches both the primary text of one option and the secondary text of another? (Both options must appear in the filtered results.)
- What happens when secondary text contains special characters (e.g., punctuation, non-Latin characters)? (Must render and be searchable the same as any other text.)
- What happens when the option's list type is associated/local list rather than datapage-sourced? (Secondary text is out of scope for associated/local list options in this feature; they continue to show only their existing key/value pair.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow each AutoComplete option to optionally carry one or more secondary display values, sourced from the option's configured non-primary display columns, in addition to its primary text.
- **FR-002**: System MUST join all of an option's secondary display values into a single line, separated by a middle dot (·) between each value.
- **FR-003**: System MUST format each secondary display value according to its own configured display type (e.g., plain text, date, currency), consistent with existing column-based value formatting already used elsewhere in the SDK.
- **FR-004**: System MUST display an option's joined secondary text line beneath its primary text whenever at least one secondary display value is configured for that option.
- **FR-005**: System MUST wrap the secondary text line within the available width of the option, with no maximum line cap; the option's height MUST grow as needed and MUST NOT introduce horizontal scrolling in the option list.
- **FR-006**: System MUST render options that have no secondary display values using only the primary text, with no visual regression compared to current behavior.
- **FR-007**: Users MUST be able to filter the option list by typing a search term that matches an option's primary text.
- **FR-008**: Users MUST be able to filter the option list by typing a search term that matches any part of an option's secondary text.
- **FR-009**: System MUST continue to support existing AutoComplete configurations that do not define secondary display columns, without requiring any consumer-side changes.
- **FR-010**: System MUST preserve existing keyboard navigation and accessibility behavior (e.g., focus movement, selection announcement) of the option list when secondary text is present.
- **FR-011**: System MUST render a configured secondary display value even when it is empty or whitespace-only, showing that field's own standard empty-value placeholder (consistent with how other read-only fields in the SDK already display missing values) rather than omitting the field from the joined secondary text line.
- **FR-012**: System MUST NOT extend secondary text support to associated/local list options (list type "associated") in this feature; those options continue to be built using only a key and a single display value.

### Key Entities

- **Option**: A selectable entry in the AutoComplete list. Attributes: a key/identifier used for selection, primary text (main label always shown), and zero or more secondary display values — each individually typed/formatted (e.g., text, date, currency) — joined with a middle dot (·) separator into a single secondary text line shown beneath the primary text and included in search matching. Only options sourced from a datapage/prompt-list configuration carry secondary values in this feature; associated/local list options remain key/value only.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of options configured with secondary text display that text beneath the primary text in the option list.
- **SC-002**: No dropdown option produces horizontal scrolling at any secondary text length, verified across the range of realistic content lengths (short phrase up to a full sentence).
- **SC-003**: Users can locate an option by typing a term found only in its secondary text, with the option appearing in filtered results in 100% of test cases.
- **SC-004**: 100% of existing AutoComplete field configurations without secondary text continue to display, filter, and select options with no observable change in behavior after the feature ships.

## Assumptions

- Secondary text is sourced from the same option/column configuration mechanism already used to define an option's primary display text (e.g., datapage/prompt-list column configuration), extended to treat non-primary display columns as secondary values rather than as a wholly new data source.
- Secondary display values are not necessarily plain strings — a value may need type-specific formatting (e.g., date, currency) before being joined into the secondary text line, consistent with how other formatted columns are already handled elsewhere in the SDK.
- Multiple secondary display values are joined into exactly one secondary text line per option (separated by a middle dot ·); multiple separate secondary lines are out of scope for this feature.
- Secondary text support applies to datapage/prompt-list-sourced options only; associated/local list options are out of scope for this feature and keep their existing key/value-only shape.
- Search matching for secondary text is case-insensitive and substring-based, consistent with existing primary text search behavior.
- Accessibility behavior (screen reader announcement, keyboard navigation) already implemented for the option list extends naturally to include the secondary text without requiring a redesigned interaction model.
- An empty/whitespace-only secondary value is still searchable text-wise only via its non-empty peers; the empty-value placeholder itself (e.g. "---") is not a meaningful search term and is excluded from `secondarySearchText`.
