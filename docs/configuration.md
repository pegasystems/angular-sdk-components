# Configuration

Runtime settings live in `sdk-config.json` in the repository root. It is copied to the root of the build output (`dist/sdk-config.json`) and fetched by the browser at startup, so **it can be changed after the build without recompiling**.

## Environment variables

`node scripts/configure-sdk.js` (`node scripts/configure-sdk.js`) applies these variables to `sdk-config.json`. Unset or empty variables leave the file value untouched, so you can mix a committed base file with per-environment overrides.

| Variable | `sdk-config.json` setting | Notes |
| --- | --- | --- |
| `SDK_INFINITY_REST_SERVER_URL` | `serverConfig.infinityRestServerUrl` | Required. Full URL of the Infinity REST server, for example `https://host/prweb` (no trailing slash). |
| `SDK_PORTAL_CLIENT_ID` | `authConfig.portalClientId` | Required. OAuth 2.0 client ID for the portal use case. |
| `SDK_APP_ALIAS` | `serverConfig.appAlias` | Application alias operators will use. |
| `SDK_CONTENT_SERVER_URL` | `serverConfig.sdkContentServerUrl` | Blank means `window.location.origin`. |
| `SDK_APP_PORTAL` | `serverConfig.appPortal` | Blank means the operator's default portal. |
| `SDK_APP_MASHUP_CASE_TYPE` | `serverConfig.appMashupCaseType` | Case type for embedded/mashup. |
| `SDK_SHOW_MODALS_IN_EMBEDDED_MODE` | `serverConfig.showModalsInEmbeddedMode` | `true` or `false`. |
| `SDK_MASHUP_CLIENT_ID` | `authConfig.mashupClientId` | Mashup OAuth client ID. |
| `SDK_MASHUP_USER_IDENTIFIER` | `authConfig.mashupUserIdentifier` | |
| `SDK_MASHUP_PASSWORD` | `authConfig.mashupPassword` | **Provide plain text; it is Base64 encoded into the file.** Store it as a CI secret. |
| `SDK_AUTH_SERVICE` | `authConfig.authService` | |
| `SDK_THEME` | `theme` | For example `dark`. |

Other settings in the file (for example `excludePortals`) are documented in the [official guide](https://docs.pega.com/bundle/constellation-sdk/page/constellation-sdks/sdks/configuring-sdk-config-json.html).

## Commands

```bash
node scripts/configure-sdk.js                                   # apply env vars in place
node scripts/configure-sdk.js --out dist/sdk-config.json     # write the result to another file (the source is untouched)
node scripts/configure-sdk.js --print                        # also print the result (secrets masked)
node scripts/configure-sdk.js --check                             # validate only; exit 1 on errors, nothing written
```

## Choosing where to apply configuration

| Approach | When |
| --- | --- |
| `node scripts/configure-sdk.js` before the build | One build per environment (simple pipelines). |
| `node scripts/configure-sdk.js --out dist/sdk-config.json` after the build | Build once, deploy many: promote the same `dist/` and render the config per environment. |

## Secrets

Never commit `mashupPassword` or any credential. `sdk-config.json` is a public file served to browsers: only put values there that you would be comfortable sending to every user. Use CI secrets for `SDK_MASHUP_PASSWORD` and rotate it if it was ever committed.

## End-to-end test settings

| Variable | Purpose |
| --- | --- |
| `SDK_E2E_BASE_URL` | Deployed app the Playwright suite targets (default `http://localhost:3500`). |
| `PW_START_SERVER=1` | Let Playwright start `npm run start-prod` itself. `PW_SERVER_COMMAND` overrides the command. |
| `PW_SLOW_MO` | Milliseconds between actions (default 200 locally; use `0` in CI). |
| `PW_WORKERS` | Parallel workers (default 1 in CI). |
| `PW_JUNIT_OUTPUT` | JUnit file path in CI (default `test-results/junit.xml`). |
| `CI` | When set: JUnit + HTML + list reporters, retries, video on failure. |
