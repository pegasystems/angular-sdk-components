# Quickstart: Validate DataReference Details Rendering

## Prerequisites

- Install repository dependencies.
- Configure a portal scenario containing a Details view with populated and empty DataReference fields.
- Start the Angular test application.

## Validation Scenarios

1. Open a case with a populated DataReference field in Details.
   Expected: the selected value appears in the Details value column and aligns with adjacent values.

2. Open a case with an empty DataReference field in Details.
   Expected: the empty value has no additional vertical spacing compared with an adjacent empty standard field.

3. Select the populated DataReference value.
   Expected: the referenced record's details view opens without a missing-context error.

4. Review a Details section containing non-DataReference fields.
   Expected: existing text, date, currency, status, and scalar-list values remain unchanged.

## Automated Validation

Run the repository development build:

```bash
npm run build:dev
```

Expected: the build completes successfully.

## Follow-up Test Coverage

Add focused automated rendering and navigation coverage before release, as listed in [tasks.md](tasks.md).
