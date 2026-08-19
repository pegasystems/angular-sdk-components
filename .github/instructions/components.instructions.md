---
applyTo: "packages/angular-sdk-components/src/lib/_components/**"
description: "Use when creating, modifying, or reviewing SDK components. Covers component structure per subtype (field, template, widget, infra, designSystemExtension), PConnFieldProps interface, Angular Material design system, and rendering rules."
---
# Components

Angular SDK component reference implementation using Angular Material. Components are organized into five subtypes, each with distinct patterns.

## Subtypes at a Glance

| Subtype | Uses AngularPConnect | Uses `pConn$` | Base Class | Pattern |
|---------|---------------------|---------------|------------|---------|
| `field/` | Always | Always | `FieldBase` | Input controls — typed Props extending `PConnFieldProps`, use `handleEvent` for value propagation |
| `template/` | Most | Always | `FormTemplateBase` or `DetailsTemplateBase` | Layout shells — render children via `<component-mapper>` |
| `widget/` | Most | Always | None (direct inject) | Self-contained data views — fetch own data via `PCore` APIs |
| `infra/` | Most | Always | None | Container/orchestration plumbing — manage case flow, assignment lifecycle |
| `designSystemExtension/` | None | Rarely | None | Presentational — receive data as `@Input()`, minimal PConnect dependency |

---

## Field Components (`field/`)

Form input controls. Every field follows the same data-flow pattern.

### Structure
```
text-input/
├── text-input.component.ts       # Component class
├── text-input.component.html     # Template
├── text-input.component.scss     # Styles
└── (optional) text-input.component.spec.ts
```

### Pattern

All field components:
1. **Extend `FieldBase`** — provides `ngOnInit`/`ngOnDestroy` lifecycle, store subscription, form control registration
2. **Declare a Props interface** extending `PConnFieldProps` (or `Omit<PConnFieldProps, 'value'>` for non-string values like Checkbox)
3. **Override `updateSelf()`** — resolves config props, updates common properties, sets component-specific values
4. **Propagate values** via `handleEvent(actionsApi, 'changeNblur', propName, value)` from `_helpers/event-util.ts`
5. **Handle display modes**: `DISPLAY_ONLY` and `STACKED_LARGE_VAL` — delegate to `<component-mapper name="FieldValueList">`
6. **Use Angular Material** modules for rendering (MatFormField, MatInput, MatSelect, MatCheckbox, etc.)
7. **Import `ComponentMapperComponent`** via `forwardRef(() => ComponentMapperComponent)` for display mode rendering

### Value propagation — two patterns

**Text-input fields** (TextInput, TextArea, Email, URL, Integer) — buffer locally, propagate on blur:
```
User types → fieldOnChange() clears error messages
  → User blurs → fieldOnBlur() calls handleEvent(actionsApi, 'changeNblur', propName, value)
```

**Selection fields** (Checkbox, Dropdown, RadioButtons, Date, Time, AutoComplete, Phone, Currency, Decimal, Percentage) — propagate immediately on change:
```
User selects → fieldOnChange() calls handleEvent(actionsApi, 'changeNblur', propName, value) directly
```

Both patterns use `handleEvent` with `'changeNblur'` which calls both `updateFieldValue` and `triggerFieldChange`. The difference is the trigger point: blur for free-text input (to avoid re-rendering on every keystroke), immediate for selection (where the value is final).

### Canonical field component structure

