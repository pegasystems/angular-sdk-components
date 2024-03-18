### Angular SDK - Release Announcement - v23.1.10 (15 March 2024)

This release - **SDK-A v23.1.10** - is **only compatible with Pega Infinity 23**. This release is related to the [**release/23.1.10** branch of the Angular SDK repository](https://github.com/pegasystems/angular-sdk/tree/release/23.1.10).
<br>

This is the initial release of the Angular SDK Components packages: [**@pega/angular-sdk-components**](https://www.npmjs.com/package/@pega/angular-sdk-components) and [**@pega/angular-sdk-overrides**](https://www.npmjs.com/package/@pega/angular-sdk-overrides).This release contains all of the bridge and component code that was in the original packaging of the Angular SDK (which is now available in the Angular SDK's release/8.8.10 branch).

These packages support use with **Pega Infinity&trade; 23** and used in conjunction with the [**Pega Constellation Angular SDK**](https://community.pega.com/marketplace/components/angular-sdk).

* [**angular-sdk-components**](https://www.npmjs.com/package/@pega/angular-sdk-components) <br />
This package contains the run-time (compiled) code for the Pega-provided **bridge**
to the [**ConstellationJS Engine**](https://www.npmjs.com/package/@pega/constellationjs) and the **DX components**. The DX Components are a reference implementation that use the [Angular Material](https://v16.material.angular.io/) design system.

* [**angular-sdk-overrides**](https://www.npmjs.com/package/@pega/angular-sdk-overrides) <br />
This package contains the source (uncompiled) code for the **DX Components**. This code is used as the starting point for any components that a Angular SDK user chooses to override.
Refer to the [Constellation SDKs Documentation](https://docs.pega.com/bundle/constellation-sdk/page/constellation-sdks/sdks/constellation-sdks.html) for more information about overriding components.


The SDK-A v23.1.10 release allow Angular SDK users to to take advantage of the latest
[SDK enhancements and fixes noted in **What's New in the SDK?**](https://docs.pega.com/bundle/constellation-sdk/page/constellation-sdks/sdks/angular-sdk-updates.html) including:

* Moved components to npm modules to support selective, incremental override of sample SDK components to the customer’s alternate design system.
The following npm package is supported as part of this:
  [@pega/angular-sdk-components](https://www.npmjs.com/package/@pega/angular-sdk-components): v23.1.10
* Integrated with Constellation DX Component Builder to enable creating custom components and overriding Pega components using the SDK. For more information, see Using the integrated DX component builder.
The following npm packages are supported as part of this:
  [@pega/dx-component-builder-sdk](https://www.npmjs.com/package/@pega/dx-component-builder-sdk): v23.1.12
  [@pega/angular-sdk-overrides](https://www.npmjs.com/package/@pega/angular-sdk-overrides): v23.1.10
* Added the use of **TypeScript typedefs** (from @pega/pcore-pconnect-typedefs) to SDK components. For more information, see [Using type definitions - update link when published](https://pega-dev.zoominsoftware.io/bundle/constellation-sdk/page/constellation-sdks/sdks/type-definitions-constellation-sdks.html)
* Added additional functionality including RichTextEditor and Dynamic Tabs components, many-to-many data reference support, Confirmation template, Sub Tabs template, Save For Later, and WSS portal.
* Added Constellation design system support for cosmos 4 (for custom Constellation components).
* Enhanced security including token storage and item obfuscation support.
* Bug fixes.
* The full set of merged PRs can be found in the [angular-sdk-components GitHub repository list of merged PRs](https://github.com/pegasystems/angular-sdk-components/pulls?q=is%3Apr+is%3Amerged+base%3Amaster+).
* Added Lint support to improve code quality and Prettier support for code formatting.
* Provided Storybook integration to mock and test components in isolation. For more information, see [Storybook integration](https://docs.pega.com/bundle/constellation-sdk/page/constellation-sdks/sdks/using-dx-component-builder.html).
* Added component management capabilities, such as build, publish, and delete components. For more information, see [Managing components](https://docs.pega.com/bundle/constellation-sdk/page/constellation-sdks/sdks/managing-components.html).
* Updated authentication and authorization module. For more information, see [Authentication and authorization](https://docs.pega.com/bundle/constellation-sdk/page/constellation-sdks/sdks/authentication-authorization.html).
* Updated src directory structure to house component code based on component category (custom and override) and component type (field, template, and widget). For more information, see [Updated files](https://docs.pega.com/bundle/constellation-sdk/page/constellation-sdks/sdks/using-dx-component-builder.html#d13507e116).
* Updated sdk-config.json file with component configuration attributes, such as dxcbConfig. For more information, see [dxcbConfig](https://docs.pega.com/bundle/constellation-sdk/page/constellation-sdks/sdks/configuring-sdk-config-json.html#d5260e960).
* Added the lint settings in the DX Component Builder to enable publishing custom components with lint errors or warnings. You can modify the lint setting (lintAction) in the **sdk-config.json** file from "show" to "block" to disable publishing components with lint errors or warnings.
* Added support for multiple attachments.
* Users can now perform CRUD operations using the modal dialog. Previously, you could perform CRUD operations inline only.
* Added localization support. You can now implement localization in your custom and overridden SDK components.

<hr />

#### **Pega Constellation SDKs available**
* **Angular SDK**:
  * Marketplace: https://community.pega.com/marketplace/components/angular-sdk
  * Github: https://github.com/pegasystems/angular-sdk

<br />

* **React SDK**:
  * Marketplace: https://community.pega.com/marketplace/components/react-sdk
  * Github: https://github.com/pegasystems/react-sdk

<br />

* **Web Components SDK**:
  * Marketplace: https://community.pega.com/marketplace/components/web-components-sdk
  * Github: https://github.com/pegasystems/web-components-sdk
