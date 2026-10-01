#!/usr/bin/env node
'use strict';

/*
 * Maintains CHANGELOG.md in the project's established format (see scripts/lib/changelog.js).
 *
 *   node scripts/changelog.js check
 *   node scripts/changelog.js add --type fix --pr 610 --text "Fixed the issue where ..."
 *   node scripts/changelog.js add --type feature --pr 611 --pr 612 --text "Added support for ..."
 *   node scripts/changelog.js new-release 26.1.11
 *   node scripts/changelog.js release-date 30/10/2026
 *
 * Types: feature | fix | refactor. Wording rules: see the sdk-engineer agent (Part 10.2).
 */
const fs = require('node:fs');
const path = require('node:path');
const { checkChangelog, addEntry, startRelease, stampRelease } = require('./lib/changelog');

const file = path.resolve(__dirname, '..', 'CHANGELOG.md');

function parse(argv) {
  const [command, ...rest] = argv;
  const opts = { prs: [] };
  const positional = [];
  for (let i = 0; i < rest.length; i += 1) {
    const a = rest[i];
    if (a === '--type') opts.type = rest[++i];
    else if (a === '--text') opts.text = rest[++i];
    else if (a === '--pr') opts.prs.push(rest[++i]);
    else if (a.startsWith('--')) throw new Error(`Unknown option ${a}`);
    else positional.push(a);
  }
  return { command, opts, positional };
}

function main() {
  const { command, opts, positional } = parse(process.argv.slice(2));
  const text = fs.readFileSync(file, 'utf8');

  if (command === 'check') {
    const problems = checkChangelog(text);
    if (problems.length) {
      problems.forEach(p => console.error(`error: CHANGELOG.md: ${p}`));
      process.exit(1);
    }
    console.log('CHANGELOG.md follows the project format');
    return;
  }

  let next;
  if (command === 'add') next = addEntry(text, opts);
  else if (command === 'new-release') {
    if (!/^\d+\.\d+\.\d+$/.test(positional[0] || '')) throw new Error('usage: new-release <x.y.z>');
    next = startRelease(text, positional[0]);
  } else if (command === 'release-date') {
    next = stampRelease(text, positional[0] || '');
  } else {
    throw new Error('usage: check | add --type <feature|fix|refactor> --pr <n> --text "..." | new-release <x.y.z> | release-date <dd/mm/yyyy>');
  }

  const problems = checkChangelog(next);
  if (problems.length) {
    problems.forEach(p => console.error(`error: result would be invalid: ${p}`));
    process.exit(1);
  }
  fs.writeFileSync(file, next);
  console.log(`Updated CHANGELOG.md (${command})`);
}

try {
  main();
} catch (e) {
  console.error(`error: ${e.message}`);
  process.exit(1);
}
