# Data Model: Case Summary DataReference Rendering

This feature does not add or persist domain data. It changes how an existing prepared case-summary field is rendered.

## Case Summary Field

A prepared field object produced from a PConnect child for the case-summary presentation.

| Attribute | Source | Meaning | Rendering rule |
|---|---|---|---|
| `type` | PConnect metadata | Component type, such as `ObjectReference`, `TextInput`, or `Date` | Compared case-insensitively for the ObjectReference branch; other types retain current branches |
| `config` | Resolved field metadata | Label, value/configuration, visibility, display settings, and other field props | The summary owns label/layout; ObjectReference owns reference value/fallback |
| `kid` or PConnect context | Case-summary preparation | PConnect instance for the child field | Passed to the component mapper so ObjectReference can resolve its value through its normal lifecycle |
| `displayLabel` | Summary preparation | Summary-specific label override where applicable | Preserved for the summary label, especially in secondary fields |

## DataReference / ObjectReference

An existing field component that points to a selected record. Its internal identifier and human-readable display value are platform-managed through PConnect metadata and ObjectReference rendering.

Rules:

- A populated reference is rendered by ObjectReference, not by interpolating `config.value` in the summary template.
- The ObjectReference component defines the value and fallback shown when the display value is empty or unresolved.
- The summary passes display-only intent and the field PConnect context; it does not fetch, transform, or persist reference data.
- Multiple reference fields retain independent PConnect contexts and must render independently.
- Visibility and existing case-summary field selection remain unchanged.

## Render States

1. **Populated reference**: ObjectReference displays the selected record's configured human-readable value.
2. **Empty reference**: ObjectReference handles the standard empty presentation; the summary remains structurally intact.
3. **Unresolved reference**: ObjectReference handles its configured fallback without exposing an undefined value or breaking neighboring fields.
4. **Multiple references**: Each field invokes ObjectReference with its own context and value.
5. **Non-reference field**: Existing case-summary branch renders the field as before.

## Relationships

- `CaseSummaryComponent` prepares field objects from case-summary child PConnect nodes.
- `MaterialCaseSummaryComponent` renders prepared objects and owns summary layout/styling.
- `ObjectReferenceComponent` resolves and renders DataReference values.
- `ComponentMapperComponent` resolves the registered ObjectReference component while preserving override behavior.
