# Copilot instructions

Read `AGENTS.md` first: it has the project map, the verification loop, the definition of done, task recipes and the rules that must not be broken. Area-specific rules are in `.github/instructions/`.

Essentials:

- Verify with `npm run verify -- --quick` while iterating and `npm run verify` before you finish. Report anything you could not verify (Playwright E2E needs a Pega Infinity server).
- All data access goes through `pConn$`/PConnect; never call Infinity directly. Children render through `<component-mapper>`. Field components extend `FieldBase`.
- New components: `npm run new:component -- <kind> <kebab-name> <PegaName>` (registers in `public-api.ts` and the component map).
- Do not edit `dist/`, `packages/angular-sdk-overrides/lib` (generated), `etc/*.api.md` or `docs/components.md` by hand; use the generating scripts.
- Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`).
