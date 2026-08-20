<!--
Sync Impact Report
- Version change: 1.1.0 → 2.0.0
- Modified principles:
  - I. Platform Boundary: rewritten — high-level, removed API method
    listings; was "PCore & PConnect API Access"
  - II. Component Contracts: rewritten — merged old III (Typed
    ConfigProps), V (Standalone), IX (Dynamic Rendering), XI (Event
    Handling), XII (Naming); was "Angular Material Design System"
  - III. Backward Compatibility: new (replaces old VII Override
    Architecture with broader scope)
  - IV. Infrastructure Protection: new
  - V. Security: new
  - VI. Testing Standards: rewritten from old "Quality Gates"
  - VII. Spec and Plan Separation: new
  - VIII. Minimal Change and Code Health: new (subsumes old
    "Technology Constraints" section)
  - IX. UX Consistency: rewritten — high-level, removed module
    names; was "Angular Material Design System"
- Removed sections: Technology Constraints (tech stack details moved
  to copilot-instructions.md), Component Anatomy Reference (moved
  to components.instructions.md)
- Added sections: V Security, VII Spec/Plan Separation
- Deferred items: None
-->

# Angular SDK Components Constitution

## Core Principles

### I. Platform Boundary

All data access and case lifecycle operations MUST go through the
PConnect API provided by the engine. No component may make direct
REST calls to the backend, create its own state store, or manage
case state independently.

The engine owns state; the SDK owns rendering.

**Done means**:

- No HTTP calls or direct backend API access exist in component
  code.
- No custom state store is created for case data.
- All case data reads and writes go through the engine-provided
  API.
- Components that need platform data receive it through
  engine-provided props, not through independent data fetching.

### II. Component Contracts

Components receive their platform interface through a single prop.
The contract between the engine and SDK components MUST remain
consistent across all component subtypes.

- Every component MUST declare a typed interface for its config
  props. Field components MUST extend the shared field props
  interface. Non-field components MUST declare their own typed
  interface — `any` is never acceptable for config props.
- Field components MUST propagate values through the engine's
  action API using the shared event utility. Text-input fields
  MUST buffer input locally and propagate on blur. Selection
  fields propagate immediately on change.
- Read-only rendering MUST always delegate to the design system
  extension component — never render raw markup for display mode.
- Child components MUST be rendered dynamically through the
  component mapper — never by directly referencing sibling
  component selectors.
- New components MUST be registered in the master component
  registry and exported from the library's public API.

**Done means**:

- Every component has a typed props interface — no `any` on
  config props.
- Field components propagate values through the event utility.
  Text-input fields buffer locally and propagate on blur;
  selection fields propagate immediately on change.
- Read-only display modes delegate to the design system extension,
  not raw markup.
- Children render through the component mapper, not hard-coded
  selectors.
- The component is registered in the component map and exported
  from the public API.

### III. Backward Compatibility

Changes to component props, bridge behavior, or exported APIs MUST
remain backward compatible. Breaking changes are NOT allowed
without documented justification.

Old and new contracts MUST coexist during deprecation. The override
architecture — local component map checked before the default map —
MUST be preserved. Base components MUST NOT reference or depend on
the overrides package.

**Done means**:

- No existing component prop is removed or renamed without a
  deprecation period.
- Existing consumer flows (both portal and embedded modes)
  continue to work without changes.
- If a contract changed, legacy and new paths are both tested.
- The local-before-default component resolution order is intact.
- Release notes call out impacted consumers and upgrade actions.

### IV. Infrastructure Protection

Bridge and container components affect the entire rendering
pipeline. These areas are rarely modified and require extra
vigilance.

Changes to bridge or container components MUST be backward
compatible, thoroughly tested across both application modes (portal
and embedded), and include clear comments explaining the reasoning.

**Done means**:

- Bridge changes do not break component resolution, store
  subscription, or visibility logic.
- Container changes include comments explaining why the
  modification is needed.
