// Ensure PCore is defined before component module loads
if (typeof (globalThis as any).PCore === 'undefined') {
  (globalThis as any).PCore = {
    getConstants: () => ({
      WORKCLASS: 'Work-',
      CASE_INFO: { CASE_INFO_CLASSID: '.pyCaseInfo.pzInsKey' },
      RESOURCE_TYPES: { DATA: 'DATA' }
    }),
    getSemanticUrlUtils: () => ({
      getActions: () => ({
        ACTION_OPENWORKBYHANDLE: 'openWorkByHandle',
        ACTION_SHOWDATA: 'showData',
        ACTION_GETOBJECT: 'getObject'
      }),
      getResolvedSemanticURL: () => ''
    }),
    getDataTypeUtils: () => ({
      getLookUpDataPageInfo: () => null,
      getLookUpDataPage: () => null
    }),
    getAnnotationUtils: () => ({
      isProperty: () => false,
      getPropertyName: (val: string) => val
    }),
    getCaseUtils: () => ({
      isObjectCaseType: () => false
    })
  };
}

// Extend global PCore if it exists but doesn't have getCaseUtils
if ((globalThis as any).PCore && !(globalThis as any).PCore.getCaseUtils) {
  (globalThis as any).PCore.getCaseUtils = () => ({
    isObjectCaseType: () => false
  });
}

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { SemanticLinkComponent } from './semantic-link.component';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';