```typescript
import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { FieldBase } from '../field.base';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { handleEvent } from '../../../_helpers/event-util';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface TextInputProps extends PConnFieldProps {
  fieldMetadata?: any;
}

@Component({
  selector: 'app-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
            forwardRef(() => ComponentMapperComponent)]
})
export class TextInputComponent extends FieldBase {
  configProps$: TextInputProps;

  override updateSelf(): void {
    this.configProps$ = this.pConn$.resolveConfigProps(
      this.pConn$.getConfigProps()
    ) as TextInputProps;
    this.updateComponentCommonProperties(this.configProps$);
    this.value$ = this.configProps$.value;
  }

  fieldOnChange(event: any) {
    if (event.target.value.toString() !== (this.value$ ?? '').toString()) {
      this.pConn$.clearErrorMessages({ property: this.propName });
    }
  }

  fieldOnBlur(event: any) {
    if (event.target.value.toString() !== (this.value$ ?? '').toString()) {
      handleEvent(this.actionsApi, 'changeNblur', this.propName, event.target.value);
    }
  }
}
```

### FieldBase provides (inherited by all field components)
- `pConn$` and `formGroup$` `@Input()` properties
- `angularPConnect` service injection (store subscription)
- `fieldControl` — reactive form control
- `value$`, `label$`, `bVisible$`, `bRequired$`, `bReadonly$`, `bDisabled$`, `displayMode$`, `helperText`, `placeholder`, `testId`
- `updateComponentCommonProperties(configProps)` — extracts common props and updates booleans
- `actionsApi` — from `pConn$.getActionsApi()`
- `propName` — from `pConn$.getStateProps().value`

### Exceptions
- **CancelAlert** — modal dialog, not a standard field
- **Group, EmbeddedDataMulti, ScalarList** — field containers managing child fields rather than single values
- **Checkbox** — uses `Omit<PConnFieldProps, 'value'>` since value is boolean

---

## Template Components (`template/`)

Page and form layouts that render child components from the PConnect tree.

### Structure
```
one-column/
├── one-column.component.ts
├── one-column.component.html
├── one-column.component.scss
```

### Base classes

| Base | Used by | Provides |
|------|---------|----------|
| `FormTemplateBase` | Form templates (DefaultForm, OneColumn, TwoColumn, NarrowWideForm) | `pConn$`, `angularPConnectData`, `ngOnDestroy` cleanup |
| `DetailsTemplateBase` | Details templates (Details, DetailsOneColumn, DetailsTwoColumn) | Full bridge lifecycle (register, subscribe, checkAndUpdate) |

### Rendering pattern — `<component-mapper>` with children

Templates get children via `pConn$.getChildren()` and render them dynamically:

```html
<!-- one-column.component.html -->
<div *ngFor="let kid of arChildren$">
  <div *ngIf="kid.getPConnect().getRawMetadata()['type'] === 'Region'">
    <component-mapper name="Region" [props]="{ pConn$: kid.getPConnect(), formGroup$ }">
    </component-mapper>
  </div>
  <div *ngIf="kid.getPConnect().getRawMetadata()['type'] === 'View'">
    <component-mapper name="View" [props]="{ pConn$: kid.getPConnect(), formGroup$ }">
    </component-mapper>
  </div>
</div>
```

### Key patterns
- Templates check child metadata type (`Region`, `View`, `reference`, `CaseCreateStage`) to determine which component to render
- `formGroup$` is always passed down to children (form context propagation)
- Form templates typically don't subscribe to the store — they just read children and render
- Details templates subscribe to the store (via `DetailsTemplateBase`) because they need to react to prop changes (e.g., displayMode changes)

### Template categories
| Category | Examples | Store Subscription |
|----------|---------|-------------------|
| Form layouts | DefaultForm, OneColumn, TwoColumn, NarrowWideForm | No (extends `FormTemplateBase`) |
| Detail layouts | Details, DetailsOneColumn, DetailsTwoColumn | Yes (extends `DetailsTemplateBase`) |
| Page layouts | OneColumnPage, TwoColumnPage, BannerPage | Varies |
| Data templates | CaseView, ListView, SimpleTable | Yes (direct inject) |

---

## Widget Components (`widget/`)

Self-contained functional widgets that fetch and display their own data.

### Structure
```
case-history/
├── case-history.component.ts
├── case-history.component.html
├── case-history.component.scss
```

### Pattern

