#!/usr/bin/env node
'use strict';

/* Guards the agent-facing documentation against drift: front matter, and that every `npm run X` it mentions exists. */
const path = require('node:path');
const { checkAgentAssets } = require('./lib/agent-assets');

const problems = checkAgentAssets(path.resolve(__dirname, '..'));
if (problems.length) {
  problems.forEach(p => console.error(`error: ${p}`));
  process.exit(1);
}
console.log('Agent assets are consistent');
