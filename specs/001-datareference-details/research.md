# Research: DataReference Details Rendering

## Decision: Render DataReference through its existing component

**Rationale**: DataReference has read-only and interactive behavior that the generic Details value formatter cannot reproduce. The existing component resolves the reference and provides the link behavior.

**Alternatives considered**:

- Render the selected text directly in Details: rejected because it loses referenced-details navigation.
- Change the shared view container: rejected because the issue occurs before a routed view is created.

## Decision: Resolve the relationship from field metadata when display text is resolved

**Rationale**: The displayed reference text can no longer identify the source property. The selected context page and field metadata identify the matching relationship, its data source, and required parameters.

**Alternatives considered**:

- Infer the relationship from the display text: rejected because values are not unique.
- Add a new backend lookup: rejected because metadata is already available through the existing component contract.

## Decision: Keep layout overrides scoped to Details mode

**Rationale**: Read-only references have standalone margins that are appropriate outside the Details grid but create extra spacing inside it.

**Alternatives considered**:

- Remove shared reference margins: rejected because it would change standalone layouts.
- Apply a generic value-cell margin to every field: rejected because ObjectReference has a nested layout.
