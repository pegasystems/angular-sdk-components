# AutoComplete Create New Contract

## Consumer Contract

The existing AutoComplete field accepts optional creation properties from its Data Reference or Object Reference parent. All properties are additive and optional.

| Property | Type | Meaning |
|----------|------|---------|
| `allowCreatingRecords` | boolean | Enables the Create New action when the field is editable. |
| `createNewLabel` | localized string | Overrides the standard localized action label. |
| `createNewRecord` | `() => Promise<unknown>` | Initiates the parent-provided creation flow. |
| `contextClass` | string | Identifies the class used for creation and completion-event correlation. |
| `referenceType` | `Data` or `Case` | Identifies the completion event and created-record payload shape. |

## Behavioral Contract

1. When `allowCreatingRecords` is not `true`, the AutoComplete field renders and behaves exactly as it did before this contract.
2. When eligible, Create New is rendered only in an editable option list and is accessible through the option panel's normal input methods.
3. Invoking Create New calls `createNewRecord`; the field does not create records directly or make backend requests.
4. On a successful matching completion signal, the field refreshes its options, commits the new record identifier with the normal selection lifecycle, applies configured mapped values, and emits `onRecordChange` with the selected identifier.
5. On cancellation, failure, unrelated completion, or destruction, the field preserves the pre-existing selection and cleans up its pending event listener.

## Compatibility Contract

- The contract is additive: no existing AutoComplete input, output, or behavior is removed or renamed.
- Existing Data Reference and Object Reference templates remain the source of authorization, label resolution, context, and creation routing.
- Associated/local option sources do not gain a creation action unless they are supplied the same eligible reference configuration.
