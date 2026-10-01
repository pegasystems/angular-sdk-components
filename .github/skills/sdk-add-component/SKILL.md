---
name: sdk-add-component
description: Add a new Angular SDK component (field, template, widget, infra, design-system extension) - choose the kind, scaffold with the generator, implement with the right base class and rendering pattern, test, register, refresh generated artefacts and verify. Use whenever a new Pega component name must be rendered.
---

# Adding a component

## 1. Pick the kind

| Kind                    | Use when                                | Base/pattern                                                            | Folder                                      |
| ----------------------- | --------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------- |
| `field`                 | one input bound to a property           | `FieldBase`, props extend `PConnFieldProps`                             | `_components/field/<name>/`                 |
| `template`              | layout that renders child views/regions | `FormTemplateBase` (forms) or `DetailsTemplateBase` (read-only details) | `_components/template/<name>/`              |
| `widget`                | fetches and shows its own data          | plain component + `@Input() pConn$`                                     | `_components/widget/<name>/`                |
| `infra`                 | container/orchestration plumbing        | specialised, high risk                                                  | `_components/infra/<name>/`                 |
| `designSystemExtension` | presentational, inputs only             | plain standalone component                                              | `_components/designSystemExtension/<name>/` |

Before creating anything, search `docs/components.md` for an existing implementation of the Pega component name; extending an existing component beats adding a duplicate.

## 2. Scaffold

```bash
npm run new:component -- <kind> <kebab-name> <PegaComponentName>
# e.g. npm run new:component -- field star-rating StarRating
```

Creates `.ts/.html/.scss/.spec.ts`, exports it from `packages/angular-sdk-components/src/public-api.ts`, imports it and adds `PegaComponentName: ClassName` to `src/lib/_bridge/helpers/sdk-pega-component-map.ts`. Never register by hand-editing only one file. The generator emits an OnPush field skeleton for `field` and a generic bridge-registered skeleton for the other kinds; rebase templates onto `FormTemplateBase`/`DetailsTemplateBase`.

Naming: kebab-case folder/file, class `<Pascal>Component`, selector `app-<kebab>`, Pega map key = the exact component name Pega sends (case-sensitive).

## 3. Implement by kind

### Field

```ts
interface StarRatingProps extends PConnFieldProps {
  max?: number;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush, // only if all state changes are synchronous
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
  imports: [ReactiveFormsModule, MatFormFieldModule, forwardRef(() => ComponentMapperComponent)]
})
export class StarRatingComponent extends FieldBase {
  configProps$: StarRatingProps;

  override updateSelf(): void {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as StarRatingProps;
    this.updateComponentCommonProperties(this.configProps$); // label, required, readOnly, visibility, helper text, validation
    this.value$ = this.configProps$.value;
  }

  onSelect(value: number) {
    // selection-style control: propagate immediately
    handleEvent(this.actionsApi, 'changeNblur', this.propName, value);
  }
}
```

Template branches: `@if (displayMode$)` -> `<component-mapper name="FieldValueList" [props]="{ label$, value$, displayMode$ }">`; `@else if (!bReadonly$ && bHasForm$)` -> editable control inside `<div [formGroup]="formGroup$">`, `[formControl]="fieldControl"`, `[attr.data-test-id]="testId"`, hint and `mat-error` with `getErrorMessage()`; final fallback renders read-only through `component-mapper`.
Free-text controls buffer and propagate on blur; clear error messages on change with `this.pConn$.clearErrorMessages({ property: this.propName })`.

### Template

Form layouts extend `FormTemplateBase`; details layouts extend `DetailsTemplateBase` (needs `Injector` constructor param). Render children:

```html
@for (kid of arChildren$; track kid) {
<component-mapper name="Region" [props]="{ pConn$: kid.getPConnect(), formGroup$ }"></component-mapper>
}
```

Check `kid.getPConnect().getRawMetadata().type` for `Region`/`View`/`reference` etc. Always pass `formGroup$`.

### Widget

`@Input() pConn$`, own props interface, data through `PCore.getDataApiUtils()`/`pConn$.getValue()`, `ChangeDetectorRef.markForCheck()` after async assignment if OnPush, Material table/list/card. Display only.

### Infra

Read `.github/instructions/components.instructions.md` (warning section). Only presentation may change in `infra/Containers` and `infra/view`.

### Design-system extension

Plain `@Input()`/`@Output()` component; no `FieldBase`, no store. Consumed through `<component-mapper>` by other components.

## 4. Mandatory details

- Import `ComponentMapperComponent` with `forwardRef(() => ComponentMapperComponent)` whenever the template uses `<component-mapper>`.
- Localize literals (`pConn$.getLocalizedValue(text, localePath, localeRuleKey)`).
- Accessible names for every control; no colour-only state; Material tokens for colours.
- Teardown for any subscription you add (`takeUntilDestroyed`).
- `$` suffix for template-bound props, `b` prefix for booleans.
- Discover PConnect API in `node_modules/@pega/pcore-pconnect-typedefs` (skill `sdk-pconnect-api`).

## 5. Tests (see skill `sdk-write-unit-tests`)

At least: creation, label/value rendering, store-driven update, value propagation, display-only branch, a11y (fields). Replace the generated placeholder spec.

## 6. Refresh generated artefacts

```bash
npm run docs:components
npm run build-angular-sdk-components && npm run api:update   # review: additions only
```

## 7. Verify

```bash
npm run verify -- --quick
npm run verify
```

Playwright E2E (Pega Infinity needed) is separate; state whether it ran.

## Checklist

- [ ] right kind and base class
- [ ] exported in `public-api.ts` and mapped in `sdk-pega-component-map.ts` (generator did it)
- [ ] spec replaces placeholder; fails if behaviour breaks
- [ ] a11y + localization + teardown handled
- [ ] change detection choice justified (OnPush only if synchronous)
- [ ] `docs/components.md` and `etc/angular-sdk-components.api.md` regenerated and reviewed
- [ ] `npm run verify` green; not-verified list written
