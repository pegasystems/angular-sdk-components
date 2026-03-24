// Global setup runs before any tests
const mockLocaleValue = (value: string) => {
  if (value === 'month_placeholder') return 'MM';
  if (value === 'day_placeholder') return 'DD';
  if (value === 'year_placeholder') return 'YYYY';
  return value;
};

export function setup() {
  (globalThis as any).PCore = {
    getEnvironmentInfo: () => ({
      getTimeZone: () => 'UTC',
      getLocale: () => 'en-US',
      getUseLocale: () => 'en-US',
      getKeyMapping: () => null
    }),
    getLocaleUtils: () => ({
      getLocaleValue: mockLocaleValue
    }),
    getDataApiUtils: () => ({
      getData: () => Promise.resolve({ data: { data: [] } })
    }),
    getConstants: () => ({
      LIST_SELECTION_MODE: { SINGLE: 'single', MULTI: 'multi', MULTI_ON_HOVER: 'multi-on-hover' },
      PUB_SUB_EVENTS: { EVENT_DASHBOARD_FILTER_CLEAR_ALL: 'EVENT_DASHBOARD_FILTER_CLEAR_ALL' },
      WORKLIST: 'worklist'
    }),
    getMetadataUtils: () => ({ getPropertyMetadata: () => null }),
    getAnalyticsUtils: () => ({
      getDataViewMetadata: () => Promise.resolve({ data: { fields: [], classID: '' } }),
      getFieldsForDataSource: () => Promise.resolve({ data: { data: [] } })
    }),
    getAnnotationUtils: () => ({ getPropertyName: (val: any) => val }),
    getPubSubUtils: () => ({ subscribe: () => {}, unsubscribe: () => {}, publish: () => {} }),
    getEvents: () => ({ getTransientEvent: () => ({ UPDATE_PROMOTED_FILTERS: 'UPDATE_PROMOTED_FILTERS' }) }),
    getRuntimeParamsAPI: () => ({ getRuntimeParams: () => ({}) }),
    setBehaviorOverride: () => {},
    getDataPageUtils: () => ({ getDataAsync: () => Promise.resolve({ data: [] }) })
  };
}
