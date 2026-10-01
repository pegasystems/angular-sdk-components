import { FormGroup } from '@angular/forms';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { MultiselectComponent } from './multiselect.component';

describe('MultiselectComponent', () => {
  let component: MultiselectComponent;
  let fixture: ComponentFixture<MultiselectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MultiselectComponent]
    });
    fixture = TestBed.createComponent(MultiselectComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('MultiselectComponent behaviour', () => {
  const refCfg = {
    label: 'Pick many',
    required: true,
    placeholder: 'Search',
    referenceList: ['x'],
    selectionKey: '.Id',
    primaryField: '.Name',
    selectionList: '.Selected',
    listType: 'associated'
  };

  function setup(configProps: any, listActionsOverrides: any = {}) {
    const pConn = createMockPConn();
    pConn.getConfigProps = () => configProps;
    pConn.resolveConfigProps = (p: any) => p;
    pConn.getStateProps = () => ({ value: '.Field', selectionList: '.Selected' });
    const actions = { updateFieldValue: vi.fn(), triggerFieldChange: vi.fn() };
    pConn.getActionsApi = () => actions;
    pConn.clearErrorMessages = vi.fn();
    pConn.setReferenceList = vi.fn();
    pConn.getPageReference = () => '.page';
    pConn.getValue = () => [{ Id: 'b' }, { Id: 'a' }];
    const listActions = {
      getSelectedRows: vi.fn(() => Promise.resolve([])),
      insert: vi.fn(),
      deleteEntry: vi.fn(),
      ...listActionsOverrides
    };
    pConn.getListActions = () => listActions;
    const fx = TestBed.createComponent(MultiselectComponent);
    (fx.componentInstance as any).pConn$ = pConn;
    (fx.componentInstance as any).formGroup$ = new FormGroup({});
    fx.detectChanges();
    return { fx, c: fx.componentInstance as any, pConn, actions, listActions };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [MultiselectComponent] });
    (globalThis as any).PCore.getDataApi = () => ({ init: () => Promise.resolve({ fetchData: () => Promise.resolve({ data: undefined }) }) });
  });

  it('maps configProps onto component state', () => {
    const { c, pConn } = setup({ ...refCfg, value: 'abc' });
    expect(c.label$).toBe('Pick many');
    expect(c.bRequired$).toBe(true);
    expect(c.placeholder).toBe('Search');
    expect(c.value$).toBe('abc');
    expect(c.selectionKey).toBe('.Id');
    expect(c.primaryField).toBe('.Name');
    expect(c.selectionList).toBe('.Selected');
    expect(c.propName).toBe('.Field');
    expect(pConn.setReferenceList).toBeDefined();
  });

  it('registers the selection list with the engine', () => {
    const { pConn } = setup(refCfg);
    expect(pConn.setReferenceList).toHaveBeenCalledWith('.Selected');
  });

  it('renders the label', () => {
    const { fx } = setup(refCfg);
    expect(fx.nativeElement.querySelector('mat-label').textContent).toContain('Pick many');
  });

  it('renders a chip per selected item', () => {
    const { fx, c } = setup(refCfg);
    c.selectedItems = [
      { id: '1', primary: 'One' },
      { id: '2', primary: 'Two' }
    ];
    fx.changeDetectorRef.markForCheck();
    fx.detectChanges();
    const chips = Array.from<HTMLElement>(fx.nativeElement.querySelectorAll('mat-chip-row')).map(e => e.textContent!.trim());
    expect(chips).toHaveLength(2);
    expect(chips[0]).toContain('One');
    expect(chips[1]).toContain('Two');
  });

  it('builds column metadata for the reference list (primary and key)', () => {
    const { c: c2 } = setup({ ...refCfg, listType: 'other' });
    expect(c2.displayFieldMeta.primary).toBe('Name');
    expect(c2.displayFieldMeta.key).toBe('Id');
  });

  it('skips display field metadata for associated lists', () => {
    const { c } = setup(refCfg);
    expect(c.listType).toBe('associated');
    expect(c.displayFieldMeta).toBeNull();
  });

  it('adds secondary columns only for Case reference type', () => {
    const { c } = setup({ ...refCfg, listType: 'other', referenceType: 'Case' });
    expect(c.displayFieldMeta.secondary).toEqual(['Id']);
    const { c: c2 } = setup({ ...refCfg, listType: 'other', referenceType: 'Data' });
    expect(c2.displayFieldMeta.secondary).toEqual([]);
  });

  it('uses columnsFormatter from raw metadata for secondary fields', () => {
    const { c } = setup({ ...refCfg, listType: 'other', referenceType: 'Case' }, {});
    expect(c.displayFieldMeta.secondary).toEqual(['Id']);
    const pConn = createMockPConn();
    pConn.getConfigProps = () => ({ ...refCfg, listType: 'other', referenceType: 'Case' });
    pConn.resolveConfigProps = (p: any) => p;
    pConn.getRawMetadata = () => ({ config: { columnsFormatter: [{ config: { value: '@P .Desc' } }, { config: { value: '@USER .Owner' } }] } });
    pConn.getListActions = () => ({ getSelectedRows: () => Promise.resolve([]) });
    const fx = TestBed.createComponent(MultiselectComponent);
    (fx.componentInstance as any).pConn$ = pConn;
    (fx.componentInstance as any).formGroup$ = new FormGroup({});
    fx.detectChanges();
    expect(fx.componentInstance.displayFieldMeta.secondary).toEqual(['Desc', 'Owner']);
  });

  it('loads items through the data API and marks them with the selected rows', async () => {
    (globalThis as any).PCore.getDataApi = () => ({
      init: () =>
        Promise.resolve({
          fetchData: () =>
            Promise.resolve({
              data: [
                { Id: '1', Name: 'One' },
                { Id: '2', Name: 'Two' }
              ]
            })
        })
    });
    const { c } = setup({ ...refCfg, listType: 'other' }, { getSelectedRows: () => Promise.resolve([{ Id: '2', Name: 'Two' }]) });
    await vi.waitFor(() => expect(c.itemsTree).toHaveLength(2));
    expect(c.itemsTree.map(i => i.primary)).toEqual(['One', 'Two']);
    expect(c.itemsTree.map(i => i.selected)).toEqual([false, true]);
    expect(c.selectedItems).toEqual([{ id: '2', primary: 'Two' }]);
  });

  it('selecting an item inserts it into the reference list and clears errors', () => {
    const { c, pConn, listActions } = setup(refCfg);
    const item = { id: 'a', primary: 'Alpha', selected: false };
    c.itemsTree = [item];
    c.toggleSelection(item);
    expect(item.selected).toBe(true);
    expect(c.selectedItems).toContain(item);
    expect(c.value$).toBe('');
    expect(pConn.clearErrorMessages).toHaveBeenCalledWith({ property: '.Selected', category: '', context: '' });
    expect(listActions.insert).toHaveBeenCalledWith({ Id: 'a', Name: 'Alpha', nonFormProperties: ['Name'] }, 2);
  });

  it('deselecting an item deletes the matching row', () => {
    const { c, listActions } = setup(refCfg);
    const item = { id: 'a', primary: 'Alpha', selected: true };
    c.itemsTree = [item];
    c.selectedItems = [item];
    c.toggleSelection(item);
    expect(item.selected).toBe(false);
    expect(c.selectedItems).toEqual([]);
    expect(listActions.deleteEntry).toHaveBeenCalledWith(1);
    expect(listActions.insert).not.toHaveBeenCalled();
  });

  it('removeChip deselects the item with the same id', () => {
    const { c, listActions } = setup(refCfg);
    const item = { id: 'a', primary: 'Alpha', selected: true };
    c.itemsTree = [item];
    c.selectedItems = [item];
    c.removeChip({ id: 'a' });
    expect(c.selectedItems).toEqual([]);
    expect(listActions.deleteEntry).toHaveBeenCalled();
  });

  it('optionClicked stops propagation and toggles', () => {
    const { c } = setup(refCfg);
    const item = { id: 'a', primary: 'Alpha', selected: false };
    c.itemsTree = [item];
    const event = { stopPropagation: vi.fn() } as any;
    c.optionClicked(event, item);
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(item.selected).toBe(true);
  });

  it('typing updates value$ and re-runs the search with the text', () => {
    const { c, listActions } = setup(refCfg);
    listActions.getSelectedRows.mockClear();
    c.fieldOnChange({ target: { value: 'abc' } } as any);
    expect(c.value$).toBe('abc');
    expect(listActions.getSelectedRows).toHaveBeenCalledWith(true);
  });

  it('optionChanged drops the first character and sends the value to the engine', () => {
    const { c, actions } = setup(refCfg);
    c.optionChanged({ target: { value: ',x,y' } });
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Field', 'x,y');
    expect(actions.triggerFieldChange).toHaveBeenCalledWith('.Field', 'x,y');
  });

  it('does not search without a reference list', () => {
    const { c, listActions } = setup({ ...refCfg, referenceList: [] });
    listActions.getSelectedRows.mockClear();
    c.getCaseListBasedOnParams('q', '', [], []);
    expect(listActions.getSelectedRows).not.toHaveBeenCalled();
  });

  it('getErrorMessage returns the validation message, then required text', () => {
    const { c } = setup(refCfg);
    c.angularPConnectData.validateMessage = 'Pick at least one';
    c.fieldControl.setErrors({ message: true });
    expect(c.getErrorMessage()).toBe('Pick at least one');
    c.fieldControl.setErrors({ required: true });
    expect(c.getErrorMessage()).toBe('You must enter a value');
  });
});
