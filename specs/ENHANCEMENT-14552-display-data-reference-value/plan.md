# Implementation Plan: Display DataReference Value in Case Summary

**Branch**: `001-display-data-reference-value` | **Date**: 2026-09-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-display-data-reference-value/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Update Angular case-summary field rendering so DataReference fields are rendered by the existing ObjectReference component, matching the React implementation's delegation model. Keep the case-summary label and layout owned by the material case-summary presentation, and add only the styling needed to make the ObjectReference output align with neighboring summary fields. Other field types retain their current rendering paths.

## Technical Context

**Language/Version**: TypeScript with Angular 21

**Primary Dependencies**: Angular Material, AngularPConnectService, ComponentMapperComponent, PConnect ObjectReference component

**Storage**: N/A; values and lifecycle remain owned by PConnect/PCore

**Testing**: Karma/Jasmine Angular unit tests; lint and Angular library build

**Target Platform**: Angular SDK library consumed by portal and embedded case-summary views

**Project Type**: Angular component library

**Performance Goals**: Preserve existing case-summary rendering cost; do not add independent data fetching or polling

**Constraints**: Use the existing component mapper and ObjectReference lifecycle; preserve labels, visibility, empty states, and non-DataReference output; keep display behavior read-only in the summary

**Scale/Scope**: Shared case-summary presentation for primary and secondary fields, including multiple DataReference fields in one summary

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Platform Boundary**: PASS. The plan delegates value resolution to the existing PConnect-backed ObjectReference component and adds no REST calls or local store.
- **Component Contracts**: PASS. Rendering uses the existing component mapper and design-system component path; no new component contract is introduced.
- **Backward Compatibility**: PASS. Existing field branches remain unchanged and ObjectReference is only specialized in case-summary display.
- **Infrastructure Protection**: PASS. Bridge/container code is not changed; the existing component registry entry is reused.
- **Testing Standards**: PASS with planned focused unit coverage, lint/build validation, and portal/embedded E2E smoke validation where the live environment is available.
- **Spec and Plan Separation**: PASS. Implementation paths and Angular-specific decisions are confined to this plan and design artifacts.
- **Minimal Change and Code Health**: PASS. The change is limited to case-summary rendering, styles, and tests.
- **UX Consistency**: PASS. ObjectReference remains the source of value presentation and the summary wrapper provides matching field styling.

## Project Structure

### Documentation (this feature)

```text
specs/001-display-data-reference-value/
├── plan.md              # This file
├── research.md          # Phase 0 research
├── data-model.md        # Phase 1 field/rendering model
├── quickstart.md        # Phase 1 validation guide
├── contracts/           # Not needed: no external contract added
└── tasks.md             # Phase 2 output from /speckit-tasks
```

### Source Code (repository root)

```text
packages/angular-sdk-components/src/lib/_components/
├── designSystemExtension/material-case-summary/
│   ├── material-case-summary.component.html
│   ├── material-case-summary.component.scss
│   └── material-case-summary.component.spec.ts
├── field/object-reference/
│   └── object-reference.component.ts   # Existing renderer reused
└── template/case-summary/
    ├── case-summary.component.ts       # Existing field-object preparation reused
    └── case-summary.component.spec.ts

projects/angular-test-app/tests/
└── e2e/                                # Existing portal/embedded smoke coverage if fixture supports DataReference
```

**Structure Decision**: Keep the feature inside the existing Angular component-library case-summary presentation. The template continues to prepare PConnect-backed field objects; the material design-system extension decides how each prepared field is rendered. No new service, storage, registry entry, or public export is needed.

## Phase 0: Research Summary

See [research.md](./research.md). The key decision is to mirror the React CaseSummaryFields behavior by mapping `objectreference` to the existing ObjectReference component through Angular's component mapper, while retaining the Angular summary wrapper for labels and styling.

## Phase 1: Design Summary

See [data-model.md](./data-model.md) for the prepared summary-field shape and [quickstart.md](./quickstart.md) for validation scenarios. No external API contract is added because this is an internal presentation change using existing PConnect metadata and component-map contracts.

### Implementation Sequence

1. Update the material case-summary template to branch on `objectreference` and render `ObjectReference` with the prepared field PConnect context in display-only mode.
2. Add summary-local wrapper classes/styles so the ObjectReference output aligns with existing labels, value typography, spacing, and left alignment.
3. Add focused Angular unit tests covering populated, unresolved/empty, multiple-reference, and non-reference rendering behavior.
4. Run lint, targeted unit tests, and the Angular library build; run portal and embedded E2E smoke coverage when the configured platform is available.

## Complexity Tracking

No constitution violations. The feature uses the existing component mapper, ObjectReference component, and case-summary styles without adding a new abstraction or project.
