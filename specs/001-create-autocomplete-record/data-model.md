# Data Model: Create AutoComplete Records

## AutoComplete Creation Configuration

The existing field configuration gains optional creation inputs. All are absent for current configurations, preserving prior behavior.

| Field | Type | Source | Rules |
|-------|------|--------|-------|
| `allowCreatingRecords` | boolean | Reference-template eligibility | Create action is rendered only when `true` and the field is editable. |
| `createNewLabel` | localized string | Reference configuration | Use when non-empty; otherwise resolve the standard localized Create New label. |
| `createNewRecord` | creation callback | Reference template | Starts the appropriate creation experience and returns its initiation result. |
| `contextClass` | string | Reference template | Identifies the record type to create and scopes platform completion events. |
| `referenceType` | `Data` or `Case` | Reference template | Selects Data Reference versus Object Reference completion handling. |

## Existing Option Model

| Field | Type | Purpose |
|-------|------|---------|
| `key` | string | Identifier committed to the field when an option is selected. |
| `value` | string | Primary display text. |
| `secondaryComponents` | collection | Optional rendered secondary information. |
| `secondarySearchText` | string | Optional text used during filtering. |
| `group` | string | Optional group identifier for option-list rendering. |

## Created Record Completion Data

| Reference type | Completion signal | Required data | Selection behavior |
|----------------|-------------------|---------------|--------------------|
| Data Reference | Data-object-created event | Created record values and/or key | Refresh options, apply all configured mappings, and commit the created key. |
| Object Reference | Create-stage-done event | Created case/object identifier and class | Ignore unrelated completion events; refresh options, find the created option, apply mappings when found, otherwise commit the returned identifier. |

## State Transitions

```text
Ineligible -> Existing option-list behavior
Eligible, idle -> Create action available
Create action invoked -> Completion listener registered -> Creation experience open
Creation cancelled or initiation fails -> Eligible, idle (prior field and mapped values retained)
Creation succeeds -> Refresh options -> Apply mappings and select created identifier -> Eligible, idle
Component destroyed while pending -> Listener removed -> No component-owned follow-up work
```

## Validation Rules

- Creation configuration must not alter current behavior when absent or ineligible.
- A Data Reference completion must use the returned record values to apply configured mappings.
- An Object Reference completion must match the configured context class before changing the field.
- A selected created record must travel through the same engine change mechanism as an existing option.
- Each creation attempt owns at most one active completion listener; completion, failure, cancellation, and destruction remove it.
