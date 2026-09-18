# Research: Display DataReference Value in Case Summary

## Decision 1: Delegate DataReference value rendering to ObjectReference

- Decision: When a prepared case-summary field has type `objectreference`, render the existing Angular ObjectReference component through the component mapper and pass the field's PConnect instance. Force display-only behavior for the summary.
- Rationale: The Angular ObjectReference component already owns DataReference value resolution, read-only modes, visibility, and fallback behavior. The React CaseSummaryFields implementation follows the same boundary by rendering ObjectReference instead of reading `config.value` directly. This avoids duplicating reference resolution in the case-summary component and keeps platform data access behind PConnect.
- Alternatives considered:
  - Read `field.config.value` directly in the case-summary template: rejected because this is the current defect and exposes the internal identifier/default value.
  - Resolve the display value inside `MaterialCaseSummaryComponent`: rejected because it duplicates ObjectReference behavior and risks divergence from normal field rendering.
  - Add a new case-summary-specific reference renderer: rejected because the existing ObjectReference component and component map already provide the required behavior.

## Decision 2: Keep labels and styling in the case-summary presentation

- Decision: The case-summary wrapper remains responsible for the field label and layout. Add a small ObjectReference wrapper/style rule to align its output with neighboring summary values.
- Rationale: The requirement asks for the ObjectReference-defined value while preserving the case-summary visual language. The React implementation wraps the ObjectReference value and applies summary-specific alignment. Angular already has summary field classes that can provide the same role without changing ObjectReference globally.
- Alternatives considered:
  - Change ObjectReference global styles: rejected because it could affect regular form/detail rendering.
  - Render the label inside ObjectReference: rejected because it would alter the shared field contract and could duplicate labels.
  - Leave the existing raw-value styles unchanged: rejected because the component output may not inherit the same typography, spacing, and alignment as ordinary summary values.

## Decision 3: Reuse the existing field preparation and registry

- Decision: Keep `CaseSummaryComponent.generatePrimaryAndSecondaryFields` and `Utils.prepareComponentInCaseSummary` as the source of prepared field objects. Reuse the existing `ObjectReference` registry entry; do not add a new public export or bridge mapping.
- Rationale: Preparation already preserves the field metadata and creates a PConnect-backed component object. The master component map already registers ObjectReference. The smallest change is therefore in the material case-summary renderer.
- Alternatives considered:
  - Change the bridge or field preparation pipeline: rejected because those layers already expose the required PConnect context and changing them expands regression risk.
  - Register a new CaseSummaryObjectReference component: rejected because the standard ObjectReference component is the required value owner.

## Decision 4: Test at the presentation boundary

- Decision: Add focused Angular unit tests for the material case-summary renderer, covering ObjectReference mapping, display-only props/context, empty or unresolved delegation, multiple references, styling hooks, and unchanged ordinary-field branches. Run the Angular library build and lint; use existing portal and embedded E2E infrastructure when a DataReference fixture is available.
- Rationale: The behavior change is in the design-system extension template and styles. Unit tests can verify the mapper contract without requiring live platform data, while the existing E2E modes provide regression coverage for the shared case-summary flow.
- Alternatives considered:
  - E2E-only validation: rejected because live credentials/data are not always available and it would not isolate template regressions.
  - ObjectReference-only tests: insufficient because the defect is the case-summary renderer failing to invoke it.
