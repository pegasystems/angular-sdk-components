#!/usr/bin/env node
'use strict';

/*
 * Pre-flight checks for a new checkout or a CI agent: `npm run doctor` (add `-- --offline` to skip the network probe).
 * Exits 1 when a blocking problem is found so it can gate a pipeline.
 */
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const { applyEnv, validate } = require('./lib/sdk-config');

const root = path.resolve(__dirname, '..');
const offline = process.argv.includes('--offline');
const results = [];
const add = (level, name, detail) => results.push({ level, name, detail });

function checkNode() {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const wanted = (pkg.engines && pkg.engines.node) || '';
  const min = Number((/(\d+)/.exec(wanted) || [])[1] || 0);
  const major = Number(process.versions.node.split('.')[0]);
  const caret = /^\^/.test(wanted);
  if (caret ? major === min : major >= min) add('ok', 'Node.js', `v${process.versions.node} (requires ${wanted || 'any'})`);
  else add('error', 'Node.js', `v${process.versions.node} is not supported; requires ${wanted}.`);
}

function checkDependencies() {
  const ok = ['@angular/core', '@pega/auth', '@pega/constellationjs'].every(p => fs.existsSync(path.join(root, 'node_modules', p)));
  if (ok) add('ok', 'Dependencies', 'node_modules present');
  else add('error', 'Dependencies', 'node_modules is missing or incomplete; run "npm ci" (or "npm install")');
}

function loadConfig() {
  const file = path.join(root, 'sdk-config.json');
  if (!fs.existsSync(file)) {
    add('error', 'sdk-config.json', 'not found in the repository root');
    return undefined;
  }
  try {
    const { config, applied } = applyEnv(JSON.parse(fs.readFileSync(file, 'utf8')), process.env);
    const { errors, warnings } = validate(config);
    errors.forEach(e => add('error', 'sdk-config.json', e));
    warnings.forEach(w => add('warn', 'sdk-config.json', w));
    if (!errors.length) add('ok', 'sdk-config.json', applied.length ? `valid (env overrides: ${applied.join(', ')})` : 'valid');
    return config;
  } catch (e) {
    add('error', 'sdk-config.json', `cannot be parsed: ${e.message}`);
    return undefined;
  }
}

function checkHttpsKeys() {
  const ok = ['sdk-a.key', 'sdk-a.crt'].every(f => fs.existsSync(path.join(root, 'keys', f)));
  add(
    ok ? 'ok' : 'warn',
    'HTTPS keys',
    ok ? 'keys/sdk-a.key and keys/sdk-a.crt found (npm run start-dev-https)' : 'keys/ not found; only needed for start-dev-https'
  );
}

function portFree(port) {
  return new Promise(resolve => {
    const srv = net.createServer();
    srv.once('error', () => resolve(false));
    srv.once('listening', () => srv.close(() => resolve(true)));
    srv.listen(port, '127.0.0.1');
  });
}

async function checkPort() {
  const free = await portFree(3500);
  add(free ? 'ok' : 'warn', 'Port 3500', free ? 'available for the dev server' : 'in use; stop the other process or pass --port to ng serve');
}

async function checkInfinity(config) {
  if (offline || !config) return;
  const url = config.serverConfig && config.serverConfig.infinityRestServerUrl;
  if (!url) return;
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(8000) });
    add('ok', 'Pega Infinity', `${url} responded (HTTP ${res.status})`);
  } catch (e) {
    const cause = (e.cause && e.cause.code) || e.name;
    add('warn', 'Pega Infinity', `${url} not reachable (${cause}). Check VPN/URL, CORS and certificates. Use --offline to skip.`);
  }
}

(async () => {
  checkNode();
  checkDependencies();
  const config = loadConfig();
  checkHttpsKeys();
  await checkPort();
  await checkInfinity(config);

  const icon = { ok: 'PASS', warn: 'WARN', error: 'FAIL' };
  results.forEach(r => console.log(`${icon[r.level]}  ${r.name}: ${r.detail}`));
  const failed = results.filter(r => r.level === 'error').length;
  console.log(failed ? `\n${failed} blocking problem(s) found.` : '\nEnvironment looks good.');
  process.exit(failed ? 1 : 0);
})();
