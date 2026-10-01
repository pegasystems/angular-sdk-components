# Troubleshooting

Pega's [Troubleshooting Constellation SDKs](https://docs.pega.com/bundle/constellation-sdk/page/constellation-sdks/sdks/troubleshooting-constellation-sdks.html) page covers platform-side issues.

## Setup

| Symptom | Likely cause and fix |
| --- | --- |
| `engines` / syntax errors on install or build | Node older than 24; install Node 24 or newer. |
| "node_modules is missing" or missing `@angular/*` packages | Run `npm ci`. |
| `npm ci` cannot reach packages | `.npmrc` points at the public npm registry. Behind a corporate proxy/registry, override it in your user-level `.npmrc` or CI environment, and prefer `npm ci` over `npm install`. |
| Port 3500 already in use | Stop the other process or run `npx ng serve --port 3501`. Update `SDK_E2E_BASE_URL` accordingly. |
| Browser warns about the HTTPS certificate | Expected with the bundled dev certificate in `keys/`; trust it locally or use `start-dev` over HTTP. |

## Configuration and login

| Symptom | Likely cause and fix |
| --- | --- |
| `node scripts/configure-sdk.js` fails validation | The message names the setting and the environment variable that sets it. |
| Blank page or network error on load | `serverConfig.infinityRestServerUrl` is wrong or unreachable (VPN, trailing slash, certificate). |
| Login redirect loop / `redirect_uri` error | The URL you open (including port and path) must be registered as a redirect URI on the Pega OAuth 2.0 client. |
| CORS errors | Add your app origin to the Infinity CORS configuration. |
| Embedded/mashup login fails | `mashupClientId`, `mashupUserIdentifier` and the Base64 `mashupPassword` must be set (`SDK_MASHUP_PASSWORD` is encoded for you). |
| Config changes have no effect on a deployed site/CDN | `sdk-config.json` is cached. Serve it with `Cache-Control: no-store`. |

## Build and CI

| Symptom | Likely cause and fix |
| --- | --- |
| `check:overrides` fails with "Cannot find module '@pega/angular-sdk-components'" | The library has not been built (`npm run build-angular-sdk-components`), or `npm run build` replaced `dist/`. |
| `api:check` fails | The public API changed. If intended: `npm run build-angular-sdk-components && npx api-extractor run --local` and commit `etc/angular-sdk-components.api.md`. |
| `check:any` fails | A file got more implicit-`any` errors than its baseline. Add types; if you fixed errors, `node scripts/check-implicit-any.js --update`. |
| `docs:components:check` fails | `node scripts/generate-component-catalog.js` and commit. |
| Production build exceeds a style budget | See the budgets in `angular.json`; keep component styles small. |
| Playwright can't find browsers on the agent | `npx playwright install --with-deps chromium`, or use the Playwright container image (matching the version in `package.json`) as the CI agent. |
| E2E tests time out in CI | Check `SDK_E2E_BASE_URL` is reachable from the agent and the test users exist in the target app. |

## Still stuck?

Open an issue with your Node/npm versions and the failing command's log (remove secrets first).
