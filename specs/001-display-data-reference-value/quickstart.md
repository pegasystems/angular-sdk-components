# Quickstart: Validate DataReference in Case Summary

## Prerequisites

- Node.js LTS and repository dependencies installed.
- Work from the Angular SDK Components repository root.
- For live E2E validation, a reachable Pega environment and configured test credentials are required.

## Static Validation

Run the focused quality checks after implementation:

```sh
npm run lint
npm run build-angular-sdk-components
```

Run the focused Angular unit tests through the repository's configured test command, selecting the material case-summary and ObjectReference specs when supported by the local Karma setup.

Expected result: lint has no errors or warnings, the library builds successfully, and the focused tests pass.

## Unit Scenarios

The material case-summary tests should verify:

1. A field with type `ObjectReference` renders the mapped ObjectReference component rather than the raw internal value.
2. The mapped component receives the field PConnect context and display-only intent.
3. Empty and unresolved references remain delegated to ObjectReference without undefined summary content.
4. Two ObjectReference fields render independently.
5. Existing text, date, status, operator, phone, email, and other field branches retain their current output.
6. The ObjectReference wrapper exposes the same label/value alignment and typography hooks as neighboring summary fields.

## Manual or E2E Validation

1. Start the Angular test application with the repository's normal development command.
2. Open a case containing a populated DataReference in the case summary.
3. Confirm the summary shows the ObjectReference-defined display value rather than the internal record identifier.
4. Confirm the ObjectReference value is aligned with neighboring labels and values.
5. Confirm an empty or unresolved reference uses the ObjectReference-defined fallback and does not break the summary.
6. Confirm a summary containing multiple references displays each selected record correctly.
7. Repeat the case-summary smoke flow in both portal and embedded modes when the configured E2E environment supports them.

Expected result: the selected record is identifiable from the summary, no internal identifier is used when a display value is available, and all other summary fields retain their existing presentation.