Widgets inject `AngularPConnectService` directly or just use `pConn$` APIs:
1. **Fetch their own data** using `PCore.getDataApiUtils().getData()` or `pConn$.getValue()`
2. **Manage loading states** with component properties (`waitingForData`, etc.)
3. **Render tables, lists, or cards** using Angular Material Table, Card, List
4. **Don't propagate values** — they display information, not capture input
5. **Declare their own Props interface** (not extending `PConnFieldProps`)

### Example (CaseHistory)
```typescript
interface CaseHistoryProps { label?: string; }

export class CaseHistoryComponent implements OnInit {
  @Input() pConn$: typeof PConnect;
  configProps$: CaseHistoryProps;
  repeatList$: MatTableDataSource<any>;

  ngOnInit(): void {
    const caseID = this.pConn$.getValue(PCore.getConstants().CASE_INFO.CASE_INFO_ID);
    PCore.getDataApiUtils().getData(dataViewName, params, context)
      .then(data => { this.repeatList$ = new MatTableDataSource(data); });
  }
}
```

### Widget components
- **CaseHistory** — case event timeline (MatTable)
- **Todo** — work queue with task lists
- **Attachment / FileUtility** — file upload/download
- **FeedContainer** — Pulse/activity feed
- **ListUtility** — general-purpose list display
- **QuickCreate** — quick case creation widget
- **AppAnnouncement** — system announcements
- **Utility** — generic utility container

---

## Infrastructure Components (`infra/`)

Container and orchestration components managing case flow, routing, and layout plumbing.

### Structure
```
infra/
├── action-buttons/         # Submit/cancel buttons
├── assignment/             # Assignment lifecycle wrapper
├── assignment-card/        # Individual assignment rendering
├── Containers/             # Sub-directory with container types:
│   ├── flow-container/     #   Case flow orchestration (CRITICAL)
│   ├── hybrid-view-container/
│   ├── modal-view-container/
│   ├── preview-view-container/
│   └── view-container/     #   Routed view container (CRITICAL)
├── dashboard-filter/       # Dashboard filter controls
├── defer-load/             # Lazy-loaded component wrapper
├── error-boundary/         # Error fallback display
├── multi-step/             # Multi-step form navigation
├── navbar/                 # Top navigation bar
├── reference/              # Reference component resolver
├── region/                 # Passthrough child renderer
├── root-container/         # Root rendering container
├── stages/                 # Case stages display
└── view/                   # View renderer with template resolution (CRITICAL)
```

### Pattern

Infra has **no single pattern** — each is specialized plumbing:
- **Region** — simplest: renders children, no store subscription
- **View** — critical orchestrator: resolves template names, evaluates visibility, sets page titles, handles form/page/modal contexts
- **FlowContainer** — manages case assignment lifecycle, renders assignment cards, handles navigation between steps
- **Containers** can be modified but require extra vigilance: changes must be backward compatible and well-tested. These affect the entire rendering pipeline.

### ⚠️ WARNING on infra/Containers and infra/view

These files contain comments like:
> WARNING: This file is part of the infrastructure component responsible for working with Redux and managing the creation and update of Redux containers and PConnect. You may override Material components within this component if needed, but do not modify any container-related logic.

Respect this boundary: modify presentation (Material components) if needed, but do NOT change container orchestration logic.

---

## Design System Extension Components (`designSystemExtension/`)

Presentational UI components with minimal or no PConnect dependency.

### Structure
```
alert-banner/
├── alert-banner.component.ts
├── alert-banner.component.html
├── alert-banner.component.scss
```

### Pattern

DSE components:
1. **Do NOT extend FieldBase or template bases** — standalone components with simple `@Input()` props
2. **Rarely use `AngularPConnectService`** — no store subscription in most cases
3. **Are consumed by other components** — fields and templates render them via `<component-mapper>`
4. **Use Angular Material** for visual rendering

