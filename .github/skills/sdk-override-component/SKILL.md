---
name: sdk-override-component
description: Help an SDK consumer customise or replace a Pega-provided component without forking logic - choose between configuration, theming, local component map override, editing in place, and the overrides npm package; implement the override safely.
---

# Overriding or customising a component

Pick the least invasive option that satisfies the requirement.

| Need                                         | Option                                                                                      |
| -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| change colours/typography/dark mode          | theming (`docs/theming.md`): Material tokens in `themes.scss`, `theme` in `sdk-config.json` |
| change behaviour flags/URLs/portal           | configuration (`docs/configuration.md`, `node scripts/configure-sdk.js`)                                |
| replace what one Pega component renders      | **local component map override** (below)                                                    |
| change shared behaviour of many components   | edit the source component(s) in place (repo checkout) and keep the public API stable        |
| consumer of the npm packages (not this repo) | copy from `@pega/angular-sdk-overrides` and register in the consumer's local map            |

## Local map override (this repository)

1. Locate the original: `docs/components.md` (Pega name -> class -> path).
2. Create your component by copying the original folder (or subclass it: `class MyText extends TextComponent`); change the selector to a unique `app-...` value; keep the same `@Input()`s (`pConn$`, `formGroup$` for fields) and base class so the bridge can drive it.
3. Register in `packages/angular-sdk-components/src/sdk-local-component-map.ts` (keep the `/* import end */` and `/* map end */` markers):
   ```ts
   import { MyTextComponent } from './lib/_components/field/my-text/my-text.component';
   const localSdkComponentMap = {
     Text: MyTextComponent
     /* map end - DO NOT REMOVE */
   };
   ```
   Local entries beat the Pega-provided map.
4. Keep the contract: fields extend `FieldBase`, propagate via `handleEvent`, render display-only through `FieldValueList`, import `ComponentMapperComponent` with `forwardRef`.
5. Test it (`createMockPConn()`), then `node scripts/verify.js`.

Note: the base repository's own development never edits `sdk-local-component-map.ts`; it is for consumers' customisations.

## Keeping upgrades easy

- Prefer subclassing and overriding the smallest method (`updateSelf`, a template fragment) over copying whole components.
- Record why an override exists (comment above the map entry).
- When upgrading the SDK, diff `etc/angular-sdk-components.api.md` and the original component against your copy; rerun `npx ngc -p tsconfig.overrides-check.json` if you use the overrides package.
