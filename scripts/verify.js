#!/usr/bin/env node
'use strict';

/*
 * One command that runs every check CI runs, with a compact report. Built for humans and for coding agents:
 * output is short, failures include only the relevant log tail, and --json gives machine-readable results.
 *
 *   npm run verify                 full run (what CI does, except E2E)
 *   npm run verify -- --quick      fast static checks only (about a minute)
 *   npm run verify -- --only lint,unit
 *   npm run verify -- --json       machine-readable report on stdout
 *   npm run verify -- --keep-going continue after a failing step
 */
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

const STEPS = [
  { id: 'lint', quick: true, title: 'ESLint + Prettier', cmd: 'npm run lint' },
  {
    id: 'any',
    quick: true,
    title: 'noImplicitAny ratchet',
    cmd: 'npm run check:any',
    fix: 'Add types; if errors were fixed run `npm run check:any:update`'
  },
  { id: 'docs', quick: true, title: 'Component catalogue up to date', cmd: 'npm run docs:components:check', fix: 'Run `npm run docs:components`' },
  { id: 'scripts', quick: true, title: 'Tooling script tests', cmd: 'npm run test:scripts' },
  {
    id: 'agents',
    quick: true,
    title: 'Agent assets consistent',
    cmd: 'npm run check:agents',
    fix: 'Fix front matter or the npm script name mentioned in .github/agents, .github/skills, AGENTS.md or docs'
  },
  {
    id: 'changelog',
    quick: true,
    title: 'CHANGELOG.md format',
    cmd: 'npm run changelog:check',
    fix: 'See skill sdk-changelog; use `npm run changelog -- add ...` to add entries in the right format'
  },
  { id: 'config', quick: true, title: 'sdk-config.json valid', cmd: 'npm run configure:check' },
  { id: 'build', title: 'Library build (ng-packagr)', cmd: 'npm run build-angular-sdk-components' },
  {
    id: 'api',
    title: 'Public API report',
    cmd: 'npm run api:check',
    fix: 'If the change is intended run `npm run api:update` and commit etc/angular-sdk-components.api.md'
  },
  { id: 'overrides', title: 'Overrides build + type-check', cmd: 'npm run build-overrides && npm run check:overrides' },
  { id: 'pack', title: 'Package tarballs', cmd: 'npm run smoke:pack' },
  { id: 'unit', title: 'Unit tests', cmd: 'npm run test:unit' }
];

function parseArgs(argv) {
  const args = { quick: false, only: undefined, json: false, keepGoing: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--quick') args.quick = true;
    else if (a === '--json') args.json = true;
    else if (a === '--keep-going') args.keepGoing = true;
    else if (a === '--only') args.only = (argv[++i] || '').split(',').filter(Boolean);
    else throw new Error(`Unknown argument: ${a}`);
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  let steps = STEPS;
  if (args.only) {
    const unknown = args.only.filter(id => !STEPS.some(s => s.id === id));
    if (unknown.length) throw new Error(`Unknown step(s): ${unknown.join(', ')}. Available: ${STEPS.map(s => s.id).join(', ')}`);
    steps = STEPS.filter(s => args.only.includes(s.id));
  } else if (args.quick) {
    steps = STEPS.filter(s => s.quick);
  }

  const results = [];
  for (const step of steps) {
    const started = Date.now();
    const r = spawnSync(step.cmd, {
      cwd: root,
      shell: true,
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
      env: { ...process.env, FORCE_COLOR: '0' }
    });
    const seconds = Math.round((Date.now() - started) / 100) / 10;
    const ok = r.status === 0;
    const output = `${r.stdout || ''}${r.stderr || ''}`.trim().split('\n');
    results.push({
      id: step.id,
      title: step.title,
      ok,
      seconds,
      command: step.cmd,
      fix: ok ? undefined : step.fix,
      logTail: ok ? undefined : output.slice(-40)
    });
    if (!args.json) console.log(`${ok ? 'PASS' : 'FAIL'}  ${step.title} (${seconds}s)`);
    if (!ok && !args.keepGoing) break;
  }

  const failed = results.filter(r => !r.ok);
  const skipped = steps.filter(s => !results.some(r => r.id === s.id)).map(s => s.id);

  if (args.json) {
    console.log(JSON.stringify({ ok: failed.length === 0 && skipped.length === 0, results, skipped }, null, 2));
  } else {
    for (const f of failed) {
      console.log(`\n--- ${f.title}: \`${f.command}\` (last ${f.logTail.length} lines) ---`);
      console.log(f.logTail.join('\n'));
      if (f.fix) console.log(`\nHow to fix: ${f.fix}`);
    }
    if (skipped.length) console.log(`\nNot run (stopped at first failure; use --keep-going): ${skipped.join(', ')}`);
    console.log(
      failed.length ? `\nverify: ${failed.length} step(s) failed` : skipped.length ? '\nverify: incomplete' : '\nverify: all checks passed'
    );
  }
  process.exit(failed.length || skipped.length ? 1 : 0);
}

try {
  main();
} catch (e) {
  console.error(`error: ${e.message}`);
  process.exit(2);
}
