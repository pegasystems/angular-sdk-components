---
description: Add a new Constellation field component end to end
---

Create a new field component named `${input:kebabName:star-rating}` mapped to the Pega component `${input:pegaName:StarRating}`.

1. Run `node scripts/new-component.js field ${input:kebabName} ${input:pegaName}`.
2. Implement `updateSelf()` to read the config props you need (check `node_modules/@pega/pcore-pconnect-typedefs` for the property names), the editable template with Angular Material, display-mode delegation and value propagation with `handleEvent`.
3. Extend the generated spec: label rendering, a store-driven update, and `getA11yViolations`.
4. Run `node scripts/generate-component-catalog.js`, `npm run build-angular-sdk-components && npx api-extractor run --local`, then `node scripts/verify.js`.
5. Summarise the change, and state that E2E was not run unless it was.
