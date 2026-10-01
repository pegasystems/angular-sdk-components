#!/usr/bin/env node
'use strict';

/* Release helper: npm run release:version -- 26.1.11  (root, both packages and package-lock.json get the same version). */
const path = require('node:path');
const { setVersion, readVersions } = require('./lib/set-version');

const root = path.resolve(__dirname, '..');
const arg = process.argv[2];
try {
  if (!arg) {
    console.log(readVersions(root));
    process.exit(0);
  }
  const files = setVersion(root, arg);
  console.log(`Set version ${arg} in: ${files.join(', ')}`);
} catch (e) {
  console.error(`error: ${e.message}`);
  process.exit(1);
}
