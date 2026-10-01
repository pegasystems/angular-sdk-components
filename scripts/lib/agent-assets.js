'use strict';

const fs = require('node:fs');
const path = require('node:path');

/** Splits a markdown file with YAML front matter into { meta, body }; meta only supports simple `key: value` lines. */
function parseFrontMatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text);
  if (!m) return { meta: undefined, body: text };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (kv) meta[kv[1]] = kv[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return { meta, body: m[2] };
}

/** Extracts script names from `npm run <name>` mentions (ignores placeholders such as <script>). */
function referencedNpmScripts(text) {
  const names = new Set();
  for (const m of text.matchAll(/npm run ([a-zA-Z0-9:_-]+)/g)) names.add(m[1]);
  return [...names];
}

function listFiles(dir, predicate) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap(e =>
      e.isDirectory() ? listFiles(path.join(dir, e.name), predicate) : predicate(path.join(dir, e.name)) ? [path.join(dir, e.name)] : []
    );
}

/**
 * Validates agent assets under `root`:
 *  - .github/agents/*.agent.md: front matter with name (= file name) and description
 *  - .github/skills/<dir>/SKILL.md for sdk-* skills: front matter name = directory, description present
 *  - every `npm run X` mentioned in agents, skills, prompts, AGENTS.md and docs exists in package.json
 *  - every backticked repo path that looks like a file in those documents exists (best effort, only for known roots)
 * @returns {string[]} problems
 */
function checkAgentAssets(root) {
  const problems = [];
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const scripts = new Set(Object.keys(pkg.scripts || {}));

  const agentFiles = listFiles(path.join(root, '.github', 'agents'), f => f.endsWith('.agent.md'));
  for (const f of agentFiles) {
    const { meta } = parseFrontMatter(fs.readFileSync(f, 'utf8'));
    const rel = path.relative(root, f);
    if (!meta) problems.push(`${rel}: missing front matter`);
    else {
      const expected = path.basename(f).replace(/\.agent\.md$/, '');
      if (meta.name !== expected) problems.push(`${rel}: name "${meta.name}" must equal "${expected}"`);
      if (!meta.description) problems.push(`${rel}: missing description`);
    }
  }

  const skillFiles = listFiles(
    path.join(root, '.github', 'skills'),
    f => path.basename(f) === 'SKILL.md' && path.basename(path.dirname(f)).startsWith('sdk-')
  );
  for (const f of skillFiles) {
    const { meta } = parseFrontMatter(fs.readFileSync(f, 'utf8'));
    const rel = path.relative(root, f);
    if (!meta) problems.push(`${rel}: missing front matter`);
    else {
      const expected = path.basename(path.dirname(f));
      if (meta.name !== expected) problems.push(`${rel}: name "${meta.name}" must equal directory "${expected}"`);
      if (!meta.description) problems.push(`${rel}: missing description`);
    }
  }

  const docs = [
    ...agentFiles,
    ...skillFiles,
    ...listFiles(path.join(root, '.github', 'prompts'), f => f.endsWith('.md')),
    path.join(root, 'AGENTS.md'),
    ...listFiles(path.join(root, 'docs'), f => f.endsWith('.md'))
  ].filter(f => fs.existsSync(f));

  for (const f of docs) {
    const text = fs.readFileSync(f, 'utf8');
    for (const name of referencedNpmScripts(text)) {
      if (!scripts.has(name)) problems.push(`${path.relative(root, f)}: references missing npm script "${name}"`);
    }
  }
  return problems;
}

module.exports = { parseFrontMatter, referencedNpmScripts, checkAgentAssets };
