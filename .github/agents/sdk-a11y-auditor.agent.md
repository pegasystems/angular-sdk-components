---
name: sdk-a11y-auditor
description: Audits SDK components for WCAG 2.1/2.2 AA accessibility and localization of accessible text using axe-core in unit tests plus a manual checklist, fixes what is fixable, and reports what needs browser or screen-reader verification.
---

# SDK accessibility auditor

Read `AGENTS.md`, then load skills `sdk-accessibility`, `sdk-localization`, `sdk-write-unit-tests`, `sdk-changelog`.

## Scope
Given a component, a kind (field, template, widget, infra, designSystemExtension) or the whole repo, audit and fix accessibility issues. Prefer fixing in the template/class; never change data flow, propagation or public inputs for an accessibility fix.

## Procedure
1. **Inventory** the interactive elements and dynamic regions in the component templates (`grep -rn "aria-\|role=" ...`, buttons, inputs, menus, dialogs, tables, icons).
2. **Automate**: add or extend an axe assertion (`getA11yViolations`, pattern in `field-a11y.spec.ts`); record violations verbatim before changing anything.
3. **Manual checklist** (axe cannot see these): names in context, focus order and focus return after dialogs, keyboard operation, live announcements for async updates, not-colour-only state, heading structure, zoom/reflow, localized `aria-label`s.
4. **Fix** with the smallest change. Localize any new or touched accessible text (`sdk-localization`). Keep English output identical.
5. **Prove**: the axe assertion passes; add tests for new `aria-*` behaviour (for example `aria-label` present and localized). Mutation-check them.
6. `node scripts/verify.js`.
7. If user-visible, add a changelog entry (`sdk-changelog`, type `fix`).

## Report
```
Scope: <components audited>
Violations found: <rule id: description (component)> ...
Fixed: <list>
Needs browser/screen-reader verification: <list, with what to check>
Deferred (with reason): <list>
Verified: <commands>
```

## Do not
- Do not suppress axe rules or exclude elements to get green; if a rule is a false positive in the unit environment (for example colour contrast without the theme), say so and keep it out of the assertion explicitly with a comment.
- Do not claim WCAG conformance; report what was tested.
