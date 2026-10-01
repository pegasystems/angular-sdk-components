---
name: sdk-localization
description: Make SDK component text localizable - use localizeText (PConnect localization service) and PCore locale utils correctly, choose locale categories, handle labels from config versus literals, dates/numbers, and test localized output. Use whenever a component renders user-facing text.
---

# Localization

User-facing text must come from one of two places: **Pega-authored values** (labels, placeholders, messages in config props, already localized by the engine) or **SDK literals** (button captions, headings, empty-state messages) that the component must localize itself.

## APIs in use in this repo

| API                                                                                   | Use                                                                                                                                                         |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `localizeText(this.pConn$, text, localePath, localeRuleKey)` from `_helpers/localization.ts` | localize a literal through the component's PConnect context (see `dropdown.component.ts`, `case-history.component.ts`: `getLocalizedValue('Date', '', '')`) |
| `PCore.getLocaleUtils().getLocaleValue(text, category, ruleKey)`                      | localize with an explicit locale category/rule key (see `operator.component.ts`, `material-case-summary.component.ts`, `navbar.component.ts`)               |
| `PCore.getLocaleUtils().getPortalLocaleReference()`                                   | locale reference of the portal (navbar page names)                                                                                                          |
| `PCore.getEnvironmentInfo().getLocale()/getTimeZone()`                                | formatting locale and time zone (`Utils.timezone`, `_helpers/common.ts`)                                                                                    |
| `_helpers/formatters/`, `_helpers/date-format-utils.ts`, `_helpers/currency-utils.ts` | locale-aware date/number/currency formatting; do not hand-format                                                                                            |

Check exact signatures in `node_modules/@pega/pcore-pconnect-typedefs` (see skill `sdk-pconnect-api`).

## Rules
0. `pConn$.getLocalizedValue` is deprecated in PConnect; `localizeText` reproduces its lookup (rule or component scope, optional path, fallback to the default scope) with the localization service.

1. Never hard-code English in templates or classes when Pega can translate it: wrap it (`localizedVal('Add', category)`) and bind the result.
2. Values from `resolveConfigProps` (labels, placeholders, helper text, validation messages) are already localized; do not localize them again.
3. Pick a locale category that matches an existing one when the same string exists (for example `'Operator'`, `'ModalContainer'`); keep literals identical to the English source so lookups hit.
4. Dates, numbers, currency: use the formatters/helpers with the environment locale and time zone, never `toLocaleString` with a fixed locale.
5. Display-only values are formatted before being passed to `FieldValueList` (`value$`).
6. `localizedVal` obtained as `PCore.getLocaleUtils().getLocaleValue` is evaluated at construction time in several components; in tests the PCore stub supplies an identity function.

## Known gaps (do not copy the pattern; fix when you touch the code)

- `FieldBase.getErrorMessage()` returns the literal `'You must enter a value'` for required errors.
- `rich-text-editor.component.html` has English `aria-label`s (for example `Bold`).
  Adding localization to these changes visible strings only for non-English locales; keep English output identical and add tests.

## Testing

```ts
(globalThis as any).PCore.getLocaleUtils = () => ({ getLocaleValue: (v: string, c: string) => `${c}:${v}` });
// render, then expect the DOM to contain 'Operator:Position'
pConn.getLocalizationService = () => ({ getLocalizedText: (v: string) => `[${v}]` });
```

Assert that the literal is passed through the localizer and not rendered raw.

## Checklist

- [ ] every literal localized (or knowingly engine-provided)
- [ ] category/rule key consistent with existing usage
- [ ] formatting via helpers
- [ ] test proves localizer is applied
- [ ] `CHANGELOG.md` entry if user-visible (`sdk-changelog`)
