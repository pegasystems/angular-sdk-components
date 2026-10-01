'use strict';

/** Environment variable -> sdk-config.json path (dot notation). */
const ENV_MAP = {
  SDK_THEME: 'theme',
  SDK_AUTH_SERVICE: 'authConfig.authService',
  SDK_PORTAL_CLIENT_ID: 'authConfig.portalClientId',
  SDK_MASHUP_CLIENT_ID: 'authConfig.mashupClientId',
  SDK_MASHUP_USER_IDENTIFIER: 'authConfig.mashupUserIdentifier',
  SDK_INFINITY_REST_SERVER_URL: 'serverConfig.infinityRestServerUrl',
  SDK_APP_ALIAS: 'serverConfig.appAlias',
  SDK_CONTENT_SERVER_URL: 'serverConfig.sdkContentServerUrl',
  SDK_APP_PORTAL: 'serverConfig.appPortal',
  SDK_APP_MASHUP_CASE_TYPE: 'serverConfig.appMashupCaseType'
};

const BOOLEAN_ENV_MAP = {
  SDK_SHOW_MODALS_IN_EMBEDDED_MODE: 'serverConfig.showModalsInEmbeddedMode'
};

/** Secrets that must be Base64 encoded in sdk-config.json; supplied in plain text through the environment. */
const BASE64_ENV_MAP = {
  SDK_MASHUP_PASSWORD: 'authConfig.mashupPassword'
};

const SECRET_PATHS = ['authConfig.mashupPassword'];

function setPath(obj, dotted, value) {
  const keys = dotted.split('.');
  let cur = obj;
  for (const k of keys.slice(0, -1)) {
    if (typeof cur[k] !== 'object' || cur[k] === null) cur[k] = {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
}

function getPath(obj, dotted) {
  return dotted.split('.').reduce((cur, k) => (cur == null ? undefined : cur[k]), obj);
}

/**
 * Returns a copy of `config` with values from `env` applied. Unset or empty variables leave the file value untouched.
 * @returns {{ config: object, applied: string[] }} the new config and the env variable names that were applied
 */
function applyEnv(config, env) {
  const next = JSON.parse(JSON.stringify(config));
  const applied = [];
  const present = name => env[name] !== undefined && env[name] !== '';

  for (const [name, target] of Object.entries(ENV_MAP)) {
    if (present(name)) {
      setPath(next, target, env[name]);
      applied.push(name);
    }
  }
  for (const [name, target] of Object.entries(BOOLEAN_ENV_MAP)) {
    if (present(name)) {
      const v = String(env[name]).toLowerCase();
      if (!['true', 'false'].includes(v)) throw new Error(`${name} must be "true" or "false" (got "${env[name]}")`);
      setPath(next, target, v === 'true');
      applied.push(name);
    }
  }
  for (const [name, target] of Object.entries(BASE64_ENV_MAP)) {
    if (present(name)) {
      setPath(next, target, Buffer.from(env[name], 'utf8').toString('base64'));
      applied.push(name);
    }
  }
  return { config: next, applied };
}

/**
 * Validates the settings every deployment needs.
 * @returns {{ errors: string[], warnings: string[] }}
 */
function validate(config) {
  const errors = [];
  const warnings = [];

  const url = getPath(config, 'serverConfig.infinityRestServerUrl');
  if (!url) {
    errors.push('serverConfig.infinityRestServerUrl is empty (env: SDK_INFINITY_REST_SERVER_URL)');
  } else {
    try {
      const u = new URL(url);
      if (!['http:', 'https:'].includes(u.protocol)) errors.push(`serverConfig.infinityRestServerUrl must be http(s): ${url}`);
      if (/\/$/.test(url)) warnings.push('serverConfig.infinityRestServerUrl should not end with a slash');
    } catch {
      errors.push(`serverConfig.infinityRestServerUrl is not a valid URL: ${url}`);
    }
  }

  if (!getPath(config, 'authConfig.portalClientId')) errors.push('authConfig.portalClientId is empty (env: SDK_PORTAL_CLIENT_ID)');
  if (!getPath(config, 'serverConfig.appAlias'))
    warnings.push("serverConfig.appAlias is empty; the operator's default application is used (env: SDK_APP_ALIAS)");

  if (getPath(config, 'authConfig.mashupClientId') && !getPath(config, 'authConfig.mashupPassword')) {
    warnings.push('authConfig.mashupClientId is set but mashupPassword is empty; embedded/mashup login will fail unless auth is handled elsewhere');
  }
  return { errors, warnings };
}

/** Copy of config that is safe to print. */
function redact(config) {
  const copy = JSON.parse(JSON.stringify(config));
  for (const p of SECRET_PATHS) if (getPath(copy, p)) setPath(copy, p, '********');
  return copy;
}

module.exports = { ENV_MAP, BOOLEAN_ENV_MAP, BASE64_ENV_MAP, applyEnv, validate, redact, getPath };
