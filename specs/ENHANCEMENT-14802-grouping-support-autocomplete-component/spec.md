# Feature Specification: AutoComplete Option Grouping

**Feature Branch**: `ENHANCEMENT-14802-grouping-support-autocomplete-component`

**Created**: 2026-09-21

**Status**: Draft

**Input**: User description: "Add grouping support to the AutoComplete component. Users should be able to view options grouped by a configured field when group-by configuration is provided. Requirements: Grouping should be optional. Existing AutoComplete behavior should remain unchanged when no group-by field is configured. When a group-by field is configured, options should be grouped by the value of that field. A group header should be displayed for each distinct group value. Options should appear under their corresponding group header. Options should be sorted by group value to ensure all items belonging to the same group are displayed together. Group headers should not be selectable. Search and filtering should continue to work when grouping is enabled. Grouping should work with existing primary and secondary text functionality."

## Clarifications

### Session 2026-09-21

- Q: How should options whose group-by field value is null or empty (blank) be grouped and labeled? → A: Group them together under a single header with no visible label (blank header); this group's position follows normal ascending sort order alongside every other group value.
- Q: Should grouping apply to all AutoComplete list types, or only datapage-sourced options? → A: Datapage-sourced options only, matching the existing restriction already used for secondary text; associated/local list options remain out of scope for this feature.
- Q: Must the group-by field also be one of the option's displayed primary/secondary columns, or can it be a separate field used only for grouping? → A: Independent designation — a field may be marked as the group-by field on its own, whether or not it is also shown as primary or secondary text.
- Q: When a user's search term matches a group's value but not any individual option's own text, should that group's options be shown anyway? → A: No — the group value itself is not searchable text; a group's options are shown only when the term matches an option's own primary or secondary text, exactly as search already works today.
- Q: For the group formed by null/empty group values (no visible header text), should it still expose an accessible name to screen readers? → A: No — it remains fully blank for assistive technology as well as visually; no accessible name is announced for that header.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Scan a large option list organized by category (Priority: P1)

As a user typing into an AutoComplete field whose options naturally fall into categories (e.g., region, status, type), when I open the option list, I want options visually organized under a header for each category so I can quickly find the option I'm looking for instead of scanning one long flat list.

**Why this priority**: This is the core value of the feature — without grouped display, there is nothing else to search within or navigate. It delivers standalone value even before considering search interaction (Story 2).

**Independent Test**: Configure an AutoComplete field with a group-by field set, open the dropdown, and verify options are displayed under headers matching each distinct group value, with all options sharing a group value appearing together.

**Acceptance Scenarios**:

1. **Given** an AutoComplete field configured with a group-by field, **When** the user opens the dropdown, **Then** a non-selectable header is displayed for each distinct group value found among the options.
2. **Given** options whose group values are not contiguous in the underlying data, **When** the option list is rendered, **Then** all options sharing the same group value are sorted and displayed together under one header.
3. **Given** an AutoComplete field with no group-by field configured, **When** the user opens the dropdown, **Then** the option list renders as a flat list with no headers, identical to current behavior.

---

### User Story 2 - Search within a grouped option list (Priority: P2)

As a user, I want to type a search term into a grouped AutoComplete field and still see matching options organized under their group headers, so grouping doesn't get in the way of quickly finding an option by typing.

**Why this priority**: This extends Story 1 by ensuring the existing, essential search/filter capability keeps working once grouping is layered on top; it depends on grouped display already being in place.

**Independent Test**: With grouping configured, type a search term that matches options in more than one group and verify the filtered results remain organized under their respective group headers, with non-matching groups and options omitted.

**Acceptance Scenarios**:

1. **Given** a grouped option list, **When** the user types a search term that matches options in two different groups, **Then** both group headers are shown, each with only its matching option(s) beneath it.
2. **Given** a grouped option list, **When** the user types a search term that matches no options in a particular group, **Then** that group's header is not shown.
3. **Given** a grouped option list where options include secondary text, **When** the user searches by a term found only in secondary text, **Then** the matching option still appears under its correct group header (existing primary/secondary search behavior is preserved).

---

### User Story 3 - Existing AutoComplete configurations keep working (Priority: P3)

As a developer/consumer who already uses AutoComplete fields without any group-by configuration, I want my existing forms to keep behaving exactly as before after this feature ships, so I don't need to change anything to avoid regressions.

**Why this priority**: This is a compatibility safeguard rather than new user-facing value, so it is prioritized after the two stories that deliver new capability, but it must hold true before release.

**Independent Test**: Load an existing AutoComplete field configuration that has no group-by field defined, exercise typing, filtering, keyboard navigation, and selection, and verify behavior and appearance match the pre-feature experience exactly.

**Acceptance Scenarios**:

1. **Given** an existing AutoComplete configuration with no group-by field, **When** the user opens, filters, navigates by keyboard, and selects an option, **Then** all interactions behave exactly as before this feature was added.
2. **Given** an existing AutoComplete configuration, **When** the feature is deployed, **Then** no code or configuration changes are required by the consumer for the field to keep working.

---

### Edge Cases

