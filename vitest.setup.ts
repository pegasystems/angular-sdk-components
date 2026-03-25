// IMPORTANT: Set up PCore global mock BEFORE any imports to ensure it's available
// when modules are evaluated. This is necessary because some Angular components
// use PCore in class field initializers which run at module load time.

const mockLocaleValue = (value: string) => {
  if (value === 'month_placeholder') return 'MM';
  if (value === 'day_placeholder') return 'DD';
  if (value === 'year_placeholder') return 'YYYY';
  return value;
};

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
  getDataApi: () => ({
    init: () => Promise.resolve({ data: [] })
  }),
  getConstants: () => ({
    LIST_SELECTION_MODE: {
      SINGLE: 'single',
      MULTI: 'multi',
      MULTI_ON_HOVER: 'multi-on-hover'
    },
    PUB_SUB_EVENTS: {
      EVENT_DASHBOARD_FILTER_CLEAR_ALL: 'EVENT_DASHBOARD_FILTER_CLEAR_ALL'
    },
    WORKLIST: 'worklist',
    WORKCLASS: 'Work-',
    CASE_INFO: { CASE_INFO_CLASSID: '.pyCaseInfo.pzInsKey' },
    RESOURCE_TYPES: { DATA: 'DATA' }
  }),
  getMetadataUtils: () => ({
    getPropertyMetadata: () => null
  }),
  getAnalyticsUtils: () => ({
    getDataViewMetadata: () => Promise.resolve({ data: { fields: [], classID: '' } }),
    getFieldsForDataSource: () => Promise.resolve({ data: { data: [] } })
  }),
  getAnnotationUtils: () => ({
    getPropertyName: (val: any) => val,
    isProperty: () => false
  }),
  getPubSubUtils: () => ({
    subscribe: () => {},
    unsubscribe: () => {},
    publish: () => {}
  }),
  getEvents: () => ({
    getTransientEvent: () => ({
      UPDATE_PROMOTED_FILTERS: 'UPDATE_PROMOTED_FILTERS'
    })
  }),
  getRuntimeParamsAPI: () => ({
    getRuntimeParams: () => ({})
  }),
  setBehaviorOverride: () => {},
  getDataPageUtils: () => ({
    getDataAsync: () => Promise.resolve({ data: [] })
  }),
  getRestClient: () => ({
    invokeRestApi: () => Promise.resolve({ data: {} })
  }),
  getDataTypeUtils: () => ({
    getLookUpDataPageInfo: () => null,
    getLookUpDataPage: () => null
  }),
  getSemanticUrlUtils: () => ({
    getActions: () => ({
      ACTION_OPENWORKBYHANDLE: 'openWorkByHandle',
      ACTION_SHOWDATA: 'showData',
      ACTION_GETOBJECT: 'getObject'
    }),
    getResolvedSemanticURL: () => ''
  })
};

// Mock google maps API
(globalThis as any).google = {
  maps: {
    places: {
      AutocompleteService: class {
        getPlacePredictions() {
          return Promise.resolve({ predictions: [] });
        }
      }
    },
    Geocoder: class {
      geocode() {
        return Promise.resolve({ results: [] });
      }
    },
    LatLng: class {
      constructor(
        public lat: number,
        public lng: number
      ) {}
    }
  }
};

// Now import zone.js setup after PCore is defined
import '@analogjs/vitest-angular/setup-zone';

// Mock global objects that Angular components might need
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => ''
  })
});
