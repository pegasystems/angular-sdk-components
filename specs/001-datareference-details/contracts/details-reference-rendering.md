# Details Reference Rendering Contract

## Inputs

| Input | Required | Behavior |
|-------|----------|----------|
| Field descriptor | Yes | Supplies the field type, label, value, and component context. |
| Details mode indicator | Yes for Details rendering | Enables Details-only spacing behavior. |
| Relationship context | Optional | Identifies the selected record relationship when available. |
| Selected context page | Optional | Supplies values needed to resolve referenced-details parameters. |

## Outputs

| Condition | Result |
|-----------|--------|
| Populated DataReference | Render the selected value in the Details value column as a link. |
| Empty DataReference | Render the standard empty value without additional Details spacing. |
| Resolved relationship metadata | Open the referenced record's details view on selection. |
| Missing relationship metadata | Do not attempt referenced-details navigation. |

## Compatibility

- Non-DataReference Details fields retain their existing rendering contract.
- Reference rendering outside Details retains its existing layout behavior.
- No public component inputs are removed or renamed.
