# Theming

SDK components are built on Angular Material 3 and read **system tokens** (`--mat-sys-*`) from CSS custom properties, so a theme is just a set of variables on a root element.

## How the test app does it

`projects/angular-test-app/src/themes.scss` defines a `.dark` class that overrides the palette tokens (`--mat-sys-primary`, `--mat-sys-surface`, `--mat-sys-on-surface`, `--mat-sys-error`, ...). Toggling the class on `<body>` switches themes at runtime without rebuilding.

## Rules for components

- Use Material tokens (`var(--mat-sys-primary)`, `var(--mat-sys-on-surface)`) instead of hard-coded colors so every theme works.
- App-specific tokens use the `--app-sys-*` prefix and must default to a Material token (for example `--app-sys-secondary-button-border: var(--mat-sys-primary)`).
- Never rely on color alone to convey state (errors, required fields); pair it with text or an icon.

## Creating a theme

1. Generate a Material 3 palette (Material Theme Builder or `mat.theme`).
2. Create a class (for example `.high-contrast`) that sets the full token set shown in `themes.scss`.
3. Verify contrast (WCAG 2.2 AA: 4.5:1 for text, 3:1 for UI components) in both display and edit modes.
4. Apply the class to `<body>`.

## Accessibility checks

Field components are covered by automated axe-core checks (`field-a11y.spec.ts`, helper `getA11yViolations` in `src/test-setup.ts`). The unit-test environment does not load the Material theme stylesheet, so contrast results there are not representative; review contrast for new themes in the browser.
