---
name: sdk-accessibility
description: Build and audit accessible SDK components (WCAG 2.1/2.2 AA) - accessible names, form errors, keyboard and focus, icon buttons, status messages, Angular Material patterns, and the axe-core unit-test helper. Use when adding or changing any interactive UI.
---

# Accessibility

Target: WCAG 2.1 AA (aim for 2.2 AA). Angular Material gives most of the semantics for free; the failures come from custom markup, icon-only controls and state conveyed by colour.

## Automated check

`getA11yViolations(element)` in `packages/angular-sdk-components/src/test-setup.ts` runs axe-core (WCAG 2.0/2.1 A and AA rules). Pattern: `field-a11y.spec.ts` (host component, label in config, `formGroup$`, `await fixture.whenStable()`, `expect(await getA11yViolations(fx.nativeElement)).toEqual([])`).
Limits: the Material theme is not loaded in unit tests, so colour contrast there is not representative; keyboard order, focus management and screen-reader wording need manual review in the test app.

## Component checklist

1. **Names**: every control has an accessible name - `<mat-label>`, `aria-label`, or `aria-labelledby`. A checkbox needs its caption; icon-only buttons need `aria-label` (localized).
2. **Errors**: show validation through `<mat-error>` (`getErrorMessage()`), keep it associated with the control (Material does this inside `mat-form-field`); required fields use `[required]`.
3. **Not by colour alone**: state (error, required, selected, status) also has text or an icon with a text alternative.
4. **Keyboard**: everything operable by keyboard; no click handlers on non-interactive elements (use `button`/`mat-button`); visible focus; logical tab order; Escape closes overlays (Material dialogs/menus already do).
5. **Dynamic content**: announce important updates (errors, loading results) via `aria-live` (Material `LiveAnnouncer` from `@angular/cdk/a11y`) instead of silently changing the DOM.
6. **Headings/landmarks**: heading levels follow the page structure; templates use meaningful regions; do not skip levels.
7. **Images/icons**: decorative icons `aria-hidden="true"`; meaningful ones have text alternatives. `mat-icon` with `aria-hidden="false"` must also have an `aria-label`.
8. **Tables/lists**: use Material table/list semantics (`mat-table`, `mat-list`), header cells for column headers.
9. **Motion/zoom**: layout must work at 200% zoom and 320 px width; do not rely on fixed pixel sizes.
10. **Language**: user-facing strings are localized (`sdk-localization`), including `aria-label` text.

## Known gaps (fix when touching)

- Several `aria-label`s are hard-coded English (for example `rich-text-editor.component.html`, `field-group.component.html`).
- `FieldBase.getErrorMessage()` literal for required fields is not localized.
- Only a handful of templates carry ARIA attributes (`grep -rn "aria-" packages/angular-sdk-components/src/lib/_components --include=*.html`), so non-field components (templates, widgets) are largely unaudited.

## Audit procedure (for the `sdk-engineer` agent or manual use)

1. List the component's interactive elements from its template.
2. Run the axe helper in a spec; record violations verbatim.
3. Walk the checklist above for what axe cannot see (focus order, announcements, labels in context).
4. Fix in the template/class; add the axe assertion to the spec; rerun `node scripts/verify.js`.
5. Report: violations found/fixed, items needing manual verification in a browser with a screen reader, and anything deferred.
