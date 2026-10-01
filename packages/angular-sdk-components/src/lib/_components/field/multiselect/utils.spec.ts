import { vi } from 'vitest';
import { doSearch, getDisplayFieldsMetaData, getGroupDataForItemsTree, preProcessColumns, setValuesToPropertyList } from './utils';

describe('multiselect utils', () => {
  it('preProcessColumns strips the leading dot from value and setProperty', () => {
    const out = preProcessColumns([{ value: '.Name', setProperty: '.Target', other: 1 }, { value: 'Plain' }, { value: 5 }]);
    expect(out[0]).toEqual({ value: 'Name', setProperty: 'Target', other: 1 });
    expect(out[1].value).toBe('Plain');
    expect(out[2].value).toBe(5);
  });

  it('getDisplayFieldsMetaData reads key, primary and secondary display columns', () => {
    const meta = getDisplayFieldsMetaData([
      { value: 'Id', key: 'true' },
      { value: 'Name', display: 'true', primary: 'true' },
      { value: 'Desc', display: 'true', secondary: 'true' },
      { value: 'Hidden', secondary: 'true' },
      { value: 'Items', itemsRecordsColumn: 'true' },
      { value: 'Grp', itemsGroupKeyColumn: 'true' }
    ]);
    expect(meta).toEqual({ key: 'Id', primary: 'Name', secondary: ['Desc'], itemsRecordsColumn: 'Items', itemsGroupKeyColumn: 'Grp' });
  });

  it('getDisplayFieldsMetaData falls back to key "auto"', () => {
    expect(getDisplayFieldsMetaData([{ value: 'Name', display: 'true', primary: 'true' }]).key).toBe('auto');
  });

  it('getGroupDataForItemsTree maps groups and hides secondary data when requested', () => {
    const meta = { key: 'id', primary: 'name', secondary: ['d'] };
    const groups = [{ id: 1, name: 'G', d: 'desc' }];
    expect(getGroupDataForItemsTree(groups, meta, false)).toEqual([{ id: 1, primary: 'G', secondary: ['desc'], items: [] }]);
    expect(getGroupDataForItemsTree(groups, meta, true)[0].secondary).toEqual([]);
    expect(getGroupDataForItemsTree(undefined, meta, false)).toBeUndefined();
  });

  describe('doSearch', () => {
    const meta = { key: 'id', primary: 'name', secondary: ['d'] };
    const data = [
      { id: 1, name: 'One', d: 'x' },
      { id: 2, name: 'Two', d: 'y' }
    ];

    it('returns the existing tree without a data API', async () => {
      const tree = [{ id: 'keep' }];
      expect(await doSearch('', '', '', meta, undefined, tree, false, false, [])).toBe(tree);
    });

    it('maps fetched rows to tree items and flags selected ones', async () => {
      const dataApiObj = { fetchData: vi.fn(() => Promise.resolve({ data })) };
      const res = await doSearch('o', '', '', meta, dataApiObj, [], false, false, [{ id: 2 }]);
      expect(dataApiObj.fetchData).toHaveBeenCalledWith('o');
      expect(res).toEqual([
        { id: 1, primary: 'One', secondary: ['x'], selected: false },
        { id: 2, primary: 'Two', secondary: ['y'], selected: true }
      ]);
    });

    it('hides secondary data when showSecondaryInSearchOnly and no search text', async () => {
      const dataApiObj = { fetchData: () => Promise.resolve({ data }) };
      const res = await doSearch('', '', '', meta, dataApiObj, [], false, true, []);
      expect(res[0].secondary).toEqual([]);
    });

    it('returns an empty list for empty results and the tree on fetch failure', async () => {
      expect(await doSearch('', '', '', meta, { fetchData: () => Promise.resolve({ data: [] }) }, [{ id: 'k' }], false, false, [])).toEqual([]);
      const tree = [{ id: 'k' }];
      expect(await doSearch('', '', '', meta, { fetchData: () => Promise.reject(new Error('x')) }, tree, false, false, [])).toBe(tree);
    });

    it('grouped data without search text or group returns the tree untouched', async () => {
      const tree = [{ id: 'g' }];
      const dataApiObj = { fetchData: vi.fn(), parameters: {} };
      expect(await doSearch('', '', 'Cls', meta, dataApiObj, tree, true, false, [])).toBe(tree);
      expect(dataApiObj.fetchData).not.toHaveBeenCalled();
    });

    it('grouped data without search text loads group items into the matching group', async () => {
      const gmeta = { key: 'id', primary: 'name', secondary: [], itemsRecordsColumn: 'rows', itemsGroupKeyColumn: 'gid' };
      const dataApiObj = {
        parameters: { a: '', b: '' },
        fetchData: () => Promise.resolve({ data: [{ gid: 'g1', rows: [{ id: 5, name: 'Five' }] }] })
      };
      const res = await doSearch(
        '',
        'g1',
        'Cls',
        gmeta,
        dataApiObj,
        [
          { id: 'g1', items: [] },
          { id: 'g2', items: [] }
        ],
        true,
        false,
        []
      );
      expect(res[0].items).toEqual([{ id: 5, primary: 'Five', secondary: [], selected: false }]);
      expect(res[1].items).toEqual([]);
    });

    it('grouped search flattens the record columns', async () => {
      const gmeta = { key: 'id', primary: 'name', secondary: [], itemsRecordsColumn: 'rows' };
      const dataApiObj = {
        parameters: { a: '', b: '' },
        fetchData: () => Promise.resolve({ data: [{ rows: [{ id: 1, name: 'A' }] }, { rows: [{ id: 2, name: 'B' }] }] })
      };
      const res = await doSearch('q', '', 'Cls', gmeta, dataApiObj, [], true, false, []);
      expect(res.map(r => r.primary)).toEqual(['A', 'B']);
    });
  });

  describe('setValuesToPropertyList', () => {
    const columns = [
      { value: 'Id', setProperty: 'Target', key: 'true' },
      { value: 'Name', primary: 'true' }
    ];

    it('collects item ids and pushes them to the redux property', () => {
      const actions = { updateFieldValue: vi.fn() };
      const out = setValuesToPropertyList('txt', '.assoc', [{ id: 'a' }, { id: 'b' }], columns, actions);
      expect(out).toEqual(['a', 'b']);
      expect(actions.updateFieldValue).toHaveBeenCalledWith('.Target', ['a', 'b'], { isArrayDeepMerge: false });
    });

    it('uses the association property when the target is "Associated property"', () => {
      const actions = { updateFieldValue: vi.fn() };
      setValuesToPropertyList('', '.assoc', [{ id: 'a' }], [{ value: 'Id', setProperty: 'Associated property', key: 'true' }], actions);
      expect(actions.updateFieldValue).toHaveBeenCalledWith('.assoc', ['a'], { isArrayDeepMerge: false });
    });

    it('does not update redux when updatePropertyInRedux is false, and returns the search text for empty items', () => {
      const actions = { updateFieldValue: vi.fn() };
      const out = setValuesToPropertyList('txt', '.assoc', [null], [{ value: 'N', setProperty: 'T', primary: 'true' }], actions, false);
      expect(out).toEqual(['txt']);
      expect(actions.updateFieldValue).not.toHaveBeenCalled();
    });

    it('does nothing without setProperty columns', () => {
      const actions = { updateFieldValue: vi.fn() };
      expect(setValuesToPropertyList('t', '', [{ id: 1 }], [{ value: 'x' }], actions)).toEqual([]);
      expect(actions.updateFieldValue).not.toHaveBeenCalled();
    });
  });
});
