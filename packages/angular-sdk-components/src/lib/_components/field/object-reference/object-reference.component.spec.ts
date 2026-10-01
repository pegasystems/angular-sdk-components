import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { getMappedComponents, stubComponentMapper } from '../../../../test-utils';
import { DataReferenceAdvancedSearchService } from '../../../_services/data-reference-advanced-search.service';

import { ObjectReferenceComponent } from './object-reference.component';

describe('ObjectReferenceComponent', () => {
  let component: ObjectReferenceComponent;
  let fixture: ComponentFixture<ObjectReferenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObjectReferenceComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ObjectReferenceComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('ObjectReferenceComponent behaviour', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ObjectReferenceComponent] }).compileComponents();
    await stubComponentMapper();
  });

  function setup(rawConfig: any, configProps: any = {}, rawExtra: any = {}) {
    const children: any[] = [];
    const pConn = createMockPConn();
    pConn.getConfigProps = () => configProps;
    pConn.resolveConfigProps = (p: any) => p;
    pConn.getRawMetadata = () => ({ name: 'MyView', type: 'ObjectReference', config: rawConfig, ...rawExtra });
    pConn.getInheritedProps = () => ({ label: 'Inherited label' });
    pConn.getFieldMetadata = () => undefined;
    pConn.createComponent = vi.fn((meta: any) => {
      const child = createMockPConn();
      child.getComponentName = () => `Mapped${meta.type}`;
      child.setReferenceList = vi.fn();
      children.push(child);
      return { getPConnect: () => child };
    });
    pConn.getActionsApi = () => ({ refreshCaseView: vi.fn(), updateFieldValue: vi.fn(), triggerFieldChange: vi.fn() });
    const fx = TestBed.createComponent(ObjectReferenceComponent);
    (fx.componentInstance as any).pConn$ = pConn;
    fx.detectChanges();
    return { fx, c: fx.componentInstance as any, pConn, children };
  }

  const baseRaw = () => ({
    componentType: 'Dropdown',
    mode: 'single',
    value: '@P .Pet.Id',
    displayField: '@P .Pet.Name',
    targetObjectClass: 'Work-Pet',
    referenceList: 'D_Pets',
    label: 'Pet'
  });

  it('renders nothing when visibility is false', async () => {
    const { fx, c } = setup(baseRaw(), { visibility: false, mode: 'single' });
    expect(c.bVisible$).toBe(false);
    expect(await getMappedComponents(fx)).toHaveLength(0);
  });

  it('read-only single reference renders SingleReferenceReadOnly and derives readonly config', async () => {
    const raw: any = baseRaw();
    const { fx, c } = setup(raw, { readOnly: true, mode: 'single' });
    expect(c.renderMode).toBe('singleReferenceReadonly');
    expect(raw.primaryField).toBe(raw.displayField);
    expect(raw.caseClass).toBe('Work-Pet');
    expect(raw.caseID).toBe('@P .Pet.Id');
    expect(c.dataRelationshipContext).toBe('Pet');
    const mapped = await getMappedComponents(fx);
    expect(mapped.map(m => m.name)).toEqual(['SingleReferenceReadOnly']);
    expect(mapped[0].props.dataRelationshipContext).toBe('Pet');
  });

  it('read-only multi reference renders MultiReferenceReadOnly', async () => {
    const { fx, c } = setup(baseRaw(), { readOnly: true, mode: 'readonly-multi' });
    expect(c.renderMode).toBe('multiReferenceReadonly');
    expect((await getMappedComponents(fx)).map(m => m.name)).toEqual(['MultiReferenceReadOnly']);
  });

  it('DISPLAY_ONLY mode renders the single read-only reference', () => {
    const { c } = setup(baseRaw(), { displayMode: 'DISPLAY_ONLY', mode: 'single' });
    expect(c.isDisplayModeEnabled).toBe(true);
    expect(c.renderMode).toBe('singleReferenceReadonly');
  });

  it('stays editable in DISPLAY_ONLY mode when changes are allowed in review for a Dropdown', () => {
    const { c, pConn } = setup(baseRaw(), { displayMode: 'DISPLAY_ONLY', mode: 'single', allowAndPersistChangesInReviewMode: true });
    expect(c.canBeChangedInReviewMode).toBe(true);
    expect(c.renderMode).toBe('dynamicComponent');
    expect(pConn.createComponent).toHaveBeenCalled();
  });

  it('a read-only Multiselect becomes a SemanticLink read-only reference', () => {
    const { c } = setup({ ...baseRaw(), componentType: 'Multiselect', mode: 'multi' }, { readOnly: true, mode: 'multi' });
    expect(c.type).toBe('SemanticLink');
    expect(c.renderMode).toBe('singleReferenceReadonly');
  });

  it('Dropdown is created as a dynamic child with datasource config, placeholder and output events', async () => {
    const raw: any = baseRaw();
    const { fx, c, pConn } = setup(raw, { mode: 'single', required: true, showPromotedFilters: true, targetObjectType: 'case' });
    expect(c.renderMode).toBe('dynamicComponent');
    expect(c.useOutputEvents).toBe(true);
    const meta = pConn.createComponent.mock.calls[0][0];
    expect(meta.type).toBe('Dropdown');
    expect(meta.config.required).toBe(true);
    expect(meta.config.label).toBe('Inherited label');
    expect(meta.config.referenceType).toBe('Case');
    expect(meta.config.contextClass).toBe('Work-Pet');
    expect(meta.config.placeholder).toBe('@L Select...');
    expect(meta.config.listType).toBe('datapage');
    expect(meta.config.deferDatasource).toBe(true);
    expect(meta.config.showPromotedFilters).toBe(true);
    expect(meta.config.datasourceMetadata.datasource.name).toBe('D_Pets');
    expect(c.newComponentName).toBe('MappedDropdown');
    const mapped = await getMappedComponents(fx);
    expect(mapped.map(m => m.name)).toEqual(['MappedDropdown']);
    expect(mapped[0].props.pConn$).toBe(c.newPconn);
  });

  it('does not override an existing placeholder and uses Data reference type for non-case targets', () => {
    const { pConn } = setup({ ...baseRaw(), placeholder: 'Mine' }, { mode: 'single', targetObjectType: 'data' });
    const meta = pConn.createComponent.mock.calls[0][0];
    expect(meta.config.placeholder).toBe('Mine');
    expect(meta.config.referenceType).toBe('Data');
  });

  it('Combobox maps to AutoComplete in single mode and Multiselect in multi mode', () => {
    expect(setup({ ...baseRaw(), componentType: 'Combobox' }, { mode: 'single' }).c.type).toBe('AutoComplete');
    const { c, pConn } = setup({ ...baseRaw(), componentType: 'Combobox', mode: 'multi', pagelistValue: '@P .Pets' }, { mode: 'multi' });
    expect(c.type).toBe('Multiselect');
    expect(pConn.createComponent.mock.calls[0][0].type).toBe('Multiselect');
  });

  it('Multiselect child disables output events and pre-sets the reference list', () => {
    const { c, pConn, children } = setup(
      { ...baseRaw(), componentType: 'Multiselect', mode: 'multi', pagelistValue: '@P .Pets', selectionKey: '.Id' },
      { mode: 'multi', targetObjectType: 'case' }
    );
    const meta = pConn.createComponent.mock.calls[0][0];
    expect(c.useOutputEvents).toBe(false);
    expect(meta.type).toBe('Multiselect');
    expect(meta.config.selectionList).toBe('.Pets');
    expect(meta.config.selectionMode).toBe('multi');
    expect(meta.config.referenceType).toBe('Case');
    expect(children[0].setReferenceList).toHaveBeenCalledWith('.Pets');
  });

  it('Cards uses RadioButtons for single mode', () => {
    const { pConn, c } = setup({ ...baseRaw(), componentType: 'Cards', mode: 'single', selectionKey: '.Id' }, { mode: 'single' });
    const meta = pConn.createComponent.mock.calls[0][0];
    expect(meta.type).toBe('RadioButtons');
    expect(meta.config.variant).toBe('card');
    expect(meta.config.displayAs).toBe('cards');
    expect(meta.config.value).toBe('@P .Pet.Id');
    expect(c.useOutputEvents).toBe(false);
  });

  it('Cards uses Checkbox for multi mode and pre-sets the reference list', () => {
    const { pConn, children } = setup(
      { ...baseRaw(), componentType: 'Cards', mode: 'multi', pagelistValue: '@P .Pets', selectionKey: '.Id' },
      { mode: 'multi' }
    );
    const meta = pConn.createComponent.mock.calls[0][0];
    expect(meta.type).toBe('Checkbox');
    expect(meta.config.selectionMode).toBe('multi');
    expect(meta.config.selectionList).toBe('.Pets');
    expect(children[0].setReferenceList).toHaveBeenCalledWith('.Pets');
  });

  it('Map creates a MapView child', () => {
    const { pConn, c } = setup({ ...baseRaw(), componentType: 'Map', pagelistValue: '@P .Pets' }, { mode: 'multi', targetObjectType: 'Case' });
    const meta = pConn.createComponent.mock.calls[0][0];
    expect(meta.type).toBe('MapView');
    expect(meta.config.referenceType).toBe('Case');
    expect(meta.config.referenceList).toBe('@P .Pets');
    expect(c.newComponentName).toBe('MappedMapView');
  });

  it('CheckboxGroup is read-only unless mode is single or multi', () => {
    const raw = { ...baseRaw(), componentType: 'CheckboxGroup', mode: 'multi', pagelistValue: '@P .Pets', selectionKey: '.Id' };
    const editable = setup(raw, { mode: 'multi' });
    const meta = editable.pConn.createComponent.mock.calls[0][0];
    expect(meta.type).toBe('Checkbox');
    expect(meta.config.readOnly).toBe(false);
    expect(meta.config.displayAs).toBe('checkboxgroup');
    expect(meta.config.selectionList).toBe('.Pets');
    expect(editable.children[0].setReferenceList).toHaveBeenCalledWith('.Pets');
    const readonly = setup({ ...raw }, { mode: 'something-else' });
    expect(readonly.pConn.createComponent.mock.calls[0][0].config.readOnly).toBe(true);
  });

  it('CheckboxGroup with parameters loads the parameterized datasource', async () => {
    const getData = vi.fn(() =>
      Promise.resolve({
        data: {
          data: [
            { Id: '1', Name: 'One' },
            { Id: '', Name: 'NoKey' }
          ]
        }
      })
    );
    (globalThis as any).PCore.getDataApiUtils = () => ({ getData });
    const { c } = setup(
      {
        ...baseRaw(),
        componentType: 'CheckboxGroup',
        mode: 'multi',
        parameters: { p: 1 },
        selectionKey: '.Id',
        displayField: '.Name',
        referenceList: 'D_X'
      },
      { mode: 'multi', parameters: { p: 'v' } }
    );
    expect(getData).toHaveBeenCalledWith('D_X', { dataViewParameters: { p: 'v' } });
    await vi.waitFor(() => expect(c.parameterizedDataSource).toEqual([{ key: '1', text: 'One', value: '1' }]));
  });

  it('Table in multi mode creates a SimpleTableSelect with the selection list', () => {
    const { pConn } = setup(
      { ...baseRaw(), componentType: 'Table', mode: 'multi', pagelistValue: '@P .Pets', columns: [{ a: 1 }] },
      { mode: 'multi', targetObjectType: 'Case' }
    );
    const meta = pConn.createComponent.mock.calls[0][0];
    expect(meta.type).toBe('SimpleTableSelect');
    expect(meta.config.selectionMode).toBe('multi');
    expect(meta.config.selectionList).toBe('.Pets');
    expect(meta.config.displayAs).toBe('table');
    expect(meta.config.presets[0].children[0].children).toEqual([{ a: 1 }]);
  });

  it('SimpleTable in single mode uses the value as selection key; readonly-multi is read-only', () => {
    const single = setup({ ...baseRaw(), componentType: 'SimpleTable', contextPage: '@P .Pet' }, { mode: 'single' });
    const smeta = single.pConn.createComponent.mock.calls[0][0];
    expect(smeta.config.selectionKey).toBe('@P .Pet.Id');
    expect(smeta.config.dataRelationshipContext).toBe('.Pet');
    expect(smeta.config.displayAs).toBe('simpleTable');
    const ro = setup({ ...baseRaw(), componentType: 'Table', pagelistValue: '@P .Pets' }, { mode: 'readonly-multi' });
    const rmeta = ro.pConn.createComponent.mock.calls[0][0];
    expect(rmeta.config.readOnly).toBe(true);
    expect(rmeta.config.renderMode).toBe('ReadOnly');
  });

  it('Table with an unsupported mode creates no child', () => {
    const { pConn, c } = setup({ ...baseRaw(), componentType: 'Table' }, { mode: 'other' });
    expect(pConn.createComponent).not.toHaveBeenCalled();
    expect(c.newComponentName).toBeUndefined();
  });

  it('EmbeddedInsightTable turns insight columns into table presets', () => {
    const insightModel = {
      query: {
        columns: [
          { type: 'column', field: { fieldID: 'A', name: 'Alpha' } },
          { type: 'column', field: { fieldID: 'B' } },
          { type: 'aggregate', field: { fieldID: 'C' } },
          { type: 'column' }
        ]
      }
    };
    const { pConn } = setup({ ...baseRaw(), componentType: 'EmbeddedInsightTable', pagelistValue: '@P .Pets' }, {
      mode: 'multi',
      insightModel
    } as any);
    const meta = pConn.createComponent.mock.calls[0][0];
    expect(meta.type).toBe('SimpleTableManual');
    expect(meta.config.referenceList).toBe('@P .Pets');
    expect(meta.config.presets[0].children[0].children).toEqual([
      { type: 'TextInput', config: { value: '@P .A', label: 'Alpha' } },
      { type: 'TextInput', config: { value: '@P .B', label: 'B' } }
    ]);
  });

  it('SearchAndSelect publishes advanced-search config and renders SearchForm', async () => {
    const { fx, c } = setup(
      { ...baseRaw(), componentType: 'SearchAndSelect', contextPage: '@P .Pet' },
      { mode: 'single', required: true, matchPosition: 'startsWith' }
    );
    expect(c.renderMode).toBe('searchAndSelect');
    const cfg = TestBed.inject(DataReferenceAdvancedSearchService).getConfig() as any;
    expect(cfg.dataReferenceConfigToChild.selectionMode).toBe('single');
    expect(cfg.dataReferenceConfigToChild.required).toBe(true);
    expect(cfg.dataReferenceConfigToChild.matchPosition).toBe('startsWith');
    expect(cfg.dataReferenceConfigToChild.displayAs).toBe('advancedSearch');
    expect(cfg.dataReferenceConfigToChild.dataRelationshipContext).toBe('Pet');
    expect(cfg.searchSelectKey).toBe(c.searchSelectCacheKey);
    const mapped = await getMappedComponents(fx);
    expect(mapped.map(m => m.name)).toEqual(['SearchForm']);
    expect(mapped[0].props.type).toBe('ObjectReference');
  });

  it('onRecordChange refreshes the case view for the current view', () => {
    const { c, pConn } = setup(baseRaw(), { mode: 'single' });
    const refreshCaseView = vi.fn();
    pConn.getActionsApi = () => ({ refreshCaseView });
    pConn.getCaseInfo = () => ({ getKey: () => 'CASE-1' });
    pConn.getPageReference = () => 'caseInfo.content.Pets';
    c.onRecordChange({ id: 'x' });
    expect(refreshCaseView).toHaveBeenCalledWith('CASE-1', 'MyView', '.Pets', { autoDetectRefresh: true, propertyName: '@P .Pet.Id' });
  });

  it('onRecordChange does not refresh when the view has no name', () => {
    const { c, pConn } = setup(baseRaw(), { mode: 'single' });
    const refreshCaseView = vi.fn();
    pConn.getActionsApi = () => ({ refreshCaseView });
    pConn.getCaseInfo = () => ({ getKey: () => 'CASE-1' });
    c.rawViewMetadata = { config: {} };
    c.onRecordChange('x');
    expect(refreshCaseView).not.toHaveBeenCalled();
  });
});
