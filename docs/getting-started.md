# Getting started

Goal: from a fresh checkout to a running SDK app against your Pega Infinity server.

## 1. Prerequisites

- Node.js 24+ and npm.
- A Pega Infinity server with an OAuth 2.0 client registration for the SDK (see the [Constellation SDK docs](https://docs.pega.com/bundle/constellation-sdk/page/constellation-sdks/sdks/constellation-sdks.html)) and the application you want to render.

## 2. Install

```bash
git clone https://github.com/pegasystems/angular-sdk-components.git
cd angular-sdk-components
npm ci
```

## 3. Configure

Edit `sdk-config.json`, **or** keep the file untouched and use environment variables (recommended for teams and CI; nothing environment-specific or secret gets committed):

```bash
export SDK_INFINITY_REST_SERVER_URL=https://my-pega.example.com/prweb
export SDK_PORTAL_CLIENT_ID=<oauth client id>
node scripts/configure-sdk.js        # writes the values into sdk-config.json
```

At minimum set `SDK_INFINITY_REST_SERVER_URL` and `SDK_PORTAL_CLIENT_ID`. All settings are described in [configuration.md](configuration.md).

## 4. Run

```bash
npm run start-dev            # http://localhost:3500
npm run start-dev-https      # with the bundled dev certificate in keys/
```

Entry pages: `/portal` (full portal), `/embedded` (mashup / embedded), `/fullportal`, `/simpleportal`.

## 5. Make it yours

- Change a component: edit it under `packages/angular-sdk-components/src/lib/_components/`.
- Add a component: `node scripts/new-component.js field star-rating StarRating` (see [customizing.md](customizing.md)).
- Override a Pega-provided component without editing the originals: [customizing.md](customizing.md#overriding-a-component).

## 6. Verify and ship

```bash
npm run lint
npx ng test angular-sdk-components --watch=false            # no Pega server needed
npm run prod-build-angularsdk
```

Automate this in any CI system with the steps in [ci-cd.md](ci-cd.md).

## Where to go next

| I want to... | Read |
| --- | --- |
| understand how it works | [architecture.md](architecture.md) |
| configure for dev/test/prod | [configuration.md](configuration.md) |
| set up CI/CD and E2E | [ci-cd.md](ci-cd.md) |
| customize or add components | [customizing.md](customizing.md) |
| write tests | [testing.md](testing.md) |
| theme the app | [theming.md](theming.md) |
| fix a problem | [troubleshooting.md](troubleshooting.md) |
