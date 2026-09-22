# Quickstart: Validate Create New in AutoComplete

## Prerequisites

- Install dependencies with `npm install` from the repository root.
- Configure a reachable Pega environment and test credentials in `sdk-config.json` and the test configuration.
- Use a form that exposes eligible Data Reference and Object Reference fields as AutoComplete controls, including a configured mapped related field.

## Unit Validation

Run the library test suite:

```bash
ng test angular-sdk-components
```

Verify unit coverage includes:

1. Eligible editable Data and Object Reference configurations render Create New with the configured or fallback localized label.
2. Read-only, display-only, unsupported, and unconfigured fields do not render the action.
3. Data Reference completion refreshes options, commits the created key, applies mappings, emits the normal change event, and unsubscribes.
4. Object Reference completion ignores an unrelated class, then refreshes, maps, selects, emits, and unsubscribes for the matching class; it falls back to the returned identifier when the refreshed list has not yet included the record.
5. Cancellation, creation failure, and component destruction retain the original selection and remove any pending subscription.

## Portal and Embedded Validation

Start the test application:

```bash
npm run start-dev
```

In a second terminal, run the configured end-to-end suite:

```bash
npm test
```

For both portal and embedded modes, validate:

1. Open an eligible Data Reference AutoComplete, create a record, complete the creation view, and confirm the original form remains open with the new record selected.
2. Repeat for an eligible Object Reference AutoComplete and confirm no navigation replaces the originating form.
3. Confirm configured mapped fields and the parent reference state match a manual option selection.
4. Cancel creation and verify the original AutoComplete selection and unrelated field values are unchanged.
5. Open an ineligible, read-only, and display-only AutoComplete and confirm no Create New action is visible while filtering, selection, keyboard navigation, and display behavior continue to work.
6. Create two records sequentially from one eligible field and confirm each completed creation replaces the previous selection.

## Static Validation

Run lint and compilation before review:

```bash
npm run lint
npm run build-sdk
```

Expected result: lint completes with zero warnings/errors and the SDK compiles successfully. The contract to verify is [AutoComplete Create New Contract](contracts/auto-complete-create-new.md); data and state transitions are defined in [data-model.md](data-model.md).
