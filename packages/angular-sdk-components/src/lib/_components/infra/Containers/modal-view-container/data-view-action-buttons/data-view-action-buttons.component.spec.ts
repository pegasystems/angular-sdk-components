import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataViewActionButtonsComponent } from './data-view-action-buttons.component';

const RESOURCE_STATUS = { CREATE: 'CREATE', UPDATE: 'UPDATE', OPEN_FLOW_ACTION: 'OPEN_FLOW_ACTION' };
const DATA_EVENTS = { DATA_OBJECT_CREATED: 'DataObjectCreated', DATA_OBJECT_UPDATED: 'DataObjectUpdated' };

describe('DataViewActionButtonsComponent', () => {
  let component: DataViewActionButtonsComponent;
  let fixture: ComponentFixture<DataViewActionButtonsComponent>;
  let actionsApi: {
    createDataObject: jasmine.Spy;
    updateDataObject: jasmine.Spy;
    submitDataObjectAction: jasmine.Spy;
    cancelDataObject: jasmine.Spy;
  };
  let publishSpy: jasmine.Spy;

  beforeEach(async () => {
    publishSpy = jasmine.createSpy('publish');
    // PCore is read in a field initializer, so it must exist before the component is created.
    (globalThis as any).PCore = {
      getLocaleUtils: () => ({ getLocaleValue: (value: string) => value }),
      getConstants: () => ({ RESOURCE_STATUS, PUB_SUB_EVENTS: { DATA_EVENTS } }),
      getPubSubUtils: () => ({ publish: publishSpy })
    };

    await TestBed.configureTestingModule({
      imports: [DataViewActionButtonsComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(DataViewActionButtonsComponent);
    component = fixture.componentInstance;

    actionsApi = {
      createDataObject: jasmine.createSpy('createDataObject').and.returnValue(Promise.resolve()),
      updateDataObject: jasmine.createSpy('updateDataObject').and.returnValue(Promise.resolve()),
      submitDataObjectAction: jasmine.createSpy('submitDataObjectAction').and.returnValue(Promise.resolve()),
      cancelDataObject: jasmine.createSpy('cancelDataObject').and.returnValue({})
    };

    component.pConn$ = { getActionsApi: () => actionsApi } as any;
    component.context$ = 'app/modal_1';
    component.dataRecordKeys$ = '{"pyGUID":"abc-123"}';
    component.classID$ = 'My-Data-Class';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('labels the primary button "Update" when editing an existing record', () => {
    component.dataObjectAction$ = RESOURCE_STATUS.UPDATE;
    expect(component.primaryLabel$).toBe('Update');
  });

  it('labels the primary button "Submit" when creating a record', () => {
    component.dataObjectAction$ = RESOURCE_STATUS.CREATE;
    expect(component.primaryLabel$).toBe('Submit');
  });

  it('labels the primary button "Submit" for a record action', () => {
    component.dataObjectAction$ = RESOURCE_STATUS.OPEN_FLOW_ACTION;
    expect(component.primaryLabel$).toBe('Submit');
  });

  it('creates the record and publishes the created event', async () => {
    component.dataObjectAction$ = RESOURCE_STATUS.CREATE;

    component.onSubmit();
    await fixture.whenStable();

    expect(actionsApi.createDataObject).toHaveBeenCalledWith('app/modal_1');
    expect(publishSpy).toHaveBeenCalledWith(DATA_EVENTS.DATA_OBJECT_CREATED, { classId: 'My-Data-Class', data: undefined });
  });

  it('parses the serialised record keys before updating', async () => {
    component.dataObjectAction$ = RESOURCE_STATUS.UPDATE;

    component.onSubmit();
    await fixture.whenStable();

    expect(actionsApi.updateDataObject).toHaveBeenCalledWith('app/modal_1', { pyGUID: 'abc-123' });
    expect(publishSpy).toHaveBeenCalledWith(DATA_EVENTS.DATA_OBJECT_UPDATED, { classId: 'My-Data-Class' });
  });

  it('submits a record action with its parsed keys and action ID', async () => {
    component.dataObjectAction$ = RESOURCE_STATUS.OPEN_FLOW_ACTION;
    component.actionID$ = 'updateCVV';

    component.onSubmit();
    await fixture.whenStable();

    expect(actionsApi.submitDataObjectAction).toHaveBeenCalledWith('app/modal_1', { pyGUID: 'abc-123' }, 'updateCVV');
  });

  it('disables both buttons while a save is in flight', () => {
    let resolveSave: () => void = () => {};
    actionsApi.createDataObject.and.returnValue(
      new Promise<void>(resolve => {
        resolveSave = resolve;
      })
    );
    component.dataObjectAction$ = RESOURCE_STATUS.CREATE;

    component.onSubmit();

    expect(component.bDisabled$).toBeTrue();
    resolveSave();
  });

  it('re-enables the buttons and publishes nothing when the save is rejected', async () => {
    actionsApi.createDataObject.and.returnValue(Promise.reject(new Error('rejected')));
    component.dataObjectAction$ = RESOURCE_STATUS.CREATE;

    component.onSubmit();
    await fixture.whenStable();

    expect(publishSpy).not.toHaveBeenCalled();
    expect(component.bDisabled$).toBeFalse();
  });

  it('discards the edit through the engine on cancel', () => {
    component.onCancel();

    expect(actionsApi.cancelDataObject).toHaveBeenCalledWith('app/modal_1');
  });
});
