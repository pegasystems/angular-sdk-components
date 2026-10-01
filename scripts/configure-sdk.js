#!/usr/bin/env node
'use strict';

/*
 * Configures sdk-config.json from environment variables so the same checkout can be built for any environment in CI
 * without committing environment-specific values or secrets.
 *
 *   node scripts/configure-sdk.js                  apply SDK_* env vars to ./sdk-config.json in place
 *   node scripts/configure-sdk.js --out dist/sdk-config.json
 *   node scripts/configure-sdk.js --check          validate only (exit 1 on errors), nothing is written
 *   node scripts/configure-sdk.js --print          print the resulting config with secrets masked
 *
 * See docs/configuration.md for the variable list.
 */
const fs = require('node:fs');
const path = require('node:path');
const { applyEnv, validate, redact } = require('./lib/sdk-config');

function parseArgs(argv) {
  const args = { file: 'sdk-config.json', out: undefined, check: false, print: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--check') args.check = true;
    else if (a === '--print') args.print = true;
    else if (a === '--file') args.file = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else throw new Error(`Unknown argument: ${a}`);
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const file = path.resolve(args.file);
  const original = JSON.parse(fs.readFileSync(file, 'utf8'));
  const { config, applied } = applyEnv(original, process.env);
  const { errors, warnings } = validate(config);

  warnings.forEach(w => console.warn(`warning: ${w}`));
  errors.forEach(e => console.error(`error: ${e}`));

  if (args.print) console.log(JSON.stringify(redact(config), null, 2));
  if (errors.length) process.exit(1);
  if (args.check) {
    console.log(`${path.relative(process.cwd(), file)} is valid${applied.length ? ` (with overrides: ${applied.join(', ')})` : ''}`);
    return;
  }

  const target = path.resolve(args.out || args.file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(config, null, 2)}\n`);
  console.log(`Wrote ${path.relative(process.cwd(), target)}${applied.length ? ` (applied: ${applied.join(', ')})` : ' (no SDK_* variables set)'}`);
}

try {
  main();
} catch (e) {
  console.error(`error: ${e.message}`);
  process.exit(1);
}