- Both application modes (portal and embedded) are validated
  after the change.
- No silent regressions in assignment lifecycle, case flow, or
  view rendering.

### V. Security

Secrets, credentials, and platform URLs MUST never be hardcoded in
source, tests, mocks, configs, or scripts. Authentication is handled
entirely by the auth package — no custom auth logic.

**Done means**:

- No passwords, tokens, API keys, or private certificates appear
  anywhere in source.
- Configuration values use runtime injection via the SDK config
  file.
- No new authentication or authorization logic is implemented
  outside the auth package.
- Any security-related change is documented in the PR with
  rationale and impact.

### VI. Testing Standards

- Unit tests MUST be added or updated for every behavior change.
- Unit tests MUST validate component rendering in both edit and
  display modes.
- Changes affecting case flow or form behavior MUST include E2E
  validation against the live platform in both portal and embedded
  modes.
- Test coverage MUST NOT regress below the level present on main
  at the time the branch was cut.

**Done means**:

- New or modified components have unit tests covering edit mode,
  display-only mode, and error/validation states.
- Field components are tested for blur-based value propagation.
- Changes to bridge, containers, or assignment flow include E2E
  test validation.
- Linter passes with zero errors and zero warnings.
- Coverage report shows no regression compared to main.

### VII. Spec and Plan Separation

`spec.md` and `plan.md` MUST stay in their own lanes:

- `spec.md` describes WHAT the feature does and WHY — in
  technology-agnostic terms.
- `plan.md` describes HOW to implement it — with specific files,
  APIs, and technical decisions.

**Done means**:

- `spec.md` contains no tool, framework, library, or file names.
- `plan.md` contains a "Complexity Tracking" section whenever a
  constitution principle is consciously relaxed.
- The two files can be read independently without contradiction.

### VIII. Minimal Change and Code Health

Changes MUST be minimal, focused, and aligned with the intended
scope. Implement the smallest effective change required to deliver
the desired behavior.

**Done means**:

- Changes do not introduce unrelated modifications, dead code,
  unused imports, or unresolved TODOs.
- New code follows existing patterns for its component subtype
  (field, template, widget, infra, designSystemExtension).
- Destructive operations are confirmed before execution.
- Code is clean and maintains readability and consistency with
  the surrounding codebase.

### IX. UX Consistency

All UI rendering MUST use the project's design system components.
User experience consistency is non-negotiable across all component
subtypes.

- No raw HTML form controls in any component.
- All user-facing strings MUST be localized through the engine's
  localization API — no hard-coded English text.
- Display mode rendering MUST be consistent across all field
  components, delegating to the same design system extension
  pattern.

**Done means**:

- Every form control uses the design system component library,
  not native HTML elements.
- All field components handle display modes through the same
  design system extension pattern.
- No hard-coded user-facing strings exist in component code.
- Visual behavior is consistent across both application modes.

## Governance

This constitution defines the baseline standards for planning,
implementation, and review across this repository and supersedes
any conflicting local conventions.

**Change Management**:

- Changes to this constitution MUST be proposed with clearly
  documented purpose, scope, and impact on existing code or
  workflows.
- Updates MUST be reviewed and approved by maintainers responsible
  for the impacted areas.
- Version increments follow semantic versioning: MAJOR for
  principle removals or redefinitions, MINOR for new principles
  or material expansions, PATCH for clarifications and wording
  fixes.

**Engineering Compliance**:

- All artifacts (plans, specifications, tasks, and code) MUST
  align with this constitution.
- All PRs and reviews MUST verify compliance with these
  principles.
- Complexity or principle relaxation MUST be justified and tracked
  in the plan's Complexity Tracking section.

Refer to `AGENTS.md` for project identity, commands, and
prohibitions. Refer to `.github/instructions/` for implementation-
level details (bridge, components, build scripts, testing).

**Version**: 2.0.0 | **Ratified**: 2026-08-13 | **Last Amended**: 2026-08-19
