'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { setPackageVersion, setLockVersion, setVersion, readVersions } = require('../lib/set-version');

test('setPackageVersion only changes the version line', () => {
  const src = '{\n  "name": "x",\n  "version": "0.26.1",\n  "dependencies": { "a": "1.0.0" }\n}\n';
  assert.equal(setPackageVersion(src, '26.1.11'), '{\n  "name": "x",\n  "version": "26.1.11",\n  "dependencies": { "a": "1.0.0" }\n}\n');
  assert.throws(() => setPackageVersion('{}', '1.0.0'), /no top-level/);
});

test('setLockVersion updates both root version fields and keeps formatting', () => {
  const src = `${JSON.stringify({ name: 'x', version: '1.0.0', packages: { '': { name: 'x', version: '1.0.0' }, 'node_modules/a': { version: '9.9.9' } } }, null, 2)}\n`;
  const out = JSON.parse(setLockVersion(src, '2.0.0'));
  assert.equal(out.version, '2.0.0');
  assert.equal(out.packages[''].version, '2.0.0');
  assert.equal(out.packages['node_modules/a'].version, '9.9.9');
  assert.ok(setLockVersion(src, '1.0.0') === src);
});

test('setVersion updates every file and rejects invalid versions', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'setver-'));
  const write = (rel, obj) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), `${JSON.stringify(obj, null, 2)}\n`);
  };
  write('package.json', { name: 'r', version: '0.1.0' });
  write('packages/angular-sdk-components/package.json', { name: 'c', version: '0.1.0' });
  write('packages/angular-sdk-overrides/package.json', { name: 'o', version: '0.1.0' });
  write('package-lock.json', { name: 'r', version: '0.1.0', packages: { '': { version: '0.1.0' } } });

  assert.throws(() => setVersion(root, 'v1'), /invalid version/);
  setVersion(root, '26.1.11');
  assert.deepEqual(Object.values(readVersions(root)), ['26.1.11', '26.1.11', '26.1.11']);
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8')).packages[''].version, '26.1.11');
});
