import { SelfServiceCaseViewComponent } from './self-service-case-view.component';

describe('SelfServiceCaseViewComponent', () => {
  let component: SelfServiceCaseViewComponent;
  let actionsApi: { openDataObjectAction: jasmine.Spy; createWork: jasmine.Spy };
  let dataInfoActions: any;
  let configProps: any;
  let dataRecord: any;

  const utilityChild = {
    getPConnect: () => ({ getRawMetadata: () => ({ type: 'region', name: 'Utilities', children: [] }) })
  };

  beforeEach(() => {
    (globalThis as any).PCore = {
      getLocaleUtils: () => ({ getLocaleValue: (value: string) => value }),
      getCaseUtils: () => ({ isObjectCaseType: () => false })
    };

    actionsApi = {
      openDataObjectAction: jasmine.createSpy('openDataObjectAction'),
      createWork: jasmine.createSpy('createWork')
    };
    dataInfoActions = undefined;
    dataRecord = { PlanID: 'P-1' };
    // Summary region is switched off so the test does not depend on case summary metadata.
    configProps = { icon: 'case', header: 'Header', subheader: 'ID-1', showSummaryRegion: false, showCaseActions: true };

    const utils = {
      getImageSrc: () => '',
      getSDKStaticContentUrl: () => '',
      getBooleanValue: (value: any) => value === true || value === 'true'
    } as any;

    component = new SelfServiceCaseViewComponent({} as any, utils);
    component.pConn$ = {
      resolveConfigProps: () => configProps,
      getConfigProps: () => configProps,
      getCaseLocaleReference: () => 'MY-CLASS!CASE!MY-CASE',
      getChildren: () => [utilityChild, utilityChild, utilityChild, utilityChild, utilityChild],
      getLocalizationService: () => ({ getLocalizedText: (value: string) => value }),
      getDataObject: () => ({ caseInfo: { ID: 'C-1', availableActions: [], availableProcesses: [] } }),
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
    expect(component.bActionsMenuDisabled$).toBeFalse();
  });

  it('falls back to empty arrays and disables the menu when nothing is available', () => {
    component.fullUpdate();

    expect(component.arDataObjectActions$).toEqual([]);
    expect(component.arCreateCaseActions$).toEqual([]);
    expect(component.bActionsMenuDisabled$).toBeTrue();
  });

  it('keeps honouring the showCaseActions configuration flag', () => {
    configProps = { ...configProps, showCaseActions: false };

    component.fullUpdate();

    expect(component.showCaseActions).toBeFalse();
  });

  it('preserves the case locale reference used for action labels', () => {
    component.fullUpdate();

    expect(component.localeKey).toBe('MY-CLASS!CASE!MY-CASE');
  });

  it('opens a data object action with the record class and content', () => {
    component._menuDataObjectActionClick({ ID: 'updateCVV', name: 'Update CVV' });

    expect(actionsApi.openDataObjectAction).toHaveBeenCalledWith('My-Data-Class', dataRecord, 'updateCVV', 'Update CVV');
  });

  it('starts a new case with starting fields nested under the target reference field', () => {
    component._menuCreateCaseActionClick({
      ID: 'My-Work-Class',
      name: 'Request Plan Change',
      targetDataReferenceField: { field: 'PlanRef', inputs: [{ linkedField: 'PlanID' }] }
    });

    expect(actionsApi.createWork).toHaveBeenCalledWith('My-Work-Class', { startingFields: { PlanRef: { PlanID: 'P-1' } } });
  });
});
