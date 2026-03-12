import { AutoCompleteLogic, IOption } from './auto-complete-logic';

describe('AutoCompleteLogic', () => {
  let logic: AutoCompleteLogic;

  beforeEach(() => {
    logic = new AutoCompleteLogic();
  });

  describe('filterOptions', () => {
    const mockOptions: IOption[] = [
      { key: '1', value: 'Option 1' },
      { key: '2', value: 'Option 2' },
      { key: '3', value: 'Another Value' }
    ];

    it('should filter options by value (case insensitive)', () => {
      const result = logic.filterOptions(mockOptions, 'option');
      expect(result.length).toBe(2);
    });

    it('should return all options when filter is empty', () => {
      const result = logic.filterOptions(mockOptions, '');
      expect(result.length).toBe(3);
    });

    it('should return empty array when no matches found', () => {
      const result = logic.filterOptions(mockOptions, 'xyz');
      expect(result.length).toBe(0);
    });

    it('should handle undefined options', () => {
      const result = logic.filterOptions(undefined as any, 'test');
      expect(result).toEqual([]);
    });

    it('should handle null filter value', () => {
      const result = logic.filterOptions(mockOptions, null as any);
      expect(result.length).toBe(3);
    });
  });

  describe('flattenParameters', () => {
    it('should flatten parameters object', () => {
      const params = {
        param1: { name: 'paramName1', value: 'value1' },
        param2: { name: 'paramName2', value: 'value2' }
      };

      const result = logic.flattenParameters(params);

      expect(result).toEqual({
        paramName1: 'value1',
        paramName2: 'value2'
      });
    });

    it('should return empty object for empty params', () => {
      const result = logic.flattenParameters({});
      expect(result).toEqual({});
    });

    it('should handle undefined params', () => {
      const result = logic.flattenParameters(undefined as any);
      expect(result).toEqual({});
    });

    it('should handle null params', () => {
      const result = logic.flattenParameters(null as any);
      expect(result).toEqual({});
    });
  });

  describe('preProcessColumns', () => {
    it('should remove leading dot from column values', () => {
      const columns = [
        { value: '.fieldName' },
        { value: 'normalField' }
      ];

      const result = logic.preProcessColumns(columns);

      expect(result[0].value).toBe('fieldName');
      expect(result[1].value).toBe('normalField');
    });

    it('should handle empty column list', () => {
      const result = logic.preProcessColumns([]);
      expect(result).toEqual([]);
    });

    it('should handle undefined column list', () => {
      const result = logic.preProcessColumns(undefined as any);
      expect(result).toBeUndefined();
    });

    it('should handle null column list', () => {
      const result = logic.preProcessColumns(null as any);
      expect(result).toBeNull();
    });

    it('should handle columns with null values', () => {
      const columns = [{ value: null }, { value: '.test' }];
      const result = logic.preProcessColumns(columns);
      expect(result[0].value).toBeNull();
      expect(result[1].value).toBe('test');
    });
  });

  describe('getDisplayFieldsMetaData', () => {
    it('should extract metadata from column list', () => {
      const columns = [
        { key: 'true', value: 'id' },
        { display: 'true', primary: 'true', value: 'name' },
        { display: 'true', value: 'description' }
      ];

      const result = logic.getDisplayFieldsMetaData(columns);

      expect(result.key).toBe('id');
      expect(result.primary).toBe('name');
      expect(result.secondary).toContain('description');
    });

    it('should set key to "auto" when no key column exists', () => {
      const columns = [{ display: 'true', primary: 'true', value: 'name' }];

      const result = logic.getDisplayFieldsMetaData(columns);

      expect(result.key).toBe('auto');
    });

    it('should handle empty columns', () => {
      const result = logic.getDisplayFieldsMetaData([]);

      expect(result.key).toBe('auto');
      expect(result.primary).toBe('');
      expect(result.secondary).toEqual([]);
    });

    it('should handle undefined columns', () => {
      const result = logic.getDisplayFieldsMetaData(undefined as any);

      expect(result.key).toBe('auto');
      expect(result.primary).toBe('');
      expect(result.secondary).toEqual([]);
    });

    it('should collect multiple secondary columns', () => {
      const columns = [
        { key: 'true', value: 'id' },
        { display: 'true', primary: 'true', value: 'name' },
        { display: 'true', value: 'desc1' },
        { display: 'true', value: 'desc2' }
      ];

      const result = logic.getDisplayFieldsMetaData(columns);

      expect(result.secondary).toEqual(['desc1', 'desc2']);
    });
  });

  describe('findOptionKey', () => {
    const mockOptions: IOption[] = [
      { key: '1', value: 'Option 1' },
      { key: '2', value: 'Option 2' }
    ];

    it('should find key when option value matches', () => {
      const result = logic.findOptionKey(mockOptions, 'Option 1');
      expect(result).toBe('1');
    });

    it('should return value when no match found', () => {
      const result = logic.findOptionKey(mockOptions, 'Unknown');
      expect(result).toBe('Unknown');
    });

    it('should return empty string for null value', () => {
      const result = logic.findOptionKey(mockOptions, null as any);
      expect(result).toBe('');
    });

    it('should return empty string for empty value', () => {
      const result = logic.findOptionKey(mockOptions, '');
      expect(result).toBe('');
    });

    it('should handle undefined options', () => {
      const result = logic.findOptionKey(undefined as any, 'test');
      expect(result).toBe('test');
    });
  });

  describe('findOptionValue', () => {
    const mockOptions: IOption[] = [
      { key: '1', value: 'Option 1' },
      { key: '2', value: 'Option 2' }
    ];

    it('should find value when key matches', () => {
      const result = logic.findOptionValue(mockOptions, '1');
      expect(result).toBe('Option 1');
    });

    it('should return undefined when no match found', () => {
      const result = logic.findOptionValue(mockOptions, 'unknown');
      expect(result).toBeUndefined();
    });

    it('should handle undefined options', () => {
      const result = logic.findOptionValue(undefined as any, '1');
      expect(result).toBeUndefined();
    });

    it('should handle undefined key', () => {
      const result = logic.findOptionValue(mockOptions, undefined as any);
      expect(result).toBeUndefined();
    });
  });

  describe('getDisplayValue', () => {
    const mockOptions: IOption[] = [
      { key: '1', value: 'Option 1' },
      { key: '2', value: 'Option 2' }
    ];

    it('should return display value when key matches', () => {
      const result = logic.getDisplayValue(mockOptions, '1');
      expect(result).toBe('Option 1');
    });

    it('should return key when no match found', () => {
      const result = logic.getDisplayValue(mockOptions, 'unknown-key');
      expect(result).toBe('unknown-key');
    });

    it('should handle undefined options', () => {
      const result = logic.getDisplayValue(undefined as any, '1');
      expect(result).toBe('1');
    });
  });

  describe('buildOptionsFromResults', () => {
    const columns = [
      { key: 'true', value: 'id' },
      { display: 'true', primary: 'true', value: 'name' }
    ];

    it('should build options from results', () => {
      const results = [
        { id: '1', name: 'Test 1' },
        { id: '2', name: 'Test 2' }
      ];

      const result = logic.buildOptionsFromResults(results, columns);

      expect(result).toEqual([
        { key: '1', value: 'Test 1' },
        { key: '2', value: 'Test 2' }
      ]);
    });

    it('should handle empty results', () => {
      const result = logic.buildOptionsFromResults([], columns);
      expect(result).toEqual([]);
    });

    it('should handle undefined results', () => {
      const result = logic.buildOptionsFromResults(undefined as any, columns);
      expect(result).toEqual([]);
    });

    it('should handle null results', () => {
      const result = logic.buildOptionsFromResults(null as any, columns);
      expect(result).toEqual([]);
    });

    it('should use pyGUID when key column value is missing', () => {
      const results = [{ pyGUID: 'guid-1', name: 'Test 1' }];
      const columnsWithMissingKey = [
        { key: 'true', value: 'missingField' },
        { display: 'true', primary: 'true', value: 'name' }
      ];

      const result = logic.buildOptionsFromResults(results, columnsWithMissingKey);

      expect(result[0].key).toBe('guid-1');
    });

    it('should convert numeric values to string', () => {
      const results = [{ id: '1', name: 123 }];

      const result = logic.buildOptionsFromResults(results, columns);

      expect(result[0].value).toBe('123');
    });
  });

  describe('processDeferredDatasource', () => {
    it('should process valid datasource metadata', () => {
      const metadata = {
        datasource: {
          name: 'D_TestDatapage',
          parameters: {
            param1: { name: 'testParam', value: 'testValue' }
          },
          propertyForDisplayText: 'DisplayName',
          propertyForValue: 'ValueProp'
        }
      };

      const result = logic.processDeferredDatasource(metadata);

      expect(result).not.toBeNull();
      expect(result?.listType).toBe('datapage');
      expect(result?.datasource).toBe('D_TestDatapage');
      expect(result?.parameters).toEqual({ testParam: 'testValue' });
      expect(result?.columns.length).toBe(2);
    });

    it('should remove @P prefix from property names', () => {
      const metadata = {
        datasource: {
          name: 'D_Test',
          parameters: {},
          propertyForDisplayText: '@P .DisplayName',
          propertyForValue: '@P .ValueProp'
        }
      };

      const result = logic.processDeferredDatasource(metadata);

      expect(result?.columns[0].value).toBe('.ValueProp');
      expect(result?.columns[1].value).toBe('.DisplayName');
    });

    it('should return null for null metadata', () => {
      const result = logic.processDeferredDatasource(null);
      expect(result).toBeNull();
    });

    it('should return null for undefined metadata', () => {
      const result = logic.processDeferredDatasource(undefined);
      expect(result).toBeNull();
    });

    it('should return null when datasource name is missing', () => {
      const metadata = {
        datasource: {
          parameters: {}
        }
      };

      const result = logic.processDeferredDatasource(metadata);
      expect(result).toBeNull();
    });
  });

  describe('generateColumnsAndDataSource', () => {
    it('should return config values when deferDatasource is false', () => {
      const result = logic.generateColumnsAndDataSource(
        'D_ConfigDatapage',
        [{ value: 'col1' }],
        false,
        null
      );

      expect(result.datasource).toBe('D_ConfigDatapage');
      expect(result.columns).toEqual([{ value: 'col1' }]);
      expect(result.listType).toBeUndefined();
    });

    it('should process deferred datasource when available', () => {
      const metadata = {
        datasource: {
          name: 'D_DeferredDatapage',
          parameters: { p1: { name: 'param1', value: 'val1' } },
          propertyForDisplayText: 'Name',
          propertyForValue: 'ID'
        }
      };

      const result = logic.generateColumnsAndDataSource(
        'D_ConfigDatapage',
        [{ value: 'col1' }],
        true,
        metadata
      );

      expect(result.datasource).toBe('D_DeferredDatapage');
      expect(result.listType).toBe('datapage');
      expect(result.parameters).toEqual({ param1: 'val1' });
    });

    it('should fallback to config when deferred metadata is invalid', () => {
      const result = logic.generateColumnsAndDataSource(
        'D_ConfigDatapage',
        [{ value: 'col1' }],
        true,
        { datasource: {} } // Invalid - no name
      );

      expect(result.datasource).toBe('D_ConfigDatapage');
      expect(result.columns).toEqual([{ value: 'col1' }]);
    });
  });
});
