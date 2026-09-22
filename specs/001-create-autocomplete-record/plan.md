# Implementation Plan: Create AutoComplete Records

**Branch**: `001-create-autocomplete-record` | **Date**: 2026-09-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-create-autocomplete-record/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Add a Create New action to eligible editable AutoComplete fields rendered for Data Reference and Object Reference data. Extend the existing field's typed configuration and Angular Material option panel, invoke the creation callback supplied by the reference templates, and use platform lifecycle events to refresh the data source, apply the existing configured field mappings, select the created record, and emit the normal record-change output. Keep existing AutoComplete behavior unchanged for all ineligible configurations.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.9; Angular 21

**Primary Dependencies**: Angular Material 21, RxJS 7.8, `@pega/constellationjs`, `@pega/pcore-pconnect-typedefs` 4.1

**Storage**: N/A; platform-owned case and reference state

**Testing**: Karma/Jasmine unit tests; Playwright E2E against configured Pega environment

**Target Platform**: Browser-based Angular SDK library and its portal/embedded sample applications

**Project Type**: Angular component library

**Performance Goals**: Refresh the option list once after creation initiation and once after successful completion; do not introduce polling or duplicate event subscriptions.

**Constraints**: Use PConnect and PCore APIs only; preserve existing AutoComplete behavior; use Angular Material and localized labels; unsubscribe platform events on completion and component destruction.

**Scale/Scope**: One existing field component plus its template, styles if required, and focused unit/E2E coverage; no bridge, registry, or backend changes.

## Constitution Check

*GATE: Passed before Phase 0 research. Re-checked and passed after Phase 1 design.*

| Principle | Plan compliance |
|-----------|-----------------|
| I. Platform Boundary | Creation, refresh, state changes, and event subscriptions use engine-provided PConnect/PCore APIs; no direct backend calls or independent state store. |
| II. Component Contracts | AutoComplete remains a `FieldBase` field, uses a typed extension of `PConnFieldProps`, delegates display mode as today, and propagates selected values through the shared event utility. |
| III. Backward Compatibility | New behavior is strictly gated by existing reference configuration and access-derived eligibility; ineligible fields retain their current DOM and interaction behavior. |
| IV. Infrastructure Protection | No bridge or infrastructure/container files are modified. |
| V. Security | No credentials, tokens, URLs, or custom authorization logic are introduced; existing platform permission decisions are honored. |
| VI. Testing Standards | Plan adds focused unit coverage and portal plus embedded E2E validation for creation and regression paths. |
| VII. Spec and Plan Separation | The specification remains outcome-focused; implementation files, APIs, and technical decisions are contained here and in design artifacts. |
| VIII. Minimal Change and Code Health | Changes stay within the existing AutoComplete component and tests, reusing established reference-template creation callbacks. |
| IX. UX Consistency | The action is an Angular Material control in the existing option panel and uses localized platform-provided text. |

## Project Structure

### Documentation (this feature)

```text
specs/001-create-autocomplete-record/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
packages/angular-sdk-components/src/lib/_components/field/auto-complete/
├── auto-complete.component.ts       # Typed configuration, creation lifecycle, option refresh/mapping
├── auto-complete.component.html     # Option list and Create New action
├── auto-complete.component.scss     # Scoped option-panel action presentation, if needed
└── auto-complete.component.spec.ts  # Field behavior unit coverage

projects/angular-test-app/tests/e2e/
└── ...                              # Portal and embedded end-to-end workflow coverage
```

**Structure Decision**: Modify the existing AutoComplete field only. Reference templates already supply eligibility, context, reference type, and creation callback; no new component, public registry entry, bridge change, service, or backend endpoint is needed.