- What happens when a group-by field is configured but every option resolves to the same group value? (A single group header is shown, with every option displayed beneath it.)
- What happens when an option's group-by value is null or an empty string? (Those options are grouped together under one header with no visible label and no accessible name; that group's position in the sort order is determined the same way as any other group value — i.e., it is not forced to a fixed position.)
- What happens when two group values differ only in letter case (e.g., "Sales" vs. "sales")? (They are treated as distinct group values and produce two separate headers, since grouping compares the field's exact value.)
- What happens when a group-by field is configured for an associated/local list AutoComplete? (Grouping is out of scope for associated/local list options in this feature; those options continue to render as an ungrouped flat list.)
- What happens when the number of distinct group values is large (e.g., dozens)? (All group headers are rendered; no artificial cap or pagination is introduced by this feature.)
- What happens when a search term matches options across many groups simultaneously? (Every matching group is shown, each containing only its own matching option(s).)
- What happens to the relative order of options that share the same group value? (Their original relative order is preserved within the group; only the group-level ordering is changed by sorting.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow an AutoComplete field's configuration to optionally designate one field as the group-by field for its options, independently of which field(s), if any, are designated as primary or secondary display text — a field MAY serve as the group-by field whether or not it is also displayed.
- **FR-002**: When no group-by field is configured, System MUST render the option list exactly as it does today, with no group headers and no change in behavior, appearance, search, or selection.
- **FR-003**: When a group-by field is configured, System MUST determine each datapage-sourced option's group value from that field and MUST display one non-selectable group header for each distinct group value present among the current options.
- **FR-004**: System MUST display each option beneath the group header matching its group value.
- **FR-005**: System MUST sort options by group value (ascending, using the exact case-sensitive string value, consistent with FR-012) before rendering, so that every option belonging to the same group is displayed contiguously; the relative order of options within the same group MUST be preserved from their original order.
- **FR-006**: Group headers MUST NOT be selectable, focusable as a selection target, or returned as a chosen value; only individual options remain selectable.
- **FR-007**: Search/filtering MUST continue to operate on options' existing searchable text (primary text and, when present, secondary text) while grouping is enabled; a group's value itself MUST NOT be treated as separate searchable text, so a term matching only a group's value (and no option's own primary/secondary text) does not cause that group's options to display. Only groups that contain at least one matching option after filtering MUST be shown, and headers for groups with no matches MUST be omitted.
- **FR-008**: Grouping MUST be compatible with options that display secondary text, showing each option's primary and secondary text beneath the correct group header unchanged.
- **FR-009**: System MUST continue to support existing AutoComplete configurations that do not define a group-by field, without requiring any consumer-side changes.
- **FR-010**: System MUST preserve existing keyboard navigation and accessibility behavior of the option list (e.g., arrow-key movement between selectable options, selection announcement) when grouping is enabled, such that keyboard navigation moves only between options and skips over group headers.
- **FR-011**: System MUST group all options whose group-by value is null, undefined, or an empty/whitespace-only string together under a single header with no visible label and no accessible name (the header is blank for both sighted and assistive-technology users), and MUST sort that group's position using the same ascending rule applied to every other group value (no special-cased placement).
- **FR-012**: System MUST treat group values as distinct based on their exact string value (case-sensitive), so values differing only in letter case produce separate group headers.
- **FR-013**: System MUST NOT extend grouping support to associated/local list options (list type "associated") in this feature; those options continue to render as an ungrouped flat list regardless of any group-by configuration.

### Key Entities

- **Option**: A selectable entry in the AutoComplete list. Gains an optional group value, derived from the configured group-by field, used only to determine which group header the option is displayed under and how options are sorted; the group value does not change how an option is selected or what value is committed on selection. Only options sourced from a datapage/prompt-list configuration carry a group value in this feature; associated/local list options are unaffected.
- **Group**: A collection of options that share an identical group value, presented as a single non-selectable header followed by its member options. Groups are ordered by their exact, case-sensitive group value (ascending); the group formed by null/empty/whitespace-only values has no visible header label and no accessible name, but otherwise participates in ordering and filtering like any other group.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of AutoComplete fields configured with a group-by field display one header per distinct group value, with every option appearing under its correct header.
- **SC-002**: 100% of options sharing the same group value are displayed contiguously (no interleaving with another group), verified across data sets where group values are not pre-sorted.
- **SC-003**: 100% of existing AutoComplete field configurations without a group-by field continue to display, filter, and select options with no observable change in behavior after the feature ships.
- **SC-004**: Users can locate and select an option in a grouped list by typing a search term, with the correct option remaining reachable and selectable in the same number of interactions (typing plus one selection) as in an ungrouped list, in 100% of test cases.
- **SC-005**: 0 instances across testing of a group header being selectable, focusable as a chosen value, or returned as a field value.

## Assumptions

- A group-by field is designated using the same option/column configuration mechanism already used to define an option's primary and secondary display columns (e.g., datapage/prompt-list column configuration), consistent with how the existing "primary" and "secondary" column designations already work, but as its own independent designation — the group-by field does not need to also be marked primary or secondary.
- Grouping support applies to datapage/prompt-list-sourced options only; associated/local list options are out of scope for this feature and continue to render as an ungrouped flat list, consistent with the same restriction already applied to secondary text.
- Group value comparison and sorting are both case-sensitive (e.g. "Sales" and "sales" are distinct groups and are ordered separately, by their exact string value); this mirrors typical grouping behavior where visually similar values are still kept as separate, explicit groups unless the underlying data normalizes them.
- Null, undefined, and empty/whitespace-only group values are treated as a single shared group with no visible header label, and this group is not pinned to a fixed first/last position — it sorts naturally alongside other group values.
- Options within a group retain their original relative order (stable sort by group value only); no secondary sort key such as primary text is introduced by this feature.
- Accessibility and keyboard navigation behavior already implemented for the option list (e.g., arrow-key movement, selection announcement) is expected to extend to skip non-selectable group headers, without requiring a redesigned interaction model.
- Search/filter matching behavior (case-insensitive substring match against primary and secondary text) is unchanged by this feature; grouping only affects how already-filtered results are organized for display. The group value itself is never used as a match target — only each option's own primary/secondary text is searched.
