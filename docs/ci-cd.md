# CI/CD

Everything a pipeline needs is exposed as an npm script and is configured through environment variables, so the same repository builds for every environment and no secret is committed.

## The pipeline in four steps

| Step | Command | Notes |
| --- | --- | --- |
| Install | `npm ci --ignore-scripts` | Deterministic; `--ignore-scripts` skips the git-hook installer, which is not needed in CI. |
| Quality | `npm run lint` and `npx ng test angular-sdk-components --watch=false` | Unit tests need no Pega server. |
| Configure | `node scripts/configure-sdk.js` | Applies `SDK_*` variables ([configuration.md](configuration.md)). |
| Build | `npm run prod-build-angularsdk` | Output in `dist/` (brotli/gzip compressed). |

Optional: `npm test` (Playwright) against a deployed environment.

## Using any CI system

Nothing in the pipeline is tied to a specific CI product. In GitHub Actions, Azure DevOps, GitLab, Jenkins or anything else: run the commands from the table above on a Node 24 agent (x64 or arm64; this repository's own workflows run on GitHub-hosted `ubuntu-24.04-arm` runners, except `copilot-setup-steps`, which stays on `ubuntu-latest`), pass the `SDK_*` values as environment variables (secrets masked: `SDK_MASHUP_PASSWORD`), and publish `dist/` as the build artifact. For E2E set `CI=true` so Playwright writes `test-results/junit.xml` (for your system's test-report import) and `tests/playwright-report` (HTML report), and use the Playwright container image matching the version in `package.json` or `npx playwright install --with-deps chromium` for browsers.

## Build once, deploy many

```bash
npm run prod-build-angularsdk                                   # once
SDK_INFINITY_REST_SERVER_URL=https://test.example.com/prweb \
  node scripts/configure-sdk.js --out dist/sdk-config.json               # per environment
```

Because `sdk-config.json` is read by the browser at runtime, you can promote the same `dist/` through test, staging and production. Serve `sdk-config.json` with `Cache-Control: no-store`, and register each environment's URL as an allowed redirect URI on the Pega OAuth client.

## End-to-end tests in CI

```bash
CI=true SDK_E2E_BASE_URL=https://test.example.com PW_SLOW_MO=0 npm test
```

- Needs a Pega Infinity server with the MediaCo sample application (see [testing.md](testing.md)). To test your own application, adapt the specs under `projects/angular-test-app/tests`.
- With `CI` set you get retries, a JUnit report (`test-results/junit.xml`), the HTML report (`tests/playwright-report`), and traces/videos for failures.
- Install browsers on the agent first: `npx playwright install --with-deps chromium`.

## Keeping your fork current

This repository publishes `@pega/angular-sdk-components` and `@pega/angular-sdk-overrides`. When you track upstream, watch the public API report (`etc/angular-sdk-components.api.md`) and `CHANGELOG.md` for changes that affect your customizations; the `quality` workflow in this repository shows the checks worth keeping in your own pipeline (`api:check`, `check:overrides`, `check:any`).

## Troubleshooting pipelines

See [troubleshooting.md](troubleshooting.md).