describe('SemanticLinkComponent', () => {
  setupTestBed({ zoneless: false });

  let component: SemanticLinkComponent;
  let fixture: ComponentFixture<SemanticLinkComponent>;
  let mockAngularPConnectService: {
    registerAndSubscribeComponent: Mock;
    shouldComponentUpdate: Mock;
    getComponentID: Mock;
  };
  let mockUtils: { getBooleanValue: Mock };
  let mockPConn: any;

  const mockConfigProps = {
    value: 'Link Text',
    label: 'Semantic Link',
    text: 'Click here',
    resourcePayload: {},
    resourceParams: {},
    previewKey: '',
    referenceType: 'Case',
    dataRelationshipContext: '',
    contextPage: null,
    visibility: true
  };

  beforeEach(async () => {
    mockAngularPConnectService = {
      registerAndSubscribeComponent: vi.fn().mockReturnValue({
        compID: 'test-comp-id',
        unsubscribeFn: vi.fn()
      }),
      shouldComponentUpdate: vi.fn().mockReturnValue(true),
      getComponentID: vi.fn().mockReturnValue('test-comp-id')
    };

    mockUtils = {
      getBooleanValue: vi.fn().mockImplementation(val => val === true || val === 'true')
    };

    mockPConn = {
      getConfigProps: vi.fn().mockReturnValue(mockConfigProps),
      resolveConfigProps: vi.fn().mockReturnValue(mockConfigProps),
      getContextName: vi.fn().mockReturnValue('app/primary_1'),
      getTarget: vi.fn().mockReturnValue(''),
      getDataObject: vi.fn().mockReturnValue({}),
      getValue: vi.fn().mockReturnValue(''),
      getActionsApi: vi.fn().mockReturnValue({
        openWorkByHandle: vi.fn(),
        showData: vi.fn()
      })
    };

    await TestBed.configureTestingModule({
      imports: [SemanticLinkComponent],
      providers: [
        { provide: AngularPConnectService, useValue: mockAngularPConnectService },
        { provide: Utils, useValue: mockUtils }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SemanticLinkComponent);
    component = fixture.componentInstance;
    component.pConn$ = mockPConn;
        component.formGroup$ = new FormGroup({});
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have pConn$ set', () => {
    expect(component.pConn$).toBe(mockPConn);
  });

  it('should have formGroup$ set', () => {
    expect(component.formGroup$).toBeDefined();
  });

  describe('updateSelf', () => {
    it('should resolve config props when called directly', () => {
      component.updateSelf();
      expect(mockPConn.resolveConfigProps).toHaveBeenCalled();
    });

    it('should set label from config props', () => {
      component.updateSelf();
      expect(component.label$).toBe('Semantic Link');
    });

    it('should set value from text property', () => {
      component.updateSelf();
      expect(component.value$).toBe('Click here');
    });

    it('should set value from value property when text is not provided', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, text: '' });
      component.updateSelf();
      expect(component.value$).toBe('Link Text');
    });

    it('should handle visibility property', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, visibility: true });
      component.updateSelf();
      expect(component.bVisible$).toBe(true);
    });
  });

  describe('ngOnInit', () => {
    it('should register component with AngularPConnectService', () => {
      fixture.detectChanges();
      expect(mockAngularPConnectService.registerAndSubscribeComponent).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should call unsubscribe function', () => {
      fixture.detectChanges();
      const unsubscribeFn = mockAngularPConnectService.registerAndSubscribeComponent().unsubscribeFn;
      component.ngOnDestroy();
      expect(unsubscribeFn).toHaveBeenCalled();
    });
  });

  describe('onStateChange', () => {
    it('should call updateSelf', () => {
      const spy = vi.spyOn(component, 'updateSelf');
      component.onStateChange();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('checkAndUpdate', () => {
    it('should call updateSelf when shouldComponentUpdate returns true', () => {
      const spy = vi.spyOn(component, 'updateSelf');
      component.checkAndUpdate();
      expect(spy).toHaveBeenCalled();
    });

    it('should not call updateSelf when shouldComponentUpdate returns false', () => {
      mockAngularPConnectService.shouldComponentUpdate.mockReturnValue(false);
      const spy = vi.spyOn(component, 'updateSelf');
      component.checkAndUpdate();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('openLinkClick', () => {
    beforeEach(() => {
      component.updateSelf();
    });

    it('should handle click without meta/ctrl key', () => {
      const event = {
        metaKey: false,
        ctrlKey: false,
        preventDefault: vi.fn()
      };
      component.openLinkClick(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should not prevent default when meta key is pressed', () => {
      const event = {
        metaKey: true,
        ctrlKey: false,
        preventDefault: vi.fn()
      };
      component.openLinkClick(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('should not prevent default when ctrl key is pressed', () => {
      const event = {
        metaKey: false,
        ctrlKey: true,
        preventDefault: vi.fn()
      };
      component.openLinkClick(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('should call openWorkByHandle when previewKey exists', () => {
      component.previewKey = 'WORK-123';
      component.resourcePayload = { caseClassName: 'Work-MyCase' };
      const event = {
        metaKey: false,
        ctrlKey: false,
        preventDefault: vi.fn()
      };
      component.openLinkClick(event);
      expect(mockPConn.getActionsApi().openWorkByHandle).toHaveBeenCalled();
    });
  });

  describe('showDataAction', () => {
    it('should call showData when referenceType is DATA', () => {
      component.referenceType = 'DATA';
      component.dataViewName = 'TestDataView';
      component.payload = { id: '123' };
      component.showDataAction();
      expect(mockPConn.getActionsApi().showData).toHaveBeenCalled();
    });

    it('should call showData when shouldTreatAsDataReference is true', () => {
      component.shouldTreatAsDataReference = true;
      component.dataViewName = 'TestDataView';
      component.payload = { id: '123' };
      component.showDataAction();
      expect(mockPConn.getActionsApi().showData).toHaveBeenCalled();
    });
  });

  describe('isLinkTextEmpty', () => {
    it('should set isLinkTextEmpty flag correctly', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, text: '' , value: '' });
      component.updateSelf();
      expect(component.isLinkTextEmpty).toBe(true);
    });

    it('should set isLinkTextEmpty to false when text exists', () => {
      component.updateSelf();
      expect(component.isLinkTextEmpty).toBe(false);
    });
  });

  describe('initializeComponentState', () => {
    it('should set displayMode from config props', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, displayMode: 'DISPLAY_ONLY' });
      component.updateSelf();
      expect(component.displayMode$).toBe('DISPLAY_ONLY');
    });

    it('should set referenceType from config props', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, referenceType: 'DATA' });
      component.updateSelf();
      expect(component.referenceType).toBe('DATA');
    });

    it('should set previewKey from config props', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, previewKey: 'WORK-123' });
      component.updateSelf();
      expect(component.previewKey).toBe('WORK-123');
    });

    it('should set resourcePayload from config props', () => {
      const payload = { caseClassName: 'Test' };
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, resourcePayload: payload });
      component.updateSelf();
      expect(component.resourcePayload).toEqual(payload);
    });

    it('should set dataResourcePayLoad when resourceType is DATA', () => {
      // Mock getDataPageKeys for this test
      (globalThis as any).PCore.getDataTypeUtils = () => ({
        getLookUpDataPageInfo: () => null,
        getLookUpDataPage: () => 'D_TestPage',
        getDataPageKeys: () => []
      });
      const payload = { resourceType: 'DATA', className: 'TestClass', content: {} };
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, resourcePayload: payload });
      component.updateSelf();
      expect(component.dataResourcePayLoad).toEqual(payload);
    });

    it('should set shouldTreatAsDataReference when no previewKey but caseClassName exists', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        previewKey: '',
        resourcePayload: { caseClassName: 'TestClass' }
      });
      component.updateSelf();
      expect(component.shouldTreatAsDataReference).toBeTruthy();
    });

    it('should handle contextPage with classID', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        contextPage: { classID: 'CustomClassID' },
        resourcePayload: {}
      });
      component.updateSelf();
      expect(component.resourcePayload.caseClassName).toBe('CustomClassID');
    });

    it('should replace WORKCLASS with actual class ID from pConn', () => {
      mockPConn.getValue.mockReturnValue('Actual-Class-ID');
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        resourcePayload: { caseClassName: 'Work-' }
      });
      component.updateSelf();
      expect(mockPConn.getValue).toHaveBeenCalledWith('.pyCaseInfo.pzInsKey');
    });
  });

  describe('buildDataPayload', () => {
    it('should build payload when referenceType is DATA', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        referenceType: 'DATA',
        dataRelationshipContext: null,
        contextPage: null
      });
      component.updateSelf();
      expect(component.dataViewName).toBeDefined();
    });

    it('should build payload when shouldTreatAsDataReference is true', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        previewKey: '',
        referenceType: '',
        resourcePayload: { caseClassName: 'TestClass' },
        dataRelationshipContext: null
      });
      component.updateSelf();
      expect(component.shouldTreatAsDataReference).toBeTruthy();
    });

    it('should handle resourcePayload with DATA resourceType', () => {
      (globalThis as any).PCore.getDataTypeUtils = () => ({
        getLookUpDataPageInfo: () => ({ parameters: { id: '.pxRefObjectKey' } }),
        getLookUpDataPage: () => 'D_TestPage',
        getDataPageKeys: () => []
      });
      (globalThis as any).PCore.getAnnotationUtils = () => ({
        isProperty: () => true,
        getPropertyName: () => 'pxRefObjectKey'
      });

      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        resourcePayload: { resourceType: 'DATA', className: 'TestClass', content: { pxRefObjectKey: '123' } }
      });
      component.updateSelf();
      expect(component.dataViewName).toBe('D_TestPage');
    });

    it('should use getDataPageKeys when lookUpDataPageInfo is null', () => {
      (globalThis as any).PCore.getDataTypeUtils = () => ({
        getLookUpDataPageInfo: () => null,
        getLookUpDataPage: () => 'D_TestPage',
        getDataPageKeys: () => [{ keyName: 'id', isAlternateKeyStorage: false }]
      });

      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        resourcePayload: { resourceType: 'DATA', className: 'TestClass', content: { id: '456' } }
      });
      component.updateSelf();
      expect(component.payload).toEqual({ id: '456' });
    });

    it('should handle alternate key storage', () => {
      (globalThis as any).PCore.getDataTypeUtils = () => ({
        getLookUpDataPageInfo: () => null,
        getLookUpDataPage: () => 'D_TestPage',
        getDataPageKeys: () => [{ keyName: 'id', isAlternateKeyStorage: true, linkedField: 'linkedId' }]
      });

      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        resourcePayload: { resourceType: 'DATA', className: 'TestClass', content: { linkedId: '789' } }
      });
      component.updateSelf();
      expect(component.payload).toEqual({ id: '789' });
    });
  });

  describe('buildLinkURL', () => {
    beforeEach(() => {
      (globalThis as any).PCore.getSemanticUrlUtils = () => ({
        getActions: () => ({
          ACTION_OPENWORKBYHANDLE: 'openWorkByHandle',
          ACTION_SHOWDATA: 'showData',
          ACTION_GETOBJECT: 'getObject'
        }),
        getResolvedSemanticURL: vi.fn().mockReturnValue('http://test.url')
      });
    });

    it('should build URL for data type', () => {
      (globalThis as any).PCore.getDataTypeUtils = () => ({
        getLookUpDataPageInfo: () => ({ parameters: {} }),
        getLookUpDataPage: () => 'D_TestPage',
        getDataPageKeys: () => []
      });
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        resourcePayload: { resourceType: 'DATA', className: 'TestClass', content: {} }
      });
      component.updateSelf();
      expect(component.linkURL).toBe('http://test.url');
    });

    it('should build URL for case type with previewKey', () => {
      (globalThis as any).PCore.getCaseUtils = () => ({
        isObjectCaseType: () => false
      });
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        previewKey: 'WORK 123',
        resourceParams: { workID: '' },
        resourcePayload: { caseClassName: 'Work-Test' }
      });
      component.updateSelf();
      expect(component.linkURL).toBeDefined();
    });

    it('should build URL for object case type', () => {
      (globalThis as any).PCore.getCaseUtils = () => ({
        isObjectCaseType: () => true
      });
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        previewKey: 'OBJ-123',
        resourceParams: { workID: 'W-123' },
        resourcePayload: { caseClassName: 'Object-Test' }
      });
      component.updateSelf();
      expect(component.linkURL).toBeDefined();
    });
  });

  describe('showDataAction - additional cases', () => {
    beforeEach(() => {
      (globalThis as any).PCore.getDataTypeUtils = () => ({
        getLookUpDataPageInfo: () => ({ parameters: { id: '.pxObjClass' } }),
        getLookUpDataPage: () => 'D_TestPage',
        getDataPageKeys: () => []
      });
      (globalThis as any).PCore.getAnnotationUtils = () => ({
        isProperty: (val: string) => val.startsWith('.'),
        getPropertyName: (val: string) => val.substring(1)
      });
    });

    it('should process lookUpDataPageInfo with parameters', () => {
      component.dataResourcePayLoad = {
        resourceType: 'DATA',
        className: 'TestClass',
        content: { pxObjClass: 'TestValue' }
      };
      component.showDataAction();
      expect(mockPConn.getActionsApi().showData).toHaveBeenCalledWith('pyDetails', 'D_TestPage', { id: 'TestValue' });
    });

    it('should call showData for DATA referenceType', () => {
      component.referenceType = 'data';
      component.dataViewName = 'D_TestView';
      component.payload = { key: 'value' };
      component.dataResourcePayLoad = null;
      component.showDataAction();
      expect(mockPConn.getActionsApi().showData).toHaveBeenCalledWith('pyDetails', 'D_TestView', { key: 'value' });
    });
  });

  describe('openLinkClick - additional cases', () => {
    it('should call showDataAction for DATA resourceType', () => {
      const spy = vi.spyOn(component, 'showDataAction').mockImplementation(() => {});
      component.dataResourcePayLoad = { resourceType: 'DATA' };
      const event = { metaKey: false, ctrlKey: false, preventDefault: vi.fn() };
      component.openLinkClick(event);
      expect(spy).toHaveBeenCalled();
    });

    it('should call showDataAction for DATA referenceType', () => {
      const spy = vi.spyOn(component, 'showDataAction').mockImplementation(() => {});
      component.referenceType = 'DATA';
      component.dataResourcePayLoad = null;
      const event = { metaKey: false, ctrlKey: false, preventDefault: vi.fn() };
      component.openLinkClick(event);
      expect(spy).toHaveBeenCalled();
    });

    it('should call showDataAction when shouldTreatAsDataReference is true', () => {
      const spy = vi.spyOn(component, 'showDataAction').mockImplementation(() => {});
      component.shouldTreatAsDataReference = true;
      component.dataResourcePayLoad = null;
      component.referenceType = '';
      const event = { metaKey: false, ctrlKey: false, preventDefault: vi.fn() };
      component.openLinkClick(event);
      expect(spy).toHaveBeenCalled();
    });
  });
});
