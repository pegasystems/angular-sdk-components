# Implementation Plan: SimpleTable Add Label Parity

**Branch**: `001-simple-table-add-label` | **Date**: 2026-09-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-simple-table-add-label/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Expose the platform-configured target class label in the Angular SimpleTableManual Add button. The component already resolves and stores `targetClassLabel`; the implementation will derive a localized `Add {targetClassLabel}` label with a localized `Add` fallback, while preserving existing visibility and record-creation behavior.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with Angular 21

**Primary Dependencies**: Angular Material, PConnect/PCore localization APIs, Karma/Jasmine

**Storage**: N/A; the feature reads resolved component configuration and does not persist data

**Testing**: Karma/Jasmine library unit tests; existing Angular Playwright portal and embedded suites for integration validation

**Target Platform**: Angular SDK library consumed in browser-based portal and embedded applications

**Project Type**: Angular component library

**Performance Goals**: Label derivation must be synchronous and have no measurable impact on table rendering or add-record interaction

**Constraints**: Use existing localization and PConnect configuration flows; do not change add-button visibility, styling, or record-creation behavior; preserve localization fallback behavior

**Scale/Scope**: One existing template component and its focused unit-test coverage; no bridge, registry, public API, or other table variant changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Post-design re-check: PASS. The Phase 1 artifacts introduce no new dependencies, interfaces, state storage, bridge changes, or constitution exceptions.

- **I. Platform Boundary**: PASS. The change reads resolved configuration and uses existing PConnect/PCore localization and action flows; it adds no direct backend access or state store.
- **II. Component Contracts**: PASS. The existing typed component props and template rendering contract remain intact.
- **III. Backward Compatibility**: PASS. The default localized Add label and all existing visibility/action paths remain available.
- **IV. Infrastructure Protection**: PASS. No bridge or container code is changed.
- **V. Security**: PASS. No credentials, URLs, or authentication behavior are involved.
- **VI. Testing Standards**: PASS with focused unit tests plus existing portal/embedded validation for the changed user-facing behavior.
- **VII. Spec and Plan Separation**: PASS. Technical file and API details are confined to this plan and design artifacts.
- **VIII. Minimal Change and Code Health**: PASS. The change is limited to label derivation/rendering and focused tests.
- **IX. UX Consistency**: PASS. The label continues to use the engine localization API and Angular Material button.

## Project Structure

### Documentation (this feature)

```text
specs/001-simple-table-add-label/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Not needed: no new external interface
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
packages/angular-sdk-components/src/lib/_components/template/simple-table-manual/
├── simple-table-manual.component.ts       # Resolve/store the display label
├── simple-table-manual.component.html     # Render the derived label
└── simple-table-manual.component.spec.ts  # Focused unit tests
```

**Structure Decision**: Keep the existing standalone Angular template component structure. Update only the SimpleTableManual component and its colocated Jasmine spec; no contracts directory is required because no public API or external service contract changes.

## Complexity Tracking

No constitution violations. Complexity tracking is not required.
