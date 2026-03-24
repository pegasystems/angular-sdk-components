import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  preProcessColumns,
  getDisplayFieldsMetaData,
  doSearch,
  setValuesToPropertyList,
  getGroupDataForItemsTree,
  setVisibilityForList
} from './utils';

// Mock PCore
(globalThis as any).PCore = {
  getConstants: () => ({
    LIST_SELECTION_MODE: {
      MULTI: 'multi'
    }
  })
};

describe('multiselect utils', () => {
  describe('setVisibilityForList', () => {
    it('should call setVisibility when selectionMode is MULTI and selectionList exists', () => {
      const setVisibilitySpy = vi.fn();
      const mockC11nEnv = {
        getComponentConfig: () => ({
          selectionMode: 'multi',
          selectionList: '.SelectedItems',
          renderMode: '',
          referenceList: ''
        }),
        getListActions: () => ({
          setVisibility: setVisibilitySpy
        })
      };

      setVisibilityForList(mockC11nEnv, true);
      expect(setVisibilitySpy).toHaveBeenCalledWith(true);
    });

    it('should call setVisibility when renderMode is Editable and referenceList exists', () => {
      const setVisibilitySpy = vi.fn();
      const mockC11nEnv = {
        getComponentConfig: () => ({
          selectionMode: '',
          selectionList: '',
          renderMode: 'Editable',
          referenceList: '.ReferenceList'
        }),
        getListActions: () => ({
          setVisibility: setVisibilitySpy
        })
      };

      setVisibilityForList(mockC11nEnv, false);
      expect(setVisibilitySpy).toHaveBeenCalledWith(false);
    });

    it('should not call setVisibility when conditions are not met', () => {
      const setVisibilitySpy = vi.fn();
      const mockC11nEnv = {
        getComponentConfig: () => ({
          selectionMode: 'single',
          selectionList: '',
          renderMode: 'ReadOnly',
          referenceList: ''
        }),
        getListActions: () => ({
          setVisibility: setVisibilitySpy
        })
      };

      setVisibilityForList(mockC11nEnv, true);
      expect(setVisibilitySpy).not.toHaveBeenCalled();
    });
  });

  describe('preProcessColumns', () => {
    it('should remove leading dot from column values', () => {
      const columns = [
        { value: '.Name', display: 'true' },
        { value: '.Description', display: 'true' },
        { value: 'NoLeadingDot', display: 'true' }
      ];

      const result = preProcessColumns(columns);

      expect(result[0].value).toBe('Name');
      expect(result[1].value).toBe('Description');
      expect(result[2].value).toBe('NoLeadingDot');
    });

    it('should remove leading dot from setProperty', () => {
      const columns = [{ value: 'Name', setProperty: '.TargetProp' }];

      const result = preProcessColumns(columns);

      expect(result[0].setProperty).toBe('TargetProp');
    });

    it('should handle columns without leading dot in setProperty', () => {
      const columns = [{ value: 'Name', setProperty: 'TargetProp' }];

      const result = preProcessColumns(columns);

      expect(result[0].setProperty).toBe('TargetProp');
    });

    it('should return undefined for null/undefined input', () => {
      expect(preProcessColumns(null)).toBeUndefined();
      expect(preProcessColumns(undefined)).toBeUndefined();
    });
  });

  describe('getDisplayFieldsMetaData', () => {
    it('should extract key, primary and secondary fields', () => {
      const columns = [
        { key: 'true', value: 'pyGUID' },
        { display: 'true', primary: 'true', value: 'Name' },
        { display: 'true', secondary: 'true', value: 'Description' }
      ];

      const result = getDisplayFieldsMetaData(columns);

      expect(result.key).toBe('pyGUID');
      expect(result.primary).toBe('Name');
      expect(result.secondary).toContain('Description');
    });

    it('should default key to "auto" when no key column', () => {
      const columns = [{ display: 'true', primary: 'true', value: 'Name' }];

      const result = getDisplayFieldsMetaData(columns);

      expect(result.key).toBe('auto');
    });

    it('should extract itemsRecordsColumn', () => {
      const columns = [
        { display: 'true', primary: 'true', value: 'Name' },
        { itemsRecordsColumn: 'true', value: 'Items' }
      ];

      const result = getDisplayFieldsMetaData(columns);

      expect(result.itemsRecordsColumn).toBe('Items');
    });

    it('should extract itemsGroupKeyColumn', () => {
      const columns = [
        { display: 'true', primary: 'true', value: 'Name' },
        { itemsGroupKeyColumn: 'true', value: 'GroupKey' }
      ];

      const result = getDisplayFieldsMetaData(columns);

      expect(result.itemsGroupKeyColumn).toBe('GroupKey');
    });

    it('should handle null/undefined columns', () => {
      const result = getDisplayFieldsMetaData(null);
      expect(result.key).toBe('auto');
      expect(result.primary).toBe('');
      expect(result.secondary).toEqual([]);
    });
  });

  describe('getGroupDataForItemsTree', () => {
    it('should transform group data to items tree format', () => {
      const groupDataSource = [
        { id: 'g1', name: 'Group 1', desc: 'Description 1' },
        { id: 'g2', name: 'Group 2', desc: 'Description 2' }
      ];
      const groupsDisplayFieldMeta = {
        key: 'id',
        primary: 'name',
        secondary: ['desc']
      };

      const result = getGroupDataForItemsTree(groupDataSource, groupsDisplayFieldMeta, false);

      expect(result.length).toBe(2);
      expect(result[0].id).toBe('g1');
      expect(result[0].primary).toBe('Group 1');
      expect(result[0].secondary).toEqual(['Description 1']);
      expect(result[0].items).toEqual([]);
    });

    it('should hide secondary when showSecondaryInSearchOnly is true', () => {
      const groupDataSource = [{ id: 'g1', name: 'Group 1', desc: 'Description 1' }];
      const groupsDisplayFieldMeta = {
        key: 'id',
        primary: 'name',
        secondary: ['desc']
      };

      const result = getGroupDataForItemsTree(groupDataSource, groupsDisplayFieldMeta, true);

      expect(result[0].secondary).toEqual([]);
    });

    it('should return undefined for null/undefined groupDataSource', () => {
      const result = getGroupDataForItemsTree(null, { key: 'id', primary: 'name', secondary: [] }, false);
      expect(result).toBeUndefined();
    });
  });

  describe('setValuesToPropertyList', () => {
    it('should set values to property list', () => {
      const updateFieldValueSpy = vi.fn();
      const columns = [
        { value: 'pyGUID', setProperty: 'Associated property', key: 'true' },
        { value: 'Name', setProperty: 'DisplayName', primary: 'true' }
      ];
      const items = [{ id: 'guid1' }, { id: 'guid2' }];
      const actions = { updateFieldValue: updateFieldValueSpy };

      const result = setValuesToPropertyList('searchText', '.AssocProp', items, columns, actions, true);

      expect(updateFieldValueSpy).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should use searchText for primary property', () => {
      const updateFieldValueSpy = vi.fn();
      const columns = [{ value: 'Name', setProperty: 'DisplayName', primary: 'true' }];
      const items = [null]; // null item should use searchText
      const actions = { updateFieldValue: updateFieldValueSpy };

      const result = setValuesToPropertyList('searchText', '.AssocProp', items, columns, actions, true);

      expect(result).toContain('searchText');
    });

    it('should handle empty setPropertyList', () => {
      const updateFieldValueSpy = vi.fn();
      const columns = [{ value: 'Name', display: 'true' }]; // no setProperty
      const items = [{ id: 'guid1' }];
      const actions = { updateFieldValue: updateFieldValueSpy };

      const result = setValuesToPropertyList('searchText', '.AssocProp', items, columns, actions, true);

      expect(updateFieldValueSpy).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should not update redux when updatePropertyInRedux is false', () => {
      const updateFieldValueSpy = vi.fn();
      const columns = [{ value: 'pyGUID', setProperty: 'Associated property', key: 'true' }];
      const items = [{ id: 'guid1' }];
      const actions = { updateFieldValue: updateFieldValueSpy };

      setValuesToPropertyList('searchText', '.AssocProp', items, columns, actions, false);

      expect(updateFieldValueSpy).not.toHaveBeenCalled();
    });

    it('should update non-associated property with dot prefix', () => {
      const updateFieldValueSpy = vi.fn();
      const columns = [{ value: 'Name', setProperty: 'CustomProp', primary: 'true' }];
      const items = [{ id: 'guid1' }];
      const actions = { updateFieldValue: updateFieldValueSpy };

      setValuesToPropertyList('searchText', '.AssocProp', items, columns, actions, true);

      expect(updateFieldValueSpy).toHaveBeenCalledWith('.CustomProp', expect.any(Array), expect.any(Object));
    });
  });

  describe('doSearch', () => {
    it('should return itemsTree when dataApiObj is null', async () => {
      const itemsTree = [{ id: '1', primary: 'Item 1' }];
      const result = await doSearch('search', '', '', {}, null, itemsTree, false, false, []);
      expect(result).toEqual(itemsTree);
    });

    it('should return itemsTree when listObjData is undefined', async () => {
      const mockDataApiObj = {
        fetchData: vi.fn().mockResolvedValue({ data: undefined })
      };
      const itemsTree = [{ id: '1', primary: 'Item 1' }];
      const displayFieldMeta = { key: 'id', primary: 'name', secondary: [] };

      const result = await doSearch('search', '', '', displayFieldMeta, mockDataApiObj, itemsTree, false, false, []);

      expect(result).toEqual(itemsTree);
    });

    it('should return empty array when listObjData is empty', async () => {
      const mockDataApiObj = {
        fetchData: vi.fn().mockResolvedValue({ data: [] })
      };
      const displayFieldMeta = { key: 'id', primary: 'name', secondary: [] };

      const result = await doSearch('search', '', '', displayFieldMeta, mockDataApiObj, [], false, false, []);

      expect(result).toEqual([]);
    });

    it('should transform search results to tree objects', async () => {
      const mockDataApiObj = {
        fetchData: vi.fn().mockResolvedValue({
          data: [
            { id: '1', name: 'Item 1', desc: 'Desc 1' },
            { id: '2', name: 'Item 2', desc: 'Desc 2' }
          ]
        })
      };
      const displayFieldMeta = { key: 'id', primary: 'name', secondary: ['desc'] };

      const result = await doSearch('search', '', '', displayFieldMeta, mockDataApiObj, [], false, false, []);

      expect(result.length).toBe(2);
      expect(result[0].id).toBe('1');
      expect(result[0].primary).toBe('Item 1');
    });

    it('should show secondary data based on showSecondaryInSearchOnly and searchText', async () => {
      const mockDataApiObj = {
        fetchData: vi.fn().mockResolvedValue({
          data: [{ id: '1', name: 'Item 1', desc: 'Desc 1' }]
        })
      };
      const displayFieldMeta = { key: 'id', primary: 'name', secondary: ['desc'] };

      // With searchText and showSecondaryInSearchOnly=true, should show secondary
      const result = await doSearch('search', '', '', displayFieldMeta, mockDataApiObj, [], false, true, []);

      expect(result[0].secondary).toEqual(['Desc 1']);
    });

    it('should hide secondary data when showSecondaryInSearchOnly is true and no searchText', async () => {
      const mockDataApiObj = {
        fetchData: vi.fn().mockResolvedValue({
          data: [{ id: '1', name: 'Item 1', desc: 'Desc 1' }]
        })
      };
      const displayFieldMeta = { key: 'id', primary: 'name', secondary: ['desc'] };

      // Without searchText and showSecondaryInSearchOnly=true, should hide secondary
      const result = await doSearch('', '', '', displayFieldMeta, mockDataApiObj, [], false, true, []);

      expect(result[0].secondary).toEqual([]);
    });

    it('should mark items as selected when in selected array', async () => {
      const mockDataApiObj = {
        fetchData: vi.fn().mockResolvedValue({
          data: [{ id: '1', name: 'Item 1' }]
        })
      };
      const displayFieldMeta = { key: 'id', primary: 'name', secondary: [] };
      const selected = [{ id: '1' }];

      const result = await doSearch('', '', '', displayFieldMeta, mockDataApiObj, [], false, false, selected);

      expect(result[0].selected).toBe(true);
    });

    it('should handle grouped data search with no searchText and no clickedGroup', async () => {
      const mockDataApiObj = {
        parameters: { param1: '', param2: '' },
        fetchData: vi.fn().mockResolvedValue({ data: [] })
      };
      const itemsTree = [{ id: 'g1', items: [] }];
      const displayFieldMeta = { key: 'id', primary: 'name', secondary: [] };

      const result = await doSearch('', '', 'TestClass', displayFieldMeta, mockDataApiObj, itemsTree, true, false, []);

      // Should return itemsTree early
      expect(result).toEqual(itemsTree);
    });

    it('should handle grouped data search with clickedGroup and existing items', async () => {
      const mockDataApiObj = {
        parameters: { param1: '', param2: '' },
        fetchData: vi.fn().mockResolvedValue({ data: [] })
      };
      const itemsTree = [{ id: 'g1', items: [{ id: '1' }] }];
      const displayFieldMeta = { key: 'id', primary: 'name', secondary: [] };

      const result = await doSearch('', 'g1', 'TestClass', displayFieldMeta, mockDataApiObj, itemsTree, true, false, []);

      // Should return itemsTree since group already has items
      expect(result).toEqual(itemsTree);
    });

    it('should handle fetch error gracefully', async () => {
      const mockDataApiObj = {
        fetchData: vi.fn().mockRejectedValue(new Error('Fetch error'))
      };
      const displayFieldMeta = { key: 'id', primary: 'name', secondary: [] };
      const itemsTree = [{ id: '1' }];

      const result = await doSearch('search', '', '', displayFieldMeta, mockDataApiObj, itemsTree, false, false, []);

      expect(result).toEqual(itemsTree);
    });
  });
});
