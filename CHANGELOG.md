# [25.1.15](https://github.com/pegasystems/angular-sdk/tree/release/25.1.15) - Released: 30/10/2026

## Breaking changes

*   Upgraded the `Angular` version to 22, the `Angular Material` version to 22, and the `TypeScript` version to 6.
    * Github: [PR-647](https://github.com/pegasystems/angular-sdk-components/pull/647)
*   Upgraded `@pega/auth` to version 0.3.x.
    * Github: [PR-650](https://github.com/pegasystems/angular-sdk-components/pull/650)

## Non Breaking changes

### **Bug fixes**
*   **Fixed server-side validation messages being cleared from form fields when the field value or validation was updated.**
      * Github: [PR-648](https://github.com/pegasystems/angular-sdk-components/pull/648)
---

### **Dependencies & Infrastructure**

*   The **@angular-builders/custom-webpack**, **copy-webpack-plugin**, and **webpack** packages have been removed. The library build now uses `@angular/build`.
    * Github: [PR-647](https://github.com/pegasystems/angular-sdk-components/pull/647)
*   The following table lists the packages whose versions have been updated:

| Package | Updated version |
| :--- | :--- |
| **@angular/animations** | 22.2.3 |
| **@angular/build** | 22.2.3 |
| **@angular/cdk** | 22.2.4 |
| **@angular/cli** | 22.2.3 |
| **@angular/common** | 22.2.3 |
| **@angular/compiler** | 22.2.3 |
| **@angular/compiler-cli** | 22.2.3 |
| **@angular/core** | 22.2.3 |
| **@angular/forms** | 22.2.3 |
| **@angular/google-maps** | 22.2.4 |
| **@angular/language-service** | 22.2.3 |
| **@angular/material** | 22.2.4 |
| **@angular/material-experimental** | 22.2.4 |
| **@angular/material-moment-adapter** | 22.2.4 |
| **@angular/platform-browser** | 22.2.3 |
| **@angular/platform-browser-dynamic** | 22.2.3 |
| **@angular/router** | 22.2.3 |
| **@angular-devkit/core** | 22.2.3 |
| **@angular-eslint/eslint-plugin** | 22.6.0 |
| **@angular-eslint/eslint-plugin-template** | 22.6.0 |
| **@angular-eslint/template-parser** | 22.6.0 |
| **@danielmoncada/angular-datetime-picker** | 22.0.0 |
| **@pega/angular-sdk-components** | 25.1.15 |
| **@pega/angular-sdk-overrides** | 25.1.15 |
| **@pega/auth** | 0.3.3 |
| **ng-packagr** | 22.2.4 |
| **typescript** | 6.0.3 |
| **typescript-eslint** | 8.72.0 |

# [25.1.14](https://github.com/pegasystems/angular-sdk/tree/release/25.1.14) - Released: TBD

## Breaking changes

*   SDK components have been migrated to zoneless change detection. Components now use `ChangeDetectorRef` instead of `NgZone`, and `zone.js` has been removed from the dependencies and polyfills. Applications must use `provideZonelessChangeDetection()`.
    * Github: [PR-565](https://github.com/pegasystems/angular-sdk-components/pull/565)
*   The unused `MaterialDetails` and `MaterialDetailsFields` components have been removed from the public API.
    * Github: [PR-588](https://github.com/pegasystems/angular-sdk-components/pull/588)

## Non Breaking changes

### **Features**
*   **Dropdown placeholder now uses the authored placeholder via the native Material select, with an option to clear the selection.**
    * Github: [PR-615](https://github.com/pegasystems/angular-sdk-components/pull/615)

### **Bug fixes**
*   **Fixed currency codes not displaying for Decimal and Currency fields in Details templates.**
      * Github: [PR-506](https://github.com/pegasystems/angular-sdk-components/pull/506)
*   **Fixed an issue where FieldGroup visibility did not work correctly.**
      * Github: [PR-516](https://github.com/pegasystems/angular-sdk-components/pull/516)
*   **Fixed the issue where the Details Two Column template was not working.**
      * Github: [PR-527](https://github.com/pegasystems/angular-sdk-components/pull/527)
*   **Fixed the required validation for the DataReference Multiselect combobox, including on checkbox change.**
      * Github: [PR-526](https://github.com/pegasystems/angular-sdk-components/pull/526)
      * Github: [PR-544](https://github.com/pegasystems/angular-sdk-components/pull/544)
*   **Fixed an issue where headings were not rendered in repeating views.**
      * Github: [PR-532](https://github.com/pegasystems/angular-sdk-components/pull/532)
*   **Fixed the AutoComplete component to assign the value only after the data is fetched.**
      * Github: [PR-554](https://github.com/pegasystems/angular-sdk-components/pull/554)
*   **Fixed label display in Details templates.**
      * Github: [PR-566](https://github.com/pegasystems/angular-sdk-components/pull/566)
*   **Refactored Details templates to correctly render regions and child components.**
      * Github: [PR-583](https://github.com/pegasystems/angular-sdk-components/pull/583)
*   **Fixed DateTime component theme colors to support different themes.**
      * Github: [PR-619](https://github.com/pegasystems/angular-sdk-components/pull/619)
*   **Fixed the DateTime component defaulting to the current date and time for invalid input and added validation messages for invalid values.**
      * Github: [PR-620](https://github.com/pegasystems/angular-sdk-components/pull/620)
*   **Replaced `uuidv4` with `crypto.randomUUID` for generating unique IDs in filter utilities.**
      * Github: [PR-621](https://github.com/pegasystems/angular-sdk-components/pull/621)
*   **Fixed Dropdown labels not displaying the selected value after a lookup data page call.**
      * Github: [PR-622](https://github.com/pegasystems/angular-sdk-components/pull/622)
*   **Fixed the undefined label error in the SimpleTableManual component.**
      * Github: [PR-624](https://github.com/pegasystems/angular-sdk-components/pull/624)
---

### **Dependencies & Infrastructure**

*   The **zone.js** package has been removed.
    * Github: [PR-565](https://github.com/pegasystems/angular-sdk-components/pull/565)
*   The following table lists the packages whose versions have been updated:

| Package | Updated version |
| :--- | :--- |
| **@pega/angular-sdk-components** | 25.1.14 |
| **@pega/angular-sdk-overrides** | 25.1.14 |
