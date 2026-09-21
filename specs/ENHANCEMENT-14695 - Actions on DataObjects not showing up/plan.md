# Implementation Plan: Data Object Actions and Modal Submission

**Branch**: `ActionButton` | **Date**: 2026-09-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/ENHANCEMENT-14695 - Actions on DataObjects not showing up/spec.md`

## Summary

Data object records currently render an empty **Actions...** menu and an edit modal with no
footer controls, because the case view templates source menu entries only from `caseInfo`
while data objects publish theirs under `dataInfo`, and no data-object submit component
exists. The work is additive in three parts: source and render `availableActions` plus
`availableCreateCaseActions` from `dataInfo` in both case views (disabling the trigger when
the combined count is zero), add two click handlers that call `openDataObjectAction` and
`createWork`, and add a `DataViewActionButtons` footer component wired into the modal
container behind an `isDataObject && !isMultiRecordData` flag.

Research established two corrections to the original assumptions that materially change
scope: the `httpMessages` → banner path is **not** already wired in the modal container and
must be completed for in-modal save errors to appear, and the two case view components are
**not** identical, so the logic must be adapted per component rather than copied. See
[research.md](./research.md) R4 and R6.

## Technical Context

**Language/Version**: TypeScript with Angular ^21.x

**Primary Dependencies**: `@pega/constellationjs` (PCore/PConnect engine, owns the Redux
store), Angular Material ^21.x, `@pega/pcore-pconnect-typedefs` (version-locked API
definitions)

**Storage**: N/A — all state is owned by the engine and reached through PConnect

**Testing**: Karma + Jasmine unit tests (`ng test angular-sdk-components`); Playwright E2E
(`npm run test`) against a live Infinity server

**Target Platform**: Browser; both portal and embedded SDK modes

**Project Type**: Angular component library (`@pega/angular-sdk-components`) plus a test
application

**Performance Goals**: No new rendering cost on the work-case path; action sourcing happens
within the existing full-update pass, adding no extra render cycles

**Constraints**: Additive and backward compatible only; `modal-view-container` is an
infrastructure container requiring commented, vigilant change; no direct REST calls; no
hard-coded user-facing strings; `$`-suffix and `b`-prefix template property conventions

**Scale/Scope**: 2 new component files plus styles and a spec, 6 modified files, 0 removals

## Constitution Check

*GATE: evaluated before Phase 0 and re-evaluated after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Platform Boundary | PASS | Every operation goes through `pConn$.getActionsApi()` and `pConn$.getValue()`. No HTTP calls, no new store. |
| II. Component Contracts | PASS | New component declares typed inputs; children render via `<component-mapper>`; registered in the component map **and** exported from `public-api.ts`. Not a data field, so `FieldBase`/`PConnFieldProps` do not apply — matching the `ListViewActionButtons` precedent. |
| III. Backward Compatibility | PASS | Purely additive. No prop or export is removed or renamed. Work-case and embedded-data paths are untouched; `getBanners()` output is byte-equivalent when `httpMessages` is absent. |
| IV. Infrastructure Protection | PASS (vigilance required) | `modal-view-container` changes are additive, commented, and gated by a new flag; container/Redux logic is unchanged. Both portal and embedded modes must be E2E validated. |
| V. Security | PASS | No credentials, tokens, or URLs introduced; no auth logic touched. |
| VI. Testing Standards | PASS (planned) | Unit tests for both label modes, in-flight disabling, and the rejection path; E2E in both modes; lint at zero warnings. |
| VII. Spec and Plan Separation | PASS | [spec.md](./spec.md) names no file, framework, or API; all technical detail lives here and in `contracts/`. |
| VIII. Minimal Change and Code Health | PASS | Smallest effective change; a shared case-view helper was deliberately deferred (research R6) to avoid enlarging the diff. |
| IX. UX Consistency | PASS | Angular Material buttons only; all labels resolve through the engine's localization API under the existing `Data Object` category. |

**Post-Phase 1 re-evaluation**: no gate changed status. The one judgment call — completing
the `httpMessages` banner path inside an infrastructure container — is required by FR-008,
is additive, and is confined to a single method whose output is unchanged when no HTTP error
is present.

## Project Structure

### Documentation (this feature)

```text
specs/ENHANCEMENT-14695 - Actions on DataObjects not showing up/
├── plan.md              # This file (/speckit-plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── case-view-data-object-actions.md
│   ├── data-view-action-buttons.md
│   └── modal-view-container.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
packages/angular-sdk-components/src/
├── public-api.ts                                     # MODIFY — export new component
└── lib/
    ├── _bridge/helpers/
    │   └── sdk-pega-component-map.ts                 # MODIFY — register DataViewActionButtons
    └── _components/
        ├── field/
        │   ├── list-view-action-buttons/             # REFERENCE ONLY — unchanged
        │   └── data-view-action-buttons/             # NEW
        │       ├── data-view-action-buttons.component.ts
        │       ├── data-view-action-buttons.component.html
        │       ├── data-view-action-buttons.component.scss
        │       └── data-view-action-buttons.component.spec.ts
        ├── infra/Containers/modal-view-container/
        │   ├── modal-view-container.component.ts     # MODIFY — expose flags, merge httpMessages
        │   └── modal-view-container.component.html   # MODIFY — render new footer
        └── template/
            ├── case-view/
            │   ├── case-view.component.ts            # MODIFY — source dataInfo actions + handlers
            │   └── case-view.component.html          # MODIFY — render entries, disable trigger
            └── self-service-case-view/
                ├── self-service-case-view.component.ts    # MODIFY — same, adapted
                └── self-service-case-view.component.html  # MODIFY — same, adapted
```

**Structure Decision**: Standard library layout. The new component is placed under
`_components/field/` alongside `list-view-action-buttons`, the component it is modeled on,
so the two modal footers sit together. No new top-level directory is introduced.

### Implementation sequence

1. **Case views** (independently testable — delivers User Story 1 on its own)
   → [contracts/case-view-data-object-actions.md](./contracts/case-view-data-object-actions.md)
2. **New footer component** + registration in both required places
   → [contracts/data-view-action-buttons.md](./contracts/data-view-action-buttons.md)
3. **Modal container wiring** and the `httpMessages` banner fix
   → [contracts/modal-view-container.md](./contracts/modal-view-container.md)

Step 1 stands alone. Steps 2 and 3 together deliver User Stories 2 and 3; the footer cannot
render until the container passes the flag, so they land together.

### Primary risk

Per research R5, `httpMessages` is deliberately excluded from the bridge's props diff, so
merging it into `getBanners()` may not by itself cause a re-render on a failed save. If the
banner does not appear, trigger change detection from the failing submit path in the new
component — do **not** modify the bridge's diffing behavior.

## Complexity Tracking

No constitution principle is relaxed by this plan, so no justification entries are required.

The one item worth recording for reviewers is a deliberate **rejection** of added
abstraction: the near-duplicate action-sourcing block across the two case view components is
intentionally duplicated rather than extracted into a shared helper, because the components
differ in localization key derivation and action-visibility gating (research R6), and
extracting it would modify the internals of two working templates for marginal benefit —
contrary to Principle VIII.
