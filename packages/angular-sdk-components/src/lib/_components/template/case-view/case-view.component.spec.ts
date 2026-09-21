import { ChangeDetectorRef } from '@angular/core';

import { CaseViewComponent } from './case-view.component';

describe('CaseViewComponent', () => {
  let component: CaseViewComponent;
  let actionsApi: { openDataObjectAction: jasmine.Spy; createWork: jasmine.Spy };
  let dataInfoActions: any;
  let dataRecord: any;
  let caseInfo: any;

  const tabsChild = {
    getPConnect: () => ({
      getRawMetadata: () => ({ type: 'region', name: 'Tabs' }),
      getChildren: () => []
    })
  };

  beforeEach(() => {
    (globalThis as any).PCore = {
      getLocaleUtils: () => ({ getLocaleValue: (value: string) => value })
    };

    actionsApi = {
      openDataObjectAction: jasmine.createSpy('openDataObjectAction'),
      createWork: jasmine.createSpy('createWork')
    };
    dataInfoActions = undefined;
    dataRecord = { PlanID: 'P-1', CustomerID: 'C-9' };
    caseInfo = { ID: 'C-1', availableActions: [], availableProcesses: [] };

    const cdRef = { detectChanges: () => {}, markForCheck: () => {} } as unknown as ChangeDetectorRef;
    const utils = { getImageSrc: () => '', getSDKStaticContentUrl: () => '' } as any;

    component = new CaseViewComponent(cdRef, {} as any, utils);
    component.pConn$ = {
      resolveConfigProps: (props: any) => props,
      getConfigProps: () => ({ icon: 'case', header: 'Header', subheader: 'ID-1' }),
      getCaseInfo: () => ({ getClassName: () => 'My-Class', getName: () => 'My Case' }),
      getChildren: () => [tabsChild],
      getLocalizationService: () => ({ getLocalizedText: (value: string) => value }),
      getDataObject: () => ({ caseInfo }),
      getValue: (prop: string, context?: string) => {
        if (prop === '.actions' && context === 'dataInfo') return dataInfoActions;
        if (prop === '.content' && context === 'dataInfo') return dataRecord;
        if (prop === '.classID' && context === 'dataInfo.content') return 'My-Data-Class';
        if (context === '') return dataRecord[prop.slice(1)];
        return undefined;
      },
      getActionsApi: () => actionsApi
    } as any;
    component.localizedVal = (value: string) => value;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('lists data object actions published under dataInfo', () => {
    dataInfoActions = {
      availableActions: [{ ID: 'Edit', name: 'Edit' }],
      availableCreateCaseActions: [{ ID: 'My-Work-Class', name: 'Request Plan Change' }]
    };

    component.fullUpdate();

    expect(component.arDataObjectActions$.length).toBe(1);
    expect(component.arCreateCaseActions$.length).toBe(1);
  });

  it('falls back to empty arrays when the dataInfo context is absent', () => {
    dataInfoActions = undefined;

    component.fullUpdate();

    expect(component.arDataObjectActions$).toEqual([]);
    expect(component.arCreateCaseActions$).toEqual([]);
  });

  it('disables the actions menu when no action of any kind is available', () => {
    component.fullUpdate();

    expect(component.bActionsMenuDisabled$).toBeTrue();
  });

  it('enables the actions menu when only data object actions are available', () => {
    dataInfoActions = { availableActions: [{ ID: 'Edit', name: 'Edit' }] };

    component.fullUpdate();

    expect(component.bActionsMenuDisabled$).toBeFalse();
  });

  it('picks up case actions that arrive after the first update, without a case ID change', () => {
    component.fullUpdate();
    expect(component.bActionsMenuDisabled$).toBeTrue();
    expect(component.editAction).toBeUndefined();

    caseInfo.availableActions = [{ ID: 'pyUpdateCaseDetails', name: 'Edit details' }];
    component.updateCaseActions();

    expect(component.arAvailableActions$.length).toBe(1);
    expect(component.editAction).toBeTruthy();
    expect(component.bActionsMenuDisabled$).toBeFalse();
  });

  it('opens a data object action with the record class and content', () => {
    component._menuDataObjectActionClick({ ID: 'updateCVV', name: 'Update CVV' });

    expect(actionsApi.openDataObjectAction).toHaveBeenCalledWith('My-Data-Class', dataRecord, 'updateCVV', 'Update CVV');
  });

  it('starts a new case with starting fields nested under the target reference field', () => {
    component._menuCreateCaseActionClick({
      ID: 'My-Work-Class',
      name: 'Request Plan Change',
      targetDataReferenceField: {
        field: 'PlanRef',
        inputs: [{ linkedField: 'PlanID' }, { linkedField: 'CustomerID' }]
      }
    });

    expect(actionsApi.createWork).toHaveBeenCalledWith('My-Work-Class', {
      startingFields: { PlanRef: { PlanID: 'P-1', CustomerID: 'C-9' } }
    });
  });

  it('starts a new case with no starting fields when the action declares no inputs', () => {
    component._menuCreateCaseActionClick({ ID: 'My-Work-Class', name: 'Request Plan Change' });

    expect(actionsApi.createWork).toHaveBeenCalledWith('My-Work-Class', { startingFields: {} });
  });
});
