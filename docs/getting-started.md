# Getting started

Goal: from a fresh checkout to a running SDK app against your Pega Infinity server.

## 1. Prerequisites

- Node.js 24+ (`nvm use` reads `.nvmrc`) and npm.
- A Pega Infinity server with an OAuth 2.0 client registration for the SDK (see the [Constellation SDK docs](https://docs.pega.com/bundle/constellation-sdk/page/constellation-sdks/sdks/constellation-sdks.html)) and the application you want to render.
- Prefer zero setup? Open the repo in GitHub Codespaces or a Dev Container (`.devcontainer/`); dependencies and Playwright browsers are installed for you.

## 2. Install

```bash
git clone https://github.com/pegasystems/angular-sdk-components.git
cd angular-sdk-components
npm ci
```

## 3. Configure

Edit `sdk-config.json`, **or** keep the file untouched and use environment variables (recommended for teams and CI; nothing environment-specific or secret gets committed):

```bash
cp .env.example .env     # fill in the values
set -a; source .env; set +a
npm run configure        # writes the values into sdk-config.json
```

At minimum set `SDK_INFINITY_REST_SERVER_URL` and `SDK_PORTAL_CLIENT_ID`. All settings are described in [configuration.md](configuration.md).

## 4. Check your environment

```bash
npm run doctor
```

It verifies the Node version, installed dependencies, `sdk-config.json`, HTTPS keys, port 3500 and that your Infinity server is reachable, and tells you how to fix anything that is wrong. Use `npm run doctor -- --offline` to skip the network probe.

## 5. Run

```bash
npm run start-dev            # http://localhost:3500
npm run start-dev-https      # with the bundled dev certificate in keys/
```

Entry pages: `/portal` (full portal), `/embedded` (mashup / embedded), `/fullportal`, `/simpleportal`.

## 6. Make it yours

- Change a component: edit it under `packages/angular-sdk-components/src/lib/_components/`.
- Add a component: `npm run new:component -- field star-rating StarRating` (see [customizing.md](customizing.md)).
- Override a Pega-provided component without editing the originals: [customizing.md](customizing.md#overriding-a-component).

## 7. Verify and ship

```bash
npm run lint
npm run test:unit            # no Pega server needed
npm run prod-build-angularsdk
```

Automate this with the pipeline templates in [ci-cd.md](ci-cd.md), or build a container image (`docker build -t my-sdk .`).

## Where to go next

| I want to... | Read |
| --- | --- |
| understand how it works | [architecture.md](architecture.md) |
| configure for dev/test/prod | [configuration.md](configuration.md) |
| set up CI/CD, Docker, E2E | [ci-cd.md](ci-cd.md) |
| customize or add components | [customizing.md](customizing.md) |
| write tests | [testing.md](testing.md) |
| theme the app | [theming.md](theming.md) |
| fix a problem | [troubleshooting.md](troubleshooting.md) |
