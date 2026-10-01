import { FormGroup } from '@angular/forms';
import { vi } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { createMockPConn } from '../../../../test-setup';
import { getMappedComponents, stubComponentMapper } from '../../../../test-utils';
import { DatapageService } from '../../../_services/datapage.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoCompleteComponent } from './auto-complete.component';

describe('AutoCompleteComponent', () => {
  let component: AutoCompleteComponent;
  let fixture: ComponentFixture<AutoCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoCompleteComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoCompleteComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('AutoCompleteComponent behaviour', () => {
  let actions: { updateFieldValue: any; triggerFieldChange: any; createWork: any; showDataObjectCreateView: any };
  const dataPage: { getDataPageData: any } = { getDataPageData: undefined };
  let pConn: any;
  let config: any;
  let rawMetadata: any;

  const rows = [
    { pyID: 'k1', Name: 'Alice', Dept: 'Sales', City: 'Paris' },
    { pyID: 'k2', Name: 'Bob', Dept: 'Eng', City: null },
    { pyID: 'k3', Name: 'Carol', Dept: 'Eng', City: 'Rome' }
  ];

  const baseColumns = () => [
    { key: 'true', value: '.pyID' },
    { display: 'true', primary: 'true', value: '.Name' }
  ];

  const trackLatest = (component: AutoCompleteComponent) => {
    let last: string[] = [];
    component.filteredOptions.subscribe(opts => (last = opts.map(o => o.value)));
    return () => last;
  };

  const flush = async () => {
    for (let i = 0; i < 10; i++) await Promise.resolve();
  };

  async function setup(
    cfg: any = {},
    withForm = true
  ): Promise<{ fixture: ComponentFixture<AutoCompleteComponent>; component: AutoCompleteComponent }> {
    config = { label: 'Person', listType: 'datapage', datasource: 'D_People', columns: baseColumns(), parameters: { a: 1 }, ...cfg };
    actions = { updateFieldValue: vi.fn(), triggerFieldChange: vi.fn(), createWork: vi.fn(), showDataObjectCreateView: vi.fn() };
    dataPage.getDataPageData = vi.fn().mockResolvedValue(rows);
    pConn = createMockPConn();
    pConn.getConfigProps = () => config;
    pConn.resolveConfigProps = (p: any) => p;
    pConn.getStateProps = () => ({ value: '.Person' });
    pConn.getActionsApi = () => actions;
    pConn.getRawMetadata = () => rawMetadata;
    pConn.getContextName = () => 'app/primary_1';
    pConn.createComponent = vi.fn((def: any) => ({ getPConnect: () => ({ getComponentName: () => def.type, def }) }));
    const fixture = TestBed.createComponent(AutoCompleteComponent);
    const component = fixture.componentInstance;
    (component as any).pConn$ = pConn;
    if (withForm) (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
    await flush();
    fixture.detectChanges();
    return { fixture, component };
  }

  beforeEach(async () => {
    rawMetadata = { type: 'AutoComplete', config: {} };
    await TestBed.configureTestingModule({ imports: [AutoCompleteComponent] }).compileComponents();
    TestBed.overrideComponent(AutoCompleteComponent, { set: { providers: [{ provide: DatapageService, useValue: dataPage }] } });
    await stubComponentMapper();
  });

  it('maps configProps to component state', async () => {
    const { component } = await setup({ required: true, readOnly: false, visibility: true, displayMode: '', testId: 'tid', placeholder: 'Pick' });
    expect(component.label$).toBe('Person');
    expect(component.bRequired$).toBe(true);
    expect(component.bReadonly$).toBe(false);
    expect(component.bVisible$).toBe(true);
    expect(component.displayMode$).toBe('');
    expect(component.testId).toBe('tid');
    expect(component.placeholder).toBe('Pick');
    expect(component.listType).toBe('datapage');
  });

  it('renders the label and input, and hides them when not visible', async () => {
    const { fixture } = await setup();
    expect(fixture.nativeElement.querySelector('mat-label').textContent).toContain('Person');
    expect(fixture.nativeElement.querySelector('input')).toBeTruthy();
    const hidden = await setup({ visibility: false });
    expect(hidden.fixture.nativeElement.querySelector('input')).toBeNull();
  });

  it('fetches the data page with datasource, parameters and context and builds options', async () => {
    const { component } = await setup();
    expect(dataPage.getDataPageData).toHaveBeenCalledWith('D_People', { a: 1 }, 'app/primary_1');
    expect(component.options$).toEqual([
      { key: 'k1', value: 'Alice' },
      { key: 'k2', value: 'Bob' },
      { key: 'k3', value: 'Carol' }
    ]);
  });

  it('shows the display text for a stored key', async () => {
    const { component, fixture } = await setup({ value: 'k2' });
    expect(component.value$).toBe('Bob');
    expect(component.fieldControl.value).toBe('Bob');
    expect(fixture.nativeElement.querySelector('input').value).toBe('Bob');
  });

  it('keeps an unknown value as typed', async () => {
    const { component } = await setup({ value: 'zzz' });
    expect(component.value$).toBe('zzz');
  });

  it('uses the configured list directly for associated list types without fetching', async () => {
    const { component } = await setup({ listType: 'associated', datasource: [{ key: 'x', value: 'Xavier' }], value: 'x' });
    expect(dataPage.getDataPageData).not.toHaveBeenCalled();
    expect(component.options$).toEqual([{ key: 'x', value: 'Xavier' }]);
    expect(component.value$).toBe('Xavier');
  });

  it('filters options case-insensitively on the typed text', async () => {
    const { component } = await setup();
    const latest = trackLatest(component);
    component.fieldControl.setValue('BO');
    expect(latest()).toEqual(['Bob']);
    component.fieldControl.setValue('');
    expect(latest()).toEqual(['Alice', 'Bob', 'Carol']);
  });

  it('typing sends only an updateFieldValue and remembers the filter text', async () => {
    const { component } = await setup();
    component.fieldOnChange({ target: { value: 'Al' } } as any);
    expect(component.filterValue).toBe('Al');
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Person', 'Al');
    expect(actions.triggerFieldChange).not.toHaveBeenCalled();
  });

  it('selecting an option sends the key and emits onRecordChange', async () => {
    const { component } = await setup();
    const emitted: any[] = [];
    component.onRecordChange.subscribe((v: any) => emitted.push(v));
    component.optionChanged({ option: { value: 'Bob' } });
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Person', 'k2');
    expect(actions.triggerFieldChange).toHaveBeenCalledWith('.Person', 'k2');
    expect(emitted).toEqual(['k2']);
  });

  it('selecting an option that is not in the list sends the raw value, and an empty selection clears it', async () => {
    const { component } = await setup();
    component.optionChanged({ option: { value: 'Unknown' } });
    expect(actions.triggerFieldChange).toHaveBeenLastCalledWith('.Person', 'Unknown');
    component.optionChanged({ option: { value: '' } });
    expect(actions.triggerFieldChange).toHaveBeenLastCalledWith('.Person', '');
  });

  it('renders the value through component-mapper in display-only mode without fetching', async () => {
    const { fixture } = await setup({ displayMode: 'DISPLAY_ONLY', value: 'k1' });
    expect(dataPage.getDataPageData).not.toHaveBeenCalled();
    const mapped = await getMappedComponents(fixture);
    expect(mapped.map(m => m.name)).toEqual(['FieldValueList']);
    expect(mapped[0].props.label$).toBe('Person');
    expect(mapped[0].props.displayMode$).toBe('DISPLAY_ONLY');
    expect(mapped[0].props.value$).toBe('k1');
  });

  it('falls back to the Text component when read-only or without a form group', async () => {
    const ro = await setup({ readOnly: true });
    expect((await getMappedComponents(ro.fixture)).map(m => m.name)).toEqual(['Text']);
    const nf = await setup({}, false);
    expect((await getMappedComponents(nf.fixture)).map(m => m.name)).toEqual(['Text']);
  });

  it('shows the server validation message', async () => {
    const { fixture, component } = await setup();
    (component as any).angularPConnectData.validateMessage = 'Pick someone';
    component.fieldControl.setErrors({ message: true });
    component.fieldControl.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-error').textContent).toContain('Pick someone');
  });

  describe('deferred datasource', () => {
    it('converts datasourceMetadata into a datapage source with key/display columns and flattened parameters', async () => {
      const { component } = await setup({
        listType: 'associated',
        datasource: [],
        deferDatasource: true,
        datasourceMetadata: {
          datasource: {
            name: 'D_Deferred',
            parameters: [{ name: 'p', value: 'v' }],
            propertyForDisplayText: '@P .Label',
            propertyForValue: '@P .Code'
          }
        }
      });
      expect(component.listType).toBe('datapage');
      expect(component.datasource).toBe('D_Deferred');
      expect(component.parameters).toEqual({ p: 'v' });
      expect(component.columns.map(c => c.value)).toEqual(['Code', 'Label']);
    });
  });

  describe('grouping and secondary columns', () => {
    it('adds group-by columns from raw metadata, sorts options by group and renders group buckets', async () => {
      rawMetadata = { config: { groupsFields: [{ type: 'TextInput', config: { value: '@P .Dept', label: 'Dept' } }] } };
      const { component } = await setup();
      expect(component.hasGroupBy).toBe(true);
      expect(component.options$.map(o => [o.value, o.group])).toEqual([
        ['Bob', 'Eng'],
        ['Carol', 'Eng'],
        ['Alice', 'Sales']
      ]);
      const groups = await firstValueFrom(component.groupedFilteredOptions$);
      expect(groups.map(g => [g.label, g.options.length])).toEqual([
        ['Eng', 2],
        ['Sales', 1]
      ]);
    });

    it('adds secondary components and search text from columnsFormatter', async () => {
      rawMetadata = { config: { columnsFormatter: [{ type: 'TextInput', config: { value: '@P .City', label: 'City' } }] } };
      const { component } = await setup();
      const [alice, bob] = component.options$;
      expect(alice.secondarySearchText).toBe('paris');
      expect(alice.secondaryComponents).toHaveLength(1);
      expect(bob.secondaryComponents).toHaveLength(1);
      expect(bob.secondarySearchText).toBeUndefined();
      expect(pConn.createComponent).toHaveBeenCalledWith(
        { type: 'TextInput', config: { value: 'Paris', displayMode: 'DISPLAY_ONLY', readOnly: true, label: 'City' } },
        '',
        0,
        {}
      );
      // secondary text is searchable
      const latest = trackLatest(component);
      component.fieldControl.setValue('rome');
      expect(latest()).toEqual(['Carol']);
    });

    it('buildGroups buckets contiguous options and uses an empty label for ungrouped options', async () => {
      const { component } = await setup();
      const groups = component.buildGroups([
        { key: '1', value: 'a', group: 'X' },
        { key: '2', value: 'b', group: 'X' },
        { key: '3', value: 'c' },
        { key: '4', value: 'd', group: 'X' }
      ]);
      expect(groups.map(g => [g.label, g.options.map(o => o.key)])).toEqual([
        ['X', ['1', '2']],
        ['', ['3']],
        ['X', ['4']]
      ]);
      expect(component.buildGroups(undefined as any)).toEqual([]);
    });

    it('resolveGroupValue normalises blank values and sortByGroup is ascending and stable', async () => {
      const { component } = await setup();
      expect(component.resolveGroupValue(null)).toBe('');
      expect(component.resolveGroupValue('   ')).toBe('');
      expect(component.resolveGroupValue(5)).toBe('5');
      const opts = [
        { key: '1', value: 'a', group: 'b' },
        { key: '2', value: 'b', group: 'a' },
        { key: '3', value: 'c', group: 'b' }
      ];
      component.sortByGroup(opts);
      expect(opts.map(o => o.key)).toEqual(['2', '1', '3']);
    });

    it('mapMetadataColumns strips @P/@USER prefixes and drops invalid entries', async () => {
      const { component } = await setup();
      const cols = component.mapMetadataColumns(
        [{ type: 'T', config: { value: '@P .A', label: 'a' } }, { config: { value: '@USER .B' } }, { config: { value: 'C' } }, { config: {} }, null],
        { f: 1 }
      );
      expect(cols.map(c => c.value)).toEqual(['.A', '.B', 'C']);
      expect(cols[0]).toMatchObject({ type: 'T', label: 'a', f: 1 });
    });
  });

  describe('helpers', () => {
    it('flattenParameters, preProcessColumns and getDisplayFieldsMetaData', async () => {
      const { component } = await setup();
      expect(component.flattenParameters({ x: { name: 'n1', value: 1 }, y: { name: 'n2', value: 2 } })).toEqual({ n1: 1, n2: 2 });
      expect(component.flattenParameters()).toEqual({});
      expect(component.preProcessColumns([{ value: '.A' }, { value: 'B' }, {}])).toEqual([{ value: 'A' }, { value: 'B' }, {}]);
      const meta = component.getDisplayFieldsMetaData([
        { key: 'true', value: 'ID' },
        { display: 'true', primary: 'true', value: 'Name' },
        { display: 'true', secondary: 'true', value: 'City' }
      ]);
      expect(meta).toEqual({ key: 'ID', primary: 'Name', secondary: ['City'] });
      expect(component.getDisplayFieldsMetaData([]).key).toBe('auto');
    });

    it('setValuesToAdditionalFields updates the associated property and other targets', async () => {
      const { component } = await setup();
      component.columns = [
        { key: 'true', value: 'pyID', setProperty: 'Associated property' },
        { value: 'City', setProperty: 'HomeCity' },
        { value: 'Dept', setProperty: '.Department' }
      ];
      component.setValuesToAdditionalFields({ pyID: 'k9', City: 'Oslo', Dept: 'Ops' });
      expect(actions.updateFieldValue).toHaveBeenCalledWith('.Person', 'k9');
      expect(actions.triggerFieldChange).toHaveBeenCalledWith('.Person', 'k9');
      expect(actions.updateFieldValue).toHaveBeenCalledWith('.HomeCity', 'Oslo', { associatedProperty: '.Person' });
      expect(actions.triggerFieldChange).toHaveBeenCalledWith('.HomeCity', 'Oslo');
      expect(actions.updateFieldValue).toHaveBeenCalledWith('.Department', 'Ops', { associatedProperty: '.Person' });
    });
  });

  describe('create new', () => {
    it('exposes the create button state from configProps', async () => {
      const off = await setup();
      expect(off.component.showCreateButton).toBe(false);
      expect(off.component.createNewLabel).toBe('Create new');
      const on = await setup({ allowCreatingRecords: true, createNewLabel: 'Add person' });
      expect(on.component.showCreateButton).toBe(true);
      expect(on.component.createNewLabel).toBe('Add person');
    });

    it('prefers the onCreateNew callback', async () => {
      const onCreateNew = vi.fn();
      const { component } = await setup({ allowCreatingRecords: true, onCreateNew, contextClass: 'My-Class' });
      component.createNewButtonHandler();
      expect(onCreateNew).toHaveBeenCalledTimes(1);
      expect(actions.createWork).not.toHaveBeenCalled();
    });

    it('does nothing without a callback or context class', async () => {
      const { component } = await setup({ allowCreatingRecords: true });
      component.createNewButtonHandler();
      expect(actions.createWork).not.toHaveBeenCalled();
      expect(actions.showDataObjectCreateView).not.toHaveBeenCalled();
    });

    it('creates a case for a case reference and a data object for a data reference', async () => {
      const c = await setup({ allowCreatingRecords: true, contextClass: 'My-Case', referenceType: 'Case' });
      c.component.createNewButtonHandler();
      expect(actions.createWork).toHaveBeenCalledWith('My-Case', { openCaseViewAfterCreate: false, startingFields: {} });
      const d = await setup({ allowCreatingRecords: true, contextClass: 'My-Data', referenceType: 'Data' });
      d.component.createNewButtonHandler();
      expect(actions.showDataObjectCreateView).toHaveBeenCalledWith('My-Data');
    });

    it('uses createNewRecord when provided and refreshes the list afterwards', async () => {
      const createNewRecord = vi.fn().mockResolvedValue(undefined);
      const { component } = await setup({ allowCreatingRecords: true, contextClass: 'My-Case', createNewRecord });
      dataPage.getDataPageData.mockClear();
      component.createNewButtonHandler();
      expect(createNewRecord).toHaveBeenCalledTimes(1);
      expect(actions.createWork).not.toHaveBeenCalled();
      await flush();
      expect(dataPage.getDataPageData).toHaveBeenCalledWith('D_People', { a: 1 }, 'app/primary_1');
    });
  });
});
