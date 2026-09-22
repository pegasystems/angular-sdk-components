import { AutoCompleteComponent } from './auto-complete.component';

describe('AutoCompleteComponent Create New', () => {
  let component: any;
  let actionsApi: jasmine.SpyObj<any>;
  let publishCallbacks: Record<string, (payload: any) => void>;
  let pubSubUtils: jasmine.SpyObj<any>;

  beforeEach(() => {
    actionsApi = jasmine.createSpyObj('actionsApi', ['updateFieldValue', 'triggerFieldChange']);
    publishCallbacks = {};
    pubSubUtils = jasmine.createSpyObj('pubSubUtils', ['subscribe', 'unsubscribe']);
    pubSubUtils.subscribe.and.callFake((eventName: string, callback: (payload: any) => void, subscriberId: string) => {
      publishCallbacks[`${eventName}:${subscriberId}`] = callback;
    });

    (globalThis as any).PCore = {
      getConstants: () => ({
        PUB_SUB_EVENTS: {
          CASE_EVENTS: { CREATE_STAGE_DONE: 'create-stage-done' },
          DATA_EVENTS: { DATA_OBJECT_CREATED: 'data-object-created' }
        }
      }),
      getPubSubUtils: () => pubSubUtils,
      getDataApi: () => ({ clearContextedCache: jasmine.createSpy('clearContextedCache') })
    };

    component = Object.create(AutoCompleteComponent.prototype);
    component.actionsApi = actionsApi;
    component.angularPConnectData = {};
    component.propName = '.Reference';
    component.options$ = [];
    component.columns = [
      { key: 'true', setProperty: 'Associated property', value: 'ID' },
      { display: 'true', primary: 'true', value: 'Name' },
      { setProperty: 'RelatedName', value: 'Name' }
    ];
    component.listType = 'datapage';
    component.parameters = {};
    component.bReadonly$ = false;
    component.displayMode$ = '';
    component.configProps$ = {
      allowCreatingRecords: true,
      createNewLabel: 'Add a record',
      createNewRecord: jasmine.createSpy('createNewRecord').and.returnValue(Promise.resolve()),
      contextClass: 'My-Data-Record',
      referenceType: 'Data',
      datasource: 'D_Records'
    };
    component.pConn$ = {
      getContextName: () => 'case-1',
      getStateProps: () => ({ value: '.Reference' }),
      getLocalizedValue: (value: string) => `localized:${value}`
    };
    component.onRecordChange = { emit: jasmine.createSpy('emit') };
    component.refreshOptions = jasmine.createSpy('refreshOptions').and.resolveTo([]);
  });

  it('shows Create New when reference creation is allowed', () => {
    expect(component.canCreateNew).toBeTrue();
    expect(component.createNewLabel).toBe('Add a record');

    component.bReadonly$ = true;

    expect(component.canCreateNew).toBeTrue();
  });

  it('uses the localized fallback label when no Create New label is configured', () => {
    component.configProps$.createNewLabel = '';

    expect(component.createNewLabel).toBe('localized:Create New');
  });

  it('selects a created Data Reference record, maps its values, and emits the normal change event', async () => {
    component.startCreateNew();
    await Promise.resolve();
    await Promise.resolve();

    await publishCallbacks['data-object-created:My-Data-Record']({
      data: { responseData: { ID: 'D-1', Name: 'Created data record' } }
    });

    expect(component.refreshOptions).toHaveBeenCalled();
    expect(actionsApi.updateFieldValue).toHaveBeenCalledWith('.Reference', 'D-1');
    expect(actionsApi.triggerFieldChange).toHaveBeenCalledWith('.Reference', 'D-1');
    expect(actionsApi.updateFieldValue).toHaveBeenCalledWith('.RelatedName', 'Created data record', {
      associatedProperty: '.Reference'
    });
    expect(component.onRecordChange.emit).toHaveBeenCalledWith({ id: 'D-1' });
    expect(pubSubUtils.unsubscribe).toHaveBeenCalledWith('data-object-created', 'My-Data-Record');
  });

  it('ignores an Object Reference completion for a different class', async () => {
    component.configProps$.referenceType = 'Case';
    component.configProps$.contextClass = 'My-Work-Record';
    component.startCreateNew();
    await Promise.resolve();
    await Promise.resolve();

    publishCallbacks['create-stage-done:My-Work-Record']({ caseType: 'Other-Work-Record', ID: 'C-1' });

    expect(component.refreshOptions).not.toHaveBeenCalled();
    expect(actionsApi.updateFieldValue).not.toHaveBeenCalled();
  });

  it('selects an Object Reference by its returned identifier when refresh has not yet returned it', async () => {
    component.configProps$.referenceType = 'Case';
    component.configProps$.contextClass = 'My-Work-Record';
    component.startCreateNew();
    await Promise.resolve();
    await Promise.resolve();

    await publishCallbacks['create-stage-done:My-Work-Record']({ caseType: 'My-Work-Record', ID: 'C-1' });

    expect(actionsApi.updateFieldValue).toHaveBeenCalledWith('.Reference', 'C-1');
    expect(component.onRecordChange.emit).toHaveBeenCalledWith({ id: 'C-1' });
    expect(pubSubUtils.unsubscribe).toHaveBeenCalledWith('create-stage-done', 'My-Work-Record');
  });

  it('maps a refreshed Object Reference record before notifying its parent', async () => {
    component.configProps$.referenceType = 'Case';
    component.configProps$.contextClass = 'My-Work-Record';
    component.refreshOptions.and.resolveTo([{ ID: 'C-1', Name: 'Created case record' }]);
    component.startCreateNew();
    await Promise.resolve();
    await Promise.resolve();

    await publishCallbacks['create-stage-done:My-Work-Record']({ caseType: 'My-Work-Record', ID: 'C-1' });

    expect(actionsApi.updateFieldValue).toHaveBeenCalledWith('.RelatedName', 'Created case record', {
      associatedProperty: '.Reference'
    });
    expect(component.onRecordChange.emit).toHaveBeenCalledWith({ id: 'C-1' });
  });

  it('does not change the current selection while creation is still open', () => {
    component.startCreateNew();

    expect(actionsApi.updateFieldValue).not.toHaveBeenCalled();
    expect(component.onRecordChange.emit).not.toHaveBeenCalled();
  });

  it('cleans up the completion listener when creation cannot be started', async () => {
    component.configProps$.createNewRecord.and.returnValue(Promise.reject(new Error('Creation unavailable')));
    component.startCreateNew();

    await Promise.resolve();
    await Promise.resolve();

    expect(actionsApi.updateFieldValue).not.toHaveBeenCalled();
    expect(pubSubUtils.unsubscribe).toHaveBeenCalledWith('data-object-created', 'My-Data-Record');
  });

  it('replaces a prior creation subscription before starting another creation', async () => {
    component.startCreateNew();
    await Promise.resolve();
    await Promise.resolve();
    component.startCreateNew();
    await Promise.resolve();
    await Promise.resolve();

    expect(pubSubUtils.unsubscribe).toHaveBeenCalledWith('data-object-created', 'My-Data-Record');
    expect(pubSubUtils.subscribe).toHaveBeenCalledTimes(2);
  });

  it('cleans up a pending creation listener when the field is destroyed', async () => {
    component.startCreateNew();
    await Promise.resolve();
    await Promise.resolve();
    component.ngOnDestroy();

    expect(pubSubUtils.unsubscribe).toHaveBeenCalledWith('data-object-created', 'My-Data-Record');
  });
});
