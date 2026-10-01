---
name: sdk-docs
description: Write and maintain documentation in this repository - which doc owns what, generated versus hand-written files, style, link and script checks, and when a change must update docs, AGENTS.md, skills or the changelog.
---

# Documentation

## Where things live

| Topic                  | File                                                                                                       | Generated?                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| entry point for people | `README.md` (quick start), `docs/README.md` (index)                                                        | no                                                |
| setup                  | `docs/getting-started.md`                                                                                  | no                                                |
| settings               | `docs/configuration.md` (`sdk-config.json`, `SDK_*` variables)                                             | no; keep in sync with `scripts/lib/sdk-config.js` |
| CI usage               | `docs/ci-cd.md`                                                                                            | no                                                |
| customizing            | `docs/customizing.md`                                                                                      | no                                                |
| theming                | `docs/theming.md`                                                                                          | no                                                |
| testing                | `docs/testing.md`                                                                                          | no                                                |
| troubleshooting        | `docs/troubleshooting.md`                                                                                  | no                                                |
| runtime architecture   | `docs/architecture.md`                                                                                     | no                                                |
| component catalogue    | `docs/components.md`                                                                                       | **yes**: `node scripts/generate-component-catalog.js`                |
| decisions              | `docs/adr/NNNN-title.md`                                                                                   | no                                                |
| public API             | `etc/angular-sdk-components.api.md`                                                                        | **yes**: `npx api-extractor run --local`                     |
| release notes          | `CHANGELOG.md`                                                                                             | via `node scripts/changelog.js` (`sdk-changelog`)         |
| agent instructions     | `AGENTS.md`, `.github/instructions/`, `.github/agents/`, `.github/skills/`, `llms.txt` | no; `node scripts/check-agent-assets.js` validates              |

Never hand-edit generated files.

## When a change needs docs

- New/changed npm script, env variable or `sdk-config.json` setting -> `docs/configuration.md` / `docs/ci-cd.md` / `AGENTS.md` command table / `docs/testing.md`.
- New component or Pega name -> regenerate `docs/components.md`.
- Behaviour users notice -> `CHANGELOG.md` entry.
- A decision with trade-offs or a deliberate deferral -> a new ADR (context, decision, consequences) rather than editing an old one.
- New agent rule or pitfall learned -> `AGENTS.md` pitfalls or the matching skill.

## Style

- Task-oriented: start with what the reader wants to do; commands in fenced `bash` blocks that work when pasted from the repo root.
- Short sentences, active voice, present tense; tables for options; no marketing language.
- Every command or script name mentioned must exist (`node scripts/check-agent-assets.js` checks `npm run <script>` mentions in docs, agents, and skills).
- Relative links for repo files; verify they resolve.
- Do not document what is not verified; say "not run"/"untested" explicitly.

## Checks

```bash
npx prettier -c docs README.md AGENTS.md      # formatting
node scripts/check-agent-assets.js                          # scripts mentioned exist; agent/skill front matter
node scripts/generate-component-catalog.js --check                 # catalogue current
node scripts/verify.js --quick
```
