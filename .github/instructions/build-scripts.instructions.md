---
applyTo: "scripts/**,angular.json,tsconfig*.json,packages/angular-sdk-components/ng-package.json"
description: "Use when modifying build scripts, Angular workspace config, or TypeScript config. Covers build pipeline flow, script purposes, and packaging."
---
# Build Scripts

Node.js automation scripts for building and packaging the Angular SDK.

## Scripts Overview

| Script | When Called | Purpose |
|--------|------------|---------|
| `build-overrides.js` | `build-overrides` | Generates the `@pega/angular-sdk-overrides` package by copying components from `_components/` and rewriting relative imports to `@pega/angular-sdk-components` |
| `compress-with-assets.mjs` | `compress-angularsdk` (prod build) | Brotli + gzip compresses all JS, CSS, HTML files in `dist/` |
| `copy-map.js` | `build-angular-sdk-components` | Copies `sdk-local-component-map.ts` from package source to `dist/angular-sdk-components/` |
| `copy-npm-assets-to-components.js` | `build-angular-sdk-components` | Copies SECURITY.md, LICENSE, doc/ to `dist/angular-sdk-components/` |
| `copy-npm-assets-to-overrides.js` | `postbuild-overrides` | Copies SECURITY.md, LICENSE to `packages/angular-sdk-overrides/` |
| `copy-file.js` | — | Generic file copy utility used by other scripts |
| `extra-webpack.config.js` | Angular CLI build (via `@angular-builders/custom-webpack`) | Copies OAuth `auth.html` and `authDone.js` from `@pega/auth` into `dist/` |
| `update-dependencies.js` | `create_and_install_sdk_packages` | Builds both packages, creates `.tgz` files, and installs them into the `angular-sdk` consumer repo |
| `playwright-message.js` | `pretest` (before E2E) | Prints "Running in headless mode" info message |

## Build Pipeline Flow

### `npm run build-angular-sdk-components` (Library package build)
```
1. ng build angular-sdk-components
   → ng-packagr reads ng-package.json
   → entry file: src/public-api.ts
   → output: dist/angular-sdk-components/
2. node scripts/copy-map.js
   → copies sdk-local-component-map.ts to dist/
3. node scripts/copy-npm-assets-to-components.js
   → copies SECURITY.md, LICENSE, doc/ to dist/
```

### `npm run build:dev` (Development app build)
```
parallel (run-p):
  - lint (eslint + prettier)
  - build-angularsdk:
      1. shx rm -rf ./dist
      2. ng build --configuration development angular-test-app
      3. copy-index → copies index.html to portal.html, fullportal.html,
         embedded.html, mashup.html, simpleportal.html
      4. make-mashup-dir → creates dist/constellation/prerequisite/
         and dist/constellation/assets/icons/
```

### `npm run build:prod` (Production app build)
```
parallel (run-p):
  - lint (eslint + prettier)
  - prod-build-angularsdk:
      1. shx rm -rf ./dist
      2. ng build --configuration production angular-test-app
      3. copy-index → copies index.html to route-specific HTML files
      4. make-mashup-dir → creates mashup directory structure
      5. compress-angularsdk → brotli + gzip all JS/CSS/HTML in dist/
```

### `npm run build-overrides` (Override package build)
```
prebuild-overrides:
  1. shx rm -rf ./packages/angular-sdk-overrides/lib
  2. shx cp -r ./packages/angular-sdk-components/src/lib/_components
     → packages/angular-sdk-overrides/lib

build-overrides:
  3. node scripts/build-overrides.js
     → recursively processes all .ts files in overrides/lib/
     → rewrites relative imports (../) to '@pega/angular-sdk-components'

postbuild-overrides:
  4. node scripts/copy-npm-assets-to-overrides.js
     → copies SECURITY.md, LICENSE
```

### `npm run build-sdk` (TypeScript compilation)
```
prebuild-sdk:
  1. delete-tsbuildinfo → removes stale .tsbuildinfo files
  2. clear-lib → rm -rf projects/angular-test-app/lib
  3. clear-overrides → rm -rf packages/angular-sdk-overrides/lib

build-sdk:
  4. ngc -p tsconfig.build.json → Angular compiler (TypeScript + templates)
```

### `npm run create_and_install_sdk_packages` (Cross-repo install)
```
1. Prompts for angular-sdk project path
2. Builds angular-sdk-components (ng build)
3. Creates .tgz via npm pack
4. Copies .tgz to angular-sdk project
5. Installs it via npm install <tgz>
6. Repeats for angular-sdk-overrides
```

## build-overrides.js Details

This script makes the overrides package consumable as a separate npm package:
1. Components are already copied from `src/lib/_components/` into `packages/angular-sdk-overrides/lib/` (by `prebuild-overrides`)
2. The script recursively scans all `.ts` files in the overrides directory
3. For each file, it finds `import` statements with relative paths (`../`)
4. Rewrites those paths to `@pega/angular-sdk-components` so the overrides package depends on the published SDK package rather than relative file paths

Example transform:
```typescript
// Before (relative path in source)
import { FieldBase } from '../../field.base';
// After (package reference in overrides)
import { FieldBase } from '@pega/angular-sdk-components';
```

## Angular-Specific Build Details

### ng-packagr (Library builds)
The component library uses **ng-packagr** (not Webpack) for building:
- Config: `packages/angular-sdk-components/ng-package.json`
- Entry point: `src/public-api.ts` — all public exports must be listed here
- Output: `dist/angular-sdk-components/` (FESM bundles + typings)
- Builder: `@angular-devkit/build-angular:ng-packagr` (configured in `angular.json`)

### Angular CLI (App builds)
The test app uses Angular CLI with `@angular-builders/custom-webpack`:
- Extends standard Angular build with `extra-webpack.config.js`
- The custom webpack config only adds `CopyWebpackPlugin` for OAuth auth files
- Dev server: `ng serve --port 3500`
- Two Angular projects in workspace: `angular-sdk-components` (library) and `angular-test-app` (application)

### Key differences from the React build
| Concern | React | Angular |
|---------|-------|---------|
| Library bundler | TypeScript compiler (`tsc`) | ng-packagr (FESM bundles) |
| App bundler | Webpack | Angular CLI (esbuild/webpack) |
| Export generation | `build-exports.js` auto-generates | Manual — `public-api.ts` must be edited |
| Component map transform | `edit-pega-components-map-in-lib.js` | Not needed (ng-packagr handles re-exports) |

## Key Points

- Scripts are Node.js (CommonJS, `require`) — not TypeScript (except `compress-with-assets.mjs` which is ESM)
- `shx` is used in npm scripts for cross-platform shell commands (cp, rm, mkdir)
- The override build copies source `.ts` files, not compiled output — customers modify TypeScript directly
- Do NOT edit files in `dist/` manually — they are regenerated by builds
- `public-api.ts` is the sole entry point for the library — if a component isn't exported there, it won't be in the package
- `angular.json` defines both projects — changes to build config go there, not in scripts
- The `copy-index` step creates route-specific HTML files so the Angular router works when accessed directly (e.g., `/portal`, `/embedded`)
