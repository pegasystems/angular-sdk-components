---
description: Add CHANGELOG.md entries for a PR in the project format
---

Add the changelog entry for PR `${input:pr:PR number}` (type `${input:type:feature, fix or refactor}`) following the `sdk-changelog` skill: read the PR (`gh pr view ${input:pr}`), write one user-facing past-tense sentence, run `node scripts/changelog.js add --type ... --pr ... --text "..."`, then `node scripts/changelog.js check`. If the PR is not user-visible, say so instead of adding an entry.
