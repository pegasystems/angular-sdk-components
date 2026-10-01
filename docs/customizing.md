# Customizing

Three levels, from least to most invasive. Pick the lowest one that does the job; it keeps upgrades easy.

## 1. Configuration and theming

- Settings: [configuration.md](configuration.md).
- Look and feel: [theming.md](theming.md) (Material 3 tokens, dark theme).

## Overriding a component

Replace one Pega-provided component with your own implementation without editing the original.

1. Create your component (copy the original from `packages/angular-sdk-components/src/lib/_components/` as a starting point, or scaffold one, see below).
2. Register it in `packages/angular-sdk-components/src/sdk-local-component-map.ts`:

   ```ts
   import { MyTextComponent } from './lib/_components/field/my-text/my-text.component';

   const localSdkComponentMap = {
     Text: MyTextComponent
     /* map end - DO NOT REMOVE */
   };
   ```

   Entries in the local map win over the Pega-provided map, so `Text` now renders `MyTextComponent` everywhere.
3. Rules for the replacement: field components extend `FieldBase`, receive `pConn$`/`formGroup$` inputs, and render children through `<component-mapper>` (see [architecture.md](architecture.md)).

The `@pega/angular-sdk-overrides` npm package contains ready-to-edit copies of every component for projects that consume the published packages instead of this repository.

## Adding a component

```bash
node scripts/new-component.js <field|template|widget|infra|designSystemExtension> <kebab-name> <PegaComponentName>
# example
node scripts/new-component.js field star-rating StarRating
```

It creates the component (`.ts`, `.html`, `.scss`, `.spec.ts`) following the repository conventions and registers it in `public-api.ts` and `sdk-pega-component-map.ts`. Then:

```bash
npm run fix                                          # format
npm run build-angular-sdk-components && npx api-extractor run --local   # refresh the public API report
node scripts/generate-component-catalog.js                              # refresh the component catalogue
```

## Editing a component in place

Allowed and supported. Keep these in mind:

- Field value propagation, display-mode delegation and `<component-mapper>` usage are described in `AGENTS.md` and `.github/instructions/components.instructions.md`.
- Run `npx ng test angular-sdk-components --watch=false` and the relevant parts of the Playwright suite.
- `node scripts/check-implicit-any.js` guards against new implicit-`any` errors; `npx api-extractor run` flags public API changes.

## Catalogue

Every component name that Pega can render and the Angular class that implements it: [components.md](components.md).