### Key DSE components and their consumers
- **FieldGroup** — labeled, collapsible field container (used by Details templates)
- **AlertBanner** — alert messages with severity variants
- **Banner** — hero banner with background image
- **CaseCreateStage** — case creation stage indicator
- **MaterialCaseSummary** — case summary display
- **MaterialDetails / MaterialDetailsFields** — read-only detail rendering
- **MaterialSummaryItem / MaterialSummaryList** — summary list items
- **MaterialUtility** — utility container wrapper
- **MaterialVerticalTabs** — vertical tab layout
- **Operator** — operator info display
- **Pulse** — activity feed display
- **RichTextEditor** — TinyMCE wrapper
- **WssQuickCreate** — workspace quick-create UI

---

## Creating a New Component

### Field component
1. Create folder: `field/<component-name>/`
2. Create `<component-name>.component.ts` — extend `FieldBase`, declare Props interface extending `PConnFieldProps`
3. Create `.component.html` and `.component.scss`
4. Export from `public-api.ts`
5. Register in `sdk-pega-component-map.ts` (import + add to map object)

### Template component
1. Create folder: `template/<component-name>/`
2. Extend `FormTemplateBase` or `DetailsTemplateBase`
3. Render children via `<component-mapper>`
4. Export from `public-api.ts` + register in `sdk-pega-component-map.ts`

### Widget component
1. Create folder: `widget/<component-name>/`
2. Inject services, declare Props interface, fetch data in `ngOnInit`
3. Export from `public-api.ts` + register in `sdk-pega-component-map.ts`

### For all components
- Use `app-` selector prefix
- Import `CommonModule` + relevant Material modules directly (standalone)
- Import `ComponentMapperComponent` via `forwardRef(() => ComponentMapperComponent)` if rendering children
- Use `$` suffix for template-bound properties, `b` prefix for booleans

---

## Angular Material Design System

All components use **Angular Material** with **SCSS** for styling.

| Package | Use for |
|---------|---------|
| `@angular/material` | Core components (MatFormField, MatInput, MatButton, MatSelect, MatTable, MatToolbar, MatMenu) |
| `@angular/cdk` | CDK utilities (overlay, drag-drop, virtual scroll) |
| `@angular/material-experimental` | Experimental Material components |
| `@angular/material-moment-adapter` | Moment.js adapter for datepicker (legacy) |
| `@danielmoncada/angular-datetime-picker` | Extended datetime picker |
| `ngx-currency` | Currency input formatting |
| `mat-tel-input` | Phone number input with country codes |
| `@tinymce/tinymce-angular` | Rich text editor |

### Theming
- Light/dark modes controlled by `sdk-config.json` → `theme` property
- Applied via `document.body.classList.add(theme)` during app initialization
- SCSS files use Angular Material theming mixins

---

## Helpers (`_helpers/`)

| File | Use for |
|------|---------|
| `event-util.ts` | `handleEvent(actions, 'changeNblur', propName, value)` — field value propagation |
| `utils.ts` | `Utils` service — date formatting, boolean conversion, HTML decode, general utilities |
| `case-utils.ts` | Case-level operations and status |
| `common.ts` | Locale/timezone helpers, `getLocale()`, `getCurrentTimezone()` |
| `currency-utils.ts` | Currency formatting utilities |
| `date-format-utils.ts` | Date/time formatting across locales |
| `field-group-utils.ts` | Field group layout and rendering |
| `filter-utils.ts` | Dashboard filter operations |
| `instructions-utils.ts` | Case/assignment instructions |
| `object-utils.ts` | Object reference helpers |
| `template-utils.ts` | `getAllFields()` for template field extraction |
| `createstage-utils.ts` | Case creation stage utilities |
| `tab-utils.ts` | Tab management utilities |
| `versionHelpers.ts` | `compareSdkPCoreVersions()` — SDK/PCore version comparison |
| `formatters/` | Value formatters for display mode (currency, date, etc.) |
