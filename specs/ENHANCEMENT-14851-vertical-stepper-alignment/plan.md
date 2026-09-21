# Implementation Plan: Vertical Stepper Alignment

**Branch**: `001-vertical-stepper-alignment` | **Date**: 2026-09-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-vertical-stepper-alignment/spec.md`

## Summary

Add left and right vertical navigation layouts for multi-step assignments. The assignment component will normalize the configured navigation template and pass an explicit alignment indicator to the multi-step component. The multi-step component will retain its legacy vertical input as a fallback, render vertical navigation as a rail beside a separate assignment-content area, and use grid ordering to place the rail on the requested side. Horizontal, standard, and single-step paths remain unchanged.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.9, Angular 21

**Primary Dependencies**: Angular, Angular Material, PConnect engine APIs

**Storage**: N/A

**Testing**: Karma/Jasmine unit tests; Playwright portal and embedded end-to-end tests

**Target Platform**: Browser-based portal and embedded application modes

**Project Type**: Angular component library with a browser test application

**Performance Goals**: Preserve existing assignment rendering responsiveness; no additional data retrieval or lifecycle work

**Constraints**: Preserve PConnect ownership of state, mapper override compatibility, action handling, current/completed step status, and existing horizontal/hidden-navigation behavior

**Scale/Scope**: Two infrastructure components, their unit tests, and targeted portal/embedded regression coverage

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Plan Assessment | Status |
|-----------|-----------------|--------|
| Platform Boundary | Read existing navigation configuration through PConnect only; no direct backend calls or state store. | Pass |
| Component Contracts | Add a typed optional mapper input while preserving the existing vertical input for override compatibility. Render assignment children through the existing component mapper. | Pass |
| Backward Compatibility | Keep the horizontal, standard, and single-step paths unchanged; use the legacy vertical boolean when the new alignment input is absent. | Pass |
| Infrastructure Protection | Limit changes to assignment presentation state and multi-step layout; do not alter container, routing, or lifecycle logic. Include rationale comments in touched infrastructure code. | Pass |
| Security | No credentials, URLs, or authentication behavior are introduced. | Pass |
| Testing Standards | Add unit coverage for every template mode and validate both portal and embedded modes against the live platform. | Pass |
| UX Consistency | Reuse current design tokens and stepper visual states; introduce no user-facing strings. | Pass |

**Post-design re-check**: Pass. The chosen grid layout and optional input preserve all constitution gates without a relaxation.

## Project Structure

### Documentation (this feature)

```text
specs/001-vertical-stepper-alignment/
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
packages/angular-sdk-components/src/lib/_components/infra/
├── assignment/
│   ├── assignment.component.ts       # Resolve template to navigation mode
│   ├── assignment.component.html     # Pass mode to MultiStep mapper
│   └── assignment.component.spec.ts  # Template resolution tests
└── multi-step/
  ├── multi-step.component.ts       # Typed alignment input and fallback behavior
  ├── multi-step.component.html     # Horizontal and vertical rendering branches
  ├── multi-step.component.scss     # Rail/content grid and alignment classes
  └── multi-step.component.spec.ts  # Rendering and compatibility tests

projects/angular-test-app/tests/
└── e2e/                              # Portal and embedded assignment-flow regression coverage
```

**Structure Decision**: Modify the existing assignment and multi-step infrastructure components. The assignment remains responsible for interpreting platform navigation metadata, while MultiStep owns the presentation and layout of the resolved mode.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
