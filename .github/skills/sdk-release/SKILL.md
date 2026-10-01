---
name: sdk-release
description: Cut a release of @pega/angular-sdk-components and @pega/angular-sdk-overrides following this project's process - finalise CHANGELOG.md (skill sdk-changelog), run the version bump commit, verify, smoke-test inside angular-sdk, and publish with npm provenance through the manual publish workflow.
---

# Releasing

Packages: `@pega/angular-sdk-components` (built into `dist/angular-sdk-components`) and `@pega/angular-sdk-overrides` (`packages/angular-sdk-overrides`). They always share one version, and that version is the **angular-sdk release number** (for example `25.1.13`). Source `package.json` files carry a development placeholder (`0.26.x`) between releases; the release commit sets the real version.

Releases are driven by maintainers. Do not introduce automatic version/changelog generators.

## Steps

1. **Agree the version** with the user (for example `26.1.10`); never guess it.
2. **Changelog**: finalise the in-progress entry with the `sdk-changelog` skill (entries for every user-visible PR, Breaking/Non-breaking structure, Dependencies table, `node scripts/changelog.js release-date dd/mm/yyyy`). `node scripts/changelog.js check` must pass.
3. **Release branch and commit** (matches the existing history, for example `chore/25.1.12` with "chore: 25.1.12 version release"):
   ```bash
   git switch -c chore/<version>
   node scripts/set-version.js <version>      # root, both packages and package-lock.json
   git add -A && git commit -m "chore: <version> version release"
   ```
   `node scripts/set-version.js` with no argument prints the current versions.
4. **Verify**:
   ```bash
   node scripts/verify.js
   npx ng test angular-sdk-components --watch=false --coverage
   ```
   Run Playwright E2E (MediaCo portal + embedded, needs a Pega Infinity environment) for rendering-affecting releases and record the result in the PR; otherwise say it was not run.
5. **Smoke-test inside angular-sdk**: `npm run create_and_install_sdk_packages` (asks for the absolute path of an angular-sdk checkout; builds, packs both packages and installs them there). Build and run that app in portal and embedded modes.
6. **Open the release PR**, get review, merge.
7. **Publish** (manually, by a maintainer, from `dist/angular-sdk-components` and `packages/angular-sdk-overrides`; use `npm publish --provenance --access public` where the environment supports it, and `--dry-run` first). Check the versions of both packages are identical before publishing.
8. **After the release**: confirm `npm view @pega/angular-sdk-components version`, tag/release notes as the maintainers usually do, and (if the team resets the development placeholder after releases) follow that convention in a separate commit. Start the next in-progress changelog section with `node scripts/changelog.js new-release <next-version>` only once the next release number is known.

## Classifying changes for the notes

`feat` -> Features, `fix` -> Bug fixes, breaking API/behaviour -> "Breaking changes" (see `sdk-public-api-change`). Peer-dependency range bumps in `packages/angular-sdk-components/package.json` are breaking for consumers.

## Checklist

- [ ] version agreed with the user and identical in root, both packages, lock file
- [ ] CHANGELOG.md finalised in the established format and dated; `changelog:check` green
- [ ] `node scripts/verify.js` green; coverage floor holds
- [ ] E2E result recorded (or "not run")
- [ ] packages smoke-tested in angular-sdk
- [ ] published; version visible on npm
