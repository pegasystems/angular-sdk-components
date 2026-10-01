/*
 * Ratchet for `noImplicitAny`: the library is not yet clean, so we record the per-file compiler error count (with the flag
 * on) in a baseline and fail whenever a file gets worse or a new file starts failing. Run with --update after
 * fixing errors to lower the baseline.
 */
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const baselinePath = path.join(root, 'scripts', 'implicit-any-baseline.json');
const update = process.argv.includes('--update');

const tsc = path.join(root, 'node_modules', '.bin', 'tsc');
const result = spawnSync(tsc, ['-p', 'packages/angular-sdk-components/tsconfig.lib.json', '--noEmit', '--noImplicitAny', '--pretty', 'false'], {
  cwd: root,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024
});

const counts = {};
for (const line of (result.stdout || '').split('\n')) {
  const m = /^(.+?)\(\d+,\d+\): error TS(\d+):/.exec(line);
  if (!m) continue;
  counts[m[1]] = (counts[m[1]] || 0) + 1;
}

const sorted = Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));

if (update) {
  fs.writeFileSync(baselinePath, `${JSON.stringify(sorted, null, 2)}\n`);
  console.log(`Baseline updated: ${Object.values(sorted).reduce((a, b) => a + b, 0)} errors in ${Object.keys(sorted).length} files`);
  process.exit(0);
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
let failed = false;
let improved = 0;
for (const [file, n] of Object.entries(sorted)) {
  const allowed = baseline[file] ?? 0;
  if (n > allowed) {
    console.error(`${file}: ${n} implicit-any errors (baseline ${allowed})`);
    failed = true;
  }
}
for (const [file, allowed] of Object.entries(baseline)) {
  if ((sorted[file] ?? 0) < allowed) improved += 1;
}
if (improved) console.log(`${improved} file(s) improved; run "node scripts/check-implicit-any.js --update" to lower the baseline.`);
if (failed) process.exit(1);
console.log('noImplicitAny ratchet OK');
