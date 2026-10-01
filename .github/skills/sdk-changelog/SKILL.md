---
name: sdk-changelog
description: Write, assemble and finalise CHANGELOG.md entries in this project's established format (release headings tied to angular-sdk releases, Features / Bug fixes / Refactoring / Dependencies & Infrastructure, bold user-facing sentences with PR links) using the deterministic changelog tooling. Use for every user-visible change and at release time.
---

# Changelog

`CHANGELOG.md` is hand-maintained: contributors add an entry per PR to the **in-progress** release at the top; maintainers finalise it at release time. The format below is taken from the existing file; the tooling reproduces it exactly and `node scripts/changelog.js check` (part of `node scripts/verify.js`) enforces it. Do not use release-please or any generator that imposes another format.

## Tooling

```bash
node scripts/changelog.js check                                   # validate the file
node scripts/changelog.js add --type fix --pr 610 --text "Fixed the issue where ..."
node scripts/changelog.js add --type feature --pr 611 --pr 612 --text "Added support for ..."
node scripts/changelog.js add --type refactor --pr 613 --text "Refactored ..."
node scripts/changelog.js new-release 26.1.11                  # open the next in-progress release
node scripts/changelog.js release-date 30/10/2026              # stamp the in-progress release when releasing
```

- `add` writes to the newest release if it has **no** "- Released:" date; it creates the section in canonical order if missing, uses the section's indentation (Features 4 spaces, Bug fixes 6, Refactoring 4), wraps the text in `**...**`, links each PR as `[PR-n](https://github.com/pegasystems/angular-sdk-components/pull/n)`, and refuses duplicates.
- Every command re-validates the result and refuses to write an invalid file.
- Text is a single sentence; do not add the `**` yourself.

## Format reference

Heading (the version is the **angular-sdk release number**, not the repo's dev `package.json` version):

```
# [26.1.10](https://github.com/pegasystems/angular-sdk/tree/release/26.1.10)                        <- in progress
# [25.1.13](https://github.com/pegasystems/angular-sdk/tree/release/25.1.13) - Released: 12/06/2026   <- released (dd/mm/yyyy)
```

Sections, in this order, only when they have content: `### **Features**`, `### **Bug fixes**`, `### **Refactoring**`, `### **Dependencies & Infrastructure**`.

```
### **Features**
*   **Added support for the authored placeholder in the Dropdown component, falling back to 'Select...' when not configured.**
    * Github: [PR-594](https://github.com/pegasystems/angular-sdk-components/pull/594)

### **Bug fixes**
*   **Fixed the issue where required validation was not triggered in the Rich Text Editor.**
      * Github: [PR-601](https://github.com/pegasystems/angular-sdk-components/pull/601)
```

Multiple PRs for one change: comma separated on the same `Github:` line (`[PR-1](...), [PR-2](...)`) as in 25.1.10, or one `Github:` line each as in 26.1.10 (`add` uses the comma form).

Older released sections are history: never reformat or "fix" them (one has a known mismatched link).

## 1. Adding an entry for your PR (normal workflow)

1. Decide whether the change is user-visible (behaviour, new/changed component, fix, public API, dependency that consumers see). Internal-only chores/tests/CI usually get no entry (check how the existing file treats similar changes).
2. The PR number is needed: open the PR first (or ask the user for the number), then add the entry in a follow-up commit on the PR branch.
3. Pick the type: new capability/component/option -> `feature`; defect -> `fix`; restructuring with no behaviour change -> `refactor`.
4. Write the sentence (rules below), run the command, then `node scripts/changelog.js check` (or `node scripts/verify.js --quick`).
5. Breaking change: also record it under "Breaking changes" when the release is finalised (section 3) and mention it in the PR.

### Wording rules (from the existing entries)

- User-facing, past tense, starts with a verb: **Added support for ...**, **Added `X` component.**, **Fixed the issue where ...**, **Fixed ...**, **Refactored ...**, **Updated ...**.
- Name the component or feature the way users see it: `DataReference`, `Autocomplete`, `EmbeddedData`, `Details template`, `SimpleTableManual`.
- Describe the symptom for fixes ("where required validation was not triggered in the Rich Text Editor"), the capability for features. No file names, class internals, ticket IDs, or "refactor" jargon in feature/fix lines.
- One sentence, ends with a period (the tool does not add one for you), no trailing "PR" text; the link line is generated.

## 2. Backfilling a release from git history

```bash
git log --format='%h %s' <previous-release-commit>..HEAD          # e.g. find it with: git log --grep "25.1.13 version release" -1 --format=%h
```

- PR numbers are in subjects as `(#603)`.
- Map conventional types: `feat` -> Features, `fix` -> Bug fixes, `refactor` -> Refactoring, `chore(deps)`/dependency bumps -> the Dependencies table (section 3); `docs`, `test`, `ci`, `style` -> omit unless user-visible.
- Merge commits and multi-PR changes: one entry, several `--pr` flags.
- Skip entries that are already present (`add` rejects duplicates); never delete existing ones.
- If a commit's purpose is unclear, read the PR (`gh pr view <n>`) instead of guessing.

## 3. Finalising a release (maintainers)

1. Confirm the release version with the user (angular-sdk release number). Never invent it.
2. Make sure every merged user-visible PR since the previous release has an entry (section 2).
3. Restructure the in-progress block the way released versions look. Template (from 25.1.13):

```
# [25.1.13](https://github.com/pegasystems/angular-sdk/tree/release/25.1.13) - Released: 12/06/2026

## Breaking changes

*   None.

## Non Breaking changes

### **Bug fixes**
*   ...entries...
---

### **Dependencies & Infrastructure**

The following table lists the packages whose versions have been updated:

| Package | Updated version |
| :--- | :--- |
| **@pega/angular-sdk-components** | 25.1.13 |
| **@pega/angular-sdk-overrides** | 25.1.13 |
| **@pega/constellationjs** | 25.1.3 |
```

- "Breaking changes": list each breaking change with its `Github:` PR line (see 25.1.10/25.1.12), or `*   None.`
- Dependencies table: the two SDK packages at the release version, plus every dependency whose version changed since the previous release: `git diff <previous-release-commit>..HEAD -- package.json` (Angular family, `ng-packagr`, `zone.js`, `@pega/*`, ...). Use exact versions from `package.json`/`package-lock.json`.

4. Stamp the date: `node scripts/changelog.js release-date <dd/mm/yyyy>`.
5. `node scripts/changelog.js check`, `node scripts/verify.js`.
6. Continue with `sdk-release` (version bump commit, publish).

## Review checklist

- [ ] entry exists for each user-visible change, in the right section
- [ ] wording follows the rules; no internal jargon
- [ ] PR links correct (`changelog:check` verifies label/URL agree)
- [ ] older releases untouched
- [ ] breaking changes called out
