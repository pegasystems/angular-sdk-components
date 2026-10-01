'use strict';

const fs = require('node:fs');
const path = require('node:path');

const FILES = ['package.json', 'packages/angular-sdk-components/package.json', 'packages/angular-sdk-overrides/package.json'];

/** Replaces the top-level "version" in a package.json text without reformatting the rest of the file. */
function setPackageVersion(text, version) {
  const re = /^(\s*"version":\s*")[^"]+(",?\s*)$/m;
  if (!re.test(text)) throw new Error('no top-level "version" field found');
  return text.replace(re, `$1${version}$2`);
}

/** Updates the two version fields package-lock.json keeps for the root project (top level and packages[""]). */
function setLockVersion(text, version) {
  const lock = JSON.parse(text);
  lock.version = version;
  if (lock.packages && lock.packages['']) lock.packages[''].version = version;
  const indent = /^(\s+)"/m.exec(text)?.[1] ?? '  ';
  return `${JSON.stringify(lock, null, indent)}${text.endsWith('\n') ? '\n' : ''}`;
}

/** Sets the release version in the root package, both published packages and package-lock.json. */
function setVersion(root, version) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`invalid version "${version}" (expected x.y.z)`);
  const changed = [];
  for (const rel of FILES) {
    const file = path.join(root, rel);
    const before = fs.readFileSync(file, 'utf8');
    const after = setPackageVersion(before, version);
    if (after !== before) fs.writeFileSync(file, after);
    changed.push(rel);
  }
  const lockPath = path.join(root, 'package-lock.json');
  if (fs.existsSync(lockPath)) {
    const before = fs.readFileSync(lockPath, 'utf8');
    const after = setLockVersion(before, version);
    if (after !== before) fs.writeFileSync(lockPath, after);
    changed.push('package-lock.json');
  }
  return changed;
}

/** @returns {Record<string,string>} version found in each file */
function readVersions(root) {
  const out = {};
  for (const rel of FILES) out[rel] = JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')).version;
  return out;
}

module.exports = { setPackageVersion, setLockVersion, setVersion, readVersions, FILES };
