// Mock DatapageService before importing component
const mockDatapageService = {
  getDataPageData: jest.fn().mockResolvedValue([])
};

// Mock Angular's inject function
jest.mock('@angular/core', () => {
  const actual = jest.requireActual('@angular/core');
  return {
    ...actual,
    inject: jest.fn().mockReturnValue(mockDatapageService)
  };
});

import { AutoCompleteComponent } from './auto-complete.component';
import { FormControl, FormGroup } from '@angular/forms';

describe('AutoCompleteComponent', () => {
  let component: AutoCompleteComponent;

  beforeEach(() => {
    // Reset mock before each test
    mockDatapageService.getDataPageData.mockClear();

    component = new AutoCompleteComponent();
    component.fieldControl = new FormControl('');
    component.formGroup$ = new FormGroup({});
    component.options$ = [];
    component.filterValue = '';
    component.configProps$ = {
      value: '1',
      label: 'Test',
      listType: 'associated',
      datasource: [],
      columns: []
    } as any;
    component.actionsApi = {
      updateFieldValue: jest.fn(),
      triggerFieldChange: jest.fn()
    };
    component.propName = 'testProp';
    component.pConn$ = {
      getConfigProps: jest.fn().mockReturnValue({}),
      getContextName: jest.fn().mockReturnValue('app/primary_1'),
      getDataObject: jest.fn().mockReturnValue({})
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('setOptions', () => {
    const mockOptions = [
      { key: '1', value: 'Option 1' },
      { key: '2', value: 'Option 2' }
    ];

    it('should set options and update value when key matches', () => {
      component.configProps$ = { value: '1' } as any;
      component.setOptions(mockOptions);

      expect(component.options$).toEqual(mockOptions);
      expect(component.value$).toBe('Option 1');
    });

    it('should handle empty options', () => {
      component.configProps$ = { value: '1' } as any;
      component.setOptions([]);
      expect(component.options$).toEqual([]);
    });
  });

  describe('flattenParameters', () => {
    it('should flatten parameters object', () => {
      const params = {
        param1: { name: 'paramName1', value: 'value1' }
      };
      const result = component.flattenParameters(params);
      expect(result).toEqual({ paramName1: 'value1' });
    });

    it('should return empty object for undefined', () => {
      expect(component.flattenParameters(undefined)).toEqual({});
    });
  });

  describe('preProcessColumns', () => {
    it('should remove leading dot from column values', () => {
      const columns = [{ value: '.fieldName' }];
      const result = component.preProcessColumns(columns);
      expect(result[0].value).toBe('fieldName');
    });

    it('should handle undefined', () => {
      expect(component.preProcessColumns(undefined)).toBeUndefined();
    });
  });

  describe('getDisplayFieldsMetaData', () => {
    it('should extract metadata from columns', () => {
      const columns = [
        { key: 'true', value: 'id' },
        { display: 'true', primary: 'true', value: 'name' }
      ];
      const result = component.getDisplayFieldsMetaData(columns);
      expect(result.key).toBe('id');
      expect(result.primary).toBe('name');
    });

    it('should set key to auto when no key column', () => {
      const columns = [
        { display: 'true', primary: 'true', value: 'name' }
      ];
      const result = component.getDisplayFieldsMetaData(columns);
      expect(result.key).toBe('auto');
    });

    it('should handle empty columns', () => {
      const result = component.getDisplayFieldsMetaData([]);
      expect(result).toEqual({ key: 'auto', primary: '', secondary: [] });
    });
  });

  describe('fillOptions', () => {
    beforeEach(() => {
      component.columns = [
        { key: 'true', value: 'id' },
        { display: 'true', primary: 'true', value: 'name' }
      ] as any;
    });

    it('should populate options from results', () => {
      const results = [
        { id: '1', name: 'Test 1' },
        { id: '2', name: 'Test 2' }
      ];
      component.fillOptions(results);

      expect(component.options$).toEqual([
        { key: '1', value: 'Test 1' },
        { key: '2', value: 'Test 2' }
      ]);
    });

    it('should handle empty results', () => {
      component.fillOptions([]);
      expect(component.options$).toEqual([]);
    });

    it('should handle undefined results', () => {
      component.fillOptions(undefined);
      expect(component.options$).toEqual([]);
    });
  });

  describe('_filter', () => {
    const mockOptions = [
      { key: '1', value: 'Option 1' },
      { key: '2', value: 'Option 2' },
      { key: '3', value: 'Another Value' }
    ];

    beforeEach(() => {
      component.options$ = mockOptions;
    });

    it('should filter options by value (case insensitive)', () => {
      const result = (component as any)._filter('option');
      expect(result.length).toBe(2);
    });

    it('should return all options when filter is empty', () => {
      const result = (component as any)._filter('');
      expect(result.length).toBe(3);
    });

    it('should return empty array when no matches', () => {
      const result = (component as any)._filter('xyz');
      expect(result.length).toBe(0);
    });
  });

  describe('fieldOnChange', () => {
    it('should update filterValue', () => {
      const event = { target: { value: 'test input' } } as unknown as Event;
      component.fieldOnChange(event);
      expect(component.filterValue).toBe('test input');
    });

    it('should handle empty input', () => {
      const event = { target: { value: '' } } as unknown as Event;
      component.fieldOnChange(event);
      expect(component.filterValue).toBe('');
    });
  });

  describe('optionChanged', () => {
    const mockOptions = [
      { key: '1', value: 'Option 1' },
      { key: '2', value: 'Option 2' }
    ];

    beforeEach(() => {
      component.options$ = mockOptions;
    });

    it('should call updateFieldValue when option selected', () => {
      const event = { option: { value: 'Option 1' } };
      component.optionChanged(event);
      expect((component.actionsApi as any).updateFieldValue).toHaveBeenCalled();
    });

    it('should call triggerFieldChange when option selected', () => {
      const event = { option: { value: 'Option 1' } };
      component.optionChanged(event);
      expect((component.actionsApi as any).triggerFieldChange).toHaveBeenCalled();
    });
  });

  describe('generateColumnsAndDataSource', () => {
    it('should return config values when deferDatasource is false', () => {
      component.configProps$ = {
        datasource: 'D_TestDatapage',
        columns: [{ value: 'col1' }]
      } as any;
      component.pConn$ = {
        getConfigProps: jest.fn().mockReturnValue({ deferDatasource: false })
      } as any;

      const result = component.generateColumnsAndDataSource();

      expect(result.datasource).toBe('D_TestDatapage');
      expect(result.columns).toEqual([{ value: 'col1' }]);
    });
  });

  describe('DatapageService', () => {
    it('should have dataPageService available', () => {
      const service = (component as any).dataPageService;
      expect(service).toBeDefined();
    });
  });
});
