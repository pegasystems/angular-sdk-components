# Research: Create AutoComplete Records

## Decision: Keep the feature in the existing AutoComplete field

**Rationale**: The field already owns the option panel, loaded options, selection behavior, and `onRecordChange` output. Reference template components already resolve eligibility and can supply the reference context and creation callback. This confines the change to the component that controls the behavior.

**Alternatives considered**:

- Add creation behavior to the PConnect bridge. Rejected because bridge changes would affect all dynamic component rendering without owning the AutoComplete presentation or selection state.
- Build a new wrapper component. Rejected because it would duplicate the existing field lifecycle and expand the public component surface.

## Decision: Use existing reference-template eligibility and creation callbacks

**Rationale**: The Object Reference and Data Reference templates already determine whether creation is allowed using authored configuration, environment capabilities, and create access. They also construct the correct Data Reference or Object Reference creation action and preserve the form context. AutoComplete should consume those supplied props rather than repeat authorization or creation routing rules.

**Alternatives considered**:

- Recalculate access in AutoComplete. Rejected because eligibility would be duplicated and could diverge from existing reference behaviors.
- Always expose Create New for configured fields. Rejected because it ignores access and authoring eligibility.

## Decision: Subscribe to the platform completion event before triggering creation

**Rationale**: Data Reference and Object Reference creation complete asynchronously and notify consumers through distinct platform events. Subscribing before the create action prevents a fast completion event from being missed. The handler can refresh options, map values, select the new key, emit the normal change notification, and unsubscribe using a component-unique subscription key.

**Alternatives considered**:

- Treat create-action promise resolution as record creation completion. Rejected because the promise represents opening or initiating the creation experience; the completion event carries the created-record result.
- Poll the data source after creation. Rejected because it introduces unnecessary requests and does not reliably identify the created record.

## Decision: Reuse selection mapping and event propagation semantics

**Rationale**: Existing AutoComplete selection calls the shared event utility to update the selected identifier and invokes `onRecordChange`. The creation path must use the same selection/mapping semantics so configured related properties and parent reference behavior remain consistent.

**Alternatives considered**:

- Set the field control value only. Rejected because that bypasses the engine field-change lifecycle and related-property mappings.
- Refresh options without selecting the record. Rejected because it fails the core user flow.

## Decision: Provide a scoped Angular Material action beneath options

**Rationale**: The action belongs to the existing autocomplete panel and must be keyboard-reachable and visually consistent with the SDK design system. It is conditionally rendered only for eligible, editable fields and uses a provided localized label or the standard localized fallback.

**Alternatives considered**:

- Add a separate button outside the field. Rejected because it separates creation from the option-list task and changes the layout of existing fields.
- Use hard-coded English label text. Rejected because all user-facing text must use platform localization.

## Decision: Treat cancellation and initiation failure as no-op field changes

**Rationale**: A cancelled or failed creation has no selected record result. The component must leave the current selection and mapped fields unchanged, release any pending subscription, and allow another attempt where creation remains eligible.

**Alternatives considered**:

- Clear the selection on cancellation. Rejected because it discards user state and violates the feature specification.

## Decision: Validate at component and live-workflow levels

**Rationale**: Unit tests can reliably mock configuration, engine actions, completion events, mappings, and cleanup. Live E2E validation is needed for the platform-owned creation flow, and must cover portal and embedded applications per the constitution.

**Alternatives considered**:

- Unit tests only. Rejected because opening and completing platform creation views cannot be fully simulated with confidence in an isolated component test.
