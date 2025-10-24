// test-setup.ts: Lightweight Constellation runtime stubs for unit tests
// Provides global PCore & PConnect so code referencing them compiles & runs.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noop = (..._args: any[]): any => undefined;

const pubSubUtils = { subscribe: noop, unsubscribe: noop };
const localeUtils = { getLocaleValue: (v: string) => v, GENERIC_BUNDLE_KEY: 'Generic', localeStore: { Generic: {} } };
const dataApiUtils = { getData: () => Promise.resolve({ data: { data: {} } }) };
const messageManager = { addMessages: noop, clearMessages: noop, getValidationErrorMessages: () => [] };
const environmentInfo = {
  getOperatorName: () => 'TestUser',
  getApplicationLabel: () => 'TestApp',
  getMaxAttachmentSize: () => '5',
  getUseLocale: () => 'en-US',
  getLocale: () => 'en-US',
  getKeyMapping: (k: string) => k,
  getTimeZone: () => 'UTC'
};
const constants = {
  RESOURCE_STATUS: { CREATE: 'CREATE', UPDATE: 'UPDATE' },
  LIST_SELECTION_MODE: { MULTI: 'MULTI' },
  CASE_INFO: { CASE_INFO_ID: 'caseId', CASE_INFO_CLASSID: 'classId', INSTRUCTIONS: 'instructions' },
  PUB_SUB_EVENTS: { EVENT_CANCEL: 'EVENT_CANCEL', CASE_EVENTS: { ASSIGNMENT_SUBMISSION: 'ASSIGNMENT_SUBMISSION' } },
  MESSAGES: { MESSAGES_TYPE_ERROR: 'error' },
  SUMMARY_OF_ATTACHMENTS_LAST_REFRESH_TIME: 'LastRefreshTime',
  WORKLIST: 'WORKLIST'
};
const annotationUtils = { getPropertyName: (n: string) => n, isProperty: () => true };
const metadataUtils = { getPropertyMetadata: () => ({}), getListTypeMetadata: () => ({}) };
const deferLoadManager = { deactivate: noop, activate: noop, refreshComponent: noop };
const attachmentUtils = { uploadAttachment: noop };
const stateUtils = { updateState: noop };
const storeValue = () => undefined;
const createPConnect = (_cfg: unknown) => ({ getPConnect: () => ({ getContextName: () => 'root', getValue: () => undefined }) });

// Build core stub
const coreStub = {
  getPubSubUtils: () => pubSubUtils,
  getLocaleUtils: () => localeUtils,
  getDataApiUtils: () => dataApiUtils,
  getMessageManager: () => messageManager,
  getEnvironmentInfo: () => environmentInfo,
  getConstants: () => constants,
  getAnnotationUtils: () => annotationUtils,
  getMetadataUtils: () => metadataUtils,
  getDeferLoadManager: () => deferLoadManager,
  getAttachmentUtils: () => attachmentUtils,
  getStateUtils: () => stateUtils,
  getStoreValue: storeValue,
  createPConnect
};
// Attach to global/window
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).PCore = coreStub;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).PCore = coreStub;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).PConnect = function () { return undefined; };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).getPConnect = () => ({ getContextName: () => 'root' });

// Stub global fetch for sdk-config.json to avoid 404 noise during unit tests.
const originalFetch = (globalThis as any).fetch;
(globalThis as any).fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString();
  if (url.includes('sdk-config.json')) {
    return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
  }
  if (originalFetch) {
    return originalFetch(input as any, init as any);
  }
  // Minimal fallback for environments without fetch
  return Promise.resolve(new Response('OK', { status: 200 }));
};
