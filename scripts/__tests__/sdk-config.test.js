'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { applyEnv, validate, redact } = require('../lib/sdk-config');

const base = () => ({
  theme: 'dark',
  authConfig: { portalClientId: 'abc', mashupClientId: '', mashupPassword: '' },
  serverConfig: { infinityRestServerUrl: 'https://pega.example.com/prweb', appAlias: '', showModalsInEmbeddedMode: false }
});

test('applyEnv overrides only the variables that are set', () => {
  const { config, applied } = applyEnv(base(), { SDK_APP_ALIAS: 'MediaCo', SDK_THEME: '' });
  assert.equal(config.serverConfig.appAlias, 'MediaCo');
  assert.equal(config.theme, 'dark');
  assert.deepEqual(applied, ['SDK_APP_ALIAS']);
});

test('applyEnv does not mutate its input', () => {
  const input = base();
  applyEnv(input, { SDK_APP_ALIAS: 'X' });
  assert.equal(input.serverConfig.appAlias, '');
});

test('applyEnv Base64 encodes the mashup password', () => {
  const { config } = applyEnv(base(), { SDK_MASHUP_PASSWORD: 'p@ss' });
  assert.equal(config.authConfig.mashupPassword, Buffer.from('p@ss').toString('base64'));
});

test('applyEnv parses booleans and rejects invalid values', () => {
  assert.equal(applyEnv(base(), { SDK_SHOW_MODALS_IN_EMBEDDED_MODE: 'TRUE' }).config.serverConfig.showModalsInEmbeddedMode, true);
  assert.throws(() => applyEnv(base(), { SDK_SHOW_MODALS_IN_EMBEDDED_MODE: 'yes' }), /must be "true" or "false"/);
});

test('validate accepts a complete config', () => {
  assert.deepEqual(validate(base()).errors, []);
});

test('validate reports missing and malformed values', () => {
  const cfg = base();
  cfg.serverConfig.infinityRestServerUrl = 'not a url';
  cfg.authConfig.portalClientId = '';
  const { errors } = validate(cfg);
  assert.equal(errors.length, 2);

  cfg.serverConfig.infinityRestServerUrl = '';
  assert.match(validate(cfg).errors[0], /empty/);
});

test('validate warns about trailing slash and mashup without password', () => {
  const cfg = base();
  cfg.serverConfig.infinityRestServerUrl = 'https://pega.example.com/prweb/';
  cfg.authConfig.mashupClientId = 'm1';
  const { warnings } = validate(cfg);
  assert.ok(warnings.some(w => /slash/.test(w)));
  assert.ok(warnings.some(w => /mashupPassword/.test(w)));
});

test('redact masks secrets without touching the original', () => {
  const cfg = base();
  cfg.authConfig.mashupPassword = 'c2VjcmV0';
  assert.equal(redact(cfg).authConfig.mashupPassword, '********');
  assert.equal(cfg.authConfig.mashupPassword, 'c2VjcmV0');
});
