# CI/CD

Everything a pipeline needs is exposed as an npm script and is configured through environment variables, so the same repository builds for every environment and no secret is committed.

## The pipeline in five steps

| Step | Command | Notes |
| --- | --- | --- |
| Install | `npm ci --ignore-scripts` | Deterministic; `--ignore-scripts` skips the git-hook installer, which is not needed in CI. |
| Pre-flight | `npm run doctor -- --offline` | Fails fast on wrong Node version, missing dependencies or an invalid `sdk-config.json`. |
| Quality | `npm run lint` and `npm run test:unit` | Unit tests need no Pega server. |
| Configure | `npm run configure` | Applies `SDK_*` variables ([configuration.md](configuration.md)). |
| Build | `npm run prod-build-angularsdk` | Output in `dist/` (brotli/gzip compressed). |

Optional: `npm test` (Playwright) against a deployed environment, and `docker build .` for a container image.

## Ready-made templates

Copy the one for your platform from [`ci-templates/`](../ci-templates):

| Platform | File |
| --- | --- |
| GitHub Actions | `github-actions.yml` |
| Azure DevOps | `azure-pipelines.yml` |
| GitLab CI | `gitlab-ci.yml` |
| Jenkins | `Jenkinsfile` |

Each template: caches dependencies, builds, publishes `dist/` as an artifact, and runs the E2E stage only when `SDK_E2E_BASE_URL` is defined, publishing JUnit results and the HTML report. Define `SDK_INFINITY_REST_SERVER_URL`, `SDK_APP_ALIAS` and `SDK_PORTAL_CLIENT_ID` as variables and `SDK_MASHUP_PASSWORD` as a secret.

## Build once, deploy many

```bash
npm run prod-build-angularsdk                                   # once
SDK_INFINITY_REST_SERVER_URL=https://test.example.com/prweb \
  npm run configure -- --out dist/sdk-config.json               # per environment
```

Because `sdk-config.json` is read by the browser at runtime, you can promote the same `dist/` through test, staging and production.

## Docker

```bash
docker build -t my-sdk .
docker run -p 8080:8080 \
  -e SDK_INFINITY_REST_SERVER_URL=https://my-pega.example.com/prweb \
  -e SDK_PORTAL_CLIENT_ID=... -e SDK_APP_ALIAS=MediaCo my-sdk
```

- Multi-stage build; the runtime image is non-root nginx on port 8080.
- `sdk-config.json` is rendered from `SDK_*` variables every time the container starts; no rebuild is needed to change environments.
- `GET /healthz` is the liveness/readiness endpoint.
- Entry pages: `/portal`, `/embedded`, `/fullportal`, `/simpleportal`.
- Register `https://<your-host>/` as an allowed redirect URI on the Pega OAuth client.

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
