'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { parseFrontMatter, referencedNpmScripts, checkAgentAssets } = require('../lib/agent-assets');

function fixture(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-assets-'));
  for (const [rel, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), content);
  }
  return root;
}

test('parseFrontMatter reads simple keys', () => {
  const { meta, body } = parseFrontMatter('---\nname: a\ndescription: "b c"\n---\nbody');
  assert.deepEqual(meta, { name: 'a', description: 'b c' });
  assert.equal(body, 'body');
  assert.equal(parseFrontMatter('no front matter').meta, undefined);
});

test('referencedNpmScripts finds script names', () => {
  assert.deepEqual(referencedNpmScripts('run `npm run verify -- --quick` and npm run test:unit'), ['verify', 'test:unit']);
});

test('checkAgentAssets accepts consistent assets', () => {
  const root = fixture({
    'package.json': JSON.stringify({ scripts: { verify: 'x' } }),
    '.github/agents/a.agent.md': '---\nname: a\ndescription: d\n---\nRun `npm run verify`',
    '.github/skills/sdk-x/SKILL.md': '---\nname: sdk-x\ndescription: d\n---\n',
    'AGENTS.md': 'npm run verify'
  });
  assert.deepEqual(checkAgentAssets(root), []);
});

test('checkAgentAssets reports name mismatch, missing description and unknown scripts', () => {
  const root = fixture({
    'package.json': JSON.stringify({ scripts: {} }),
    '.github/agents/a.agent.md': '---\nname: other\n---\nnpm run nope',
    '.github/skills/sdk-x/SKILL.md': '---\nname: sdk-y\ndescription: d\n---\n'
  });
  const problems = checkAgentAssets(root).join('\n');
  assert.match(problems, /name "other" must equal "a"/);
  assert.match(problems, /missing description/);
  assert.match(problems, /missing npm script "nope"/);
  assert.match(problems, /must equal directory "sdk-x"/);
});
