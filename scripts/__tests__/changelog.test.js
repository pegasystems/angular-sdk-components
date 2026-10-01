'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { checkChangelog, addEntry, startRelease, stampRelease } = require('../lib/changelog');

const sample = `# [26.1.10](https://github.com/pegasystems/angular-sdk/tree/release/26.1.10)

### **Features**
*   **Added A.**
    * Github: [PR-1](https://github.com/pegasystems/angular-sdk-components/pull/1)

### **Bug fixes**
*   **Fixed B.**
      * Github: [PR-2](https://github.com/pegasystems/angular-sdk-components/pull/2)

# [25.1.13](https://github.com/pegasystems/angular-sdk/tree/release/25.1.13) - Released: 12/06/2026

### **Bug fixes**
*   **Fixed old.**
      * Github: [PR-3](https://github.com/pegasystems/angular-sdk-components/pull/9)
`;

test('the real CHANGELOG.md follows the format', () => {
  const real = fs.readFileSync(path.join(__dirname, '..', '..', 'CHANGELOG.md'), 'utf8');
  assert.deepEqual(checkChangelog(real), []);
});

test('sample passes (older entries are not link-checked)', () => {
  assert.deepEqual(checkChangelog(sample), []);
});

test('check reports bad headings, dates, sections and links in the newest release', () => {
  const bad = sample
    .replace('/release/26.1.10)', '/release/26.1.11)')
    .replace('Released: 12/06/2026', 'Released: 31/02/2026')
    .replace('### **Features**', '### **Stuff**')
    .replace('pull/1)', 'pull/7)');
  const text = checkChangelog(bad).join('\n');
  assert.match(text, /link must be/);
  assert.match(text, /invalid date/);
  assert.match(text, /unknown section "Stuff"/);
  assert.match(text, /PR link for 1 must be/);
});

test('only the newest release may be undated', () => {
  const bad = sample.replace(' - Released: 12/06/2026', '');
  assert.match(checkChangelog(bad).join('\n'), /only the newest release may omit/);
});

test("addEntry appends to an existing section using that section's indentation", () => {
  const out = addEntry(sample, { type: 'fix', text: 'Fixed C.', prs: ['5'] });
  assert.match(out, /\*   \*\*Fixed C\.\*\*\n {6}\* Github: \[PR-5\]\(https:\/\/github\.com\/pegasystems\/angular-sdk-components\/pull\/5\)/);
  assert.deepEqual(checkChangelog(out), []);
  const feat = addEntry(sample, { type: 'feature', text: 'Added D.', prs: ['6', '7'] });
  assert.match(feat, /\*\*Added D\.\*\*\n {4}\* Github: \[PR-6\]\(.*\/6\), \[PR-7\]\(.*\/7\)/);
});

test('addEntry creates a missing section in canonical order', () => {
  const out = addEntry(sample, { type: 'refactor', text: 'Refactored E', prs: ['8'] });
  assert.ok(out.indexOf('### **Refactoring**') > out.indexOf('### **Bug fixes**'));
  assert.ok(out.indexOf('### **Refactoring**') < out.indexOf('# [25.1.13]'));
  assert.deepEqual(checkChangelog(out), []);
});

test('addEntry rejects duplicates, bad input and dated newest release', () => {
  assert.throws(() => addEntry(sample, { type: 'fix', text: 'x', prs: ['2'] }), /already listed/);
  assert.throws(() => addEntry(sample, { type: 'nope', text: 'x', prs: ['1'] }), /type must be/);
  assert.throws(() => addEntry(sample, { type: 'fix', text: 'x', prs: ['abc'] }), /numeric PR/);
  assert.throws(() => addEntry(stampRelease(sample, '01/02/2026'), { type: 'fix', text: 'x', prs: ['9'] }), /already dated/);
});

test('startRelease and stampRelease manage the in-progress release', () => {
  assert.throws(() => startRelease(sample, '26.1.11'), /still in progress/);
  const stamped = stampRelease(sample, '30/10/2026');
  assert.match(stamped.split('\n')[0], / - Released: 30\/10\/2026$/);
  const next = startRelease(stamped, '26.1.11');
  assert.match(next.split('\n')[0], /^# \[26\.1\.11\]\(.*release\/26\.1\.11\)$/);
  assert.deepEqual(checkChangelog(next), []);
  assert.throws(() => stampRelease(sample, '31/02/2026'), /valid dd\/mm\/yyyy/);
});
