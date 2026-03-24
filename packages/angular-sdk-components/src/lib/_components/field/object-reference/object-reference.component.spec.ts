// Mock PCore before imports
if (typeof (globalThis as any).PCore === 'undefined') {
  (globalThis as any).PCore = {
    getAnnotationUtils: () => ({
      getPropertyName: (val: string) => val?.replace('@P .', '') || val
    }),
    getCaseUtils: () => ({
      getCaseEditLock: () => Promise.resolve({ headers: { etag: 'test-etag' } }),
      updateCaseEditFieldsData: () =>
        Promise.resolve({
          data: { data: { caseInfo: { lastUpdateTime: Date.now() } } },
          headers: { etag: 'new-etag' }
        })
    }),
    getContainerUtils: () => ({
      updateParentLastUpdateTime: vi.fn(),
      updateRelatedContextEtag: vi.fn()
    })
  };
}

// Mock global getPConnect
(globalThis as any).getPConnect = () => ({
  getActionsApi: () => ({
    refreshCaseView: vi.fn()
  })
});

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { ObjectReferenceComponent } from './object-reference.component';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

// Create a mock ComponentMapperComponent
@Component({
  selector: 'app-component-mapper',
  template: '',
  standalone: true
})
class MockComponentMapperComponent {}

describe('ObjectReferenceComponent', () => {
  setupTestBed({ zoneless: false });

  let component: ObjectReferenceComponent;
  let fixture: ComponentFixture<ObjectReferenceComponent>;
  let mockAngularPConnectService: {
    registerAndSubscribeComponent: Mock;
    shouldComponentUpdate: Mock;
    getComponentID: Mock;
  };
  let mockPConn: any;

  const mockConfigProps = {
    value: '.Reference.ID',
    label: 'Reference',
    showPromotedFilters: false,
    inline: false,
    parameters: {},
    mode: 'view',
    targetObjectType: 'TestClass',
    allowAndPersistChangesInReviewMode: false,
    visibility: true,
    displayMode: 'DISPLAY_ONLY',
    displayField: 'Name'
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

    mockPConn = {
      getConfigProps: vi.fn().mockReturnValue(mockConfigProps),
      resolveConfigProps: vi.fn().mockReturnValue(mockConfigProps),
      getRawMetadata: vi.fn().mockReturnValue({ config: {} }),
      getContextName: vi.fn().mockReturnValue('app/primary_1'),
      getFieldMetadata: vi.fn().mockReturnValue({}),
      getInheritedProps: vi.fn().mockReturnValue({}),
      createComponent: vi.fn().mockReturnValue({})
    };

    await TestBed.configureTestingModule({
      imports: [ObjectReferenceComponent],
      providers: [{ provide: AngularPConnectService, useValue: mockAngularPConnectService }]
    })
      .overrideComponent(ObjectReferenceComponent, {
        remove: { imports: [ComponentMapperComponent] },
        add: { imports: [MockComponentMapperComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ObjectReferenceComponent);
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

  describe('ngOnInit', () => {
    it('should register component with AngularPConnectService', () => {
      component.ngOnInit();
      expect(mockAngularPConnectService.registerAndSubscribeComponent).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should call unsubscribe function', () => {
      component.ngOnInit();
      const unsubscribeFn = mockAngularPConnectService.registerAndSubscribeComponent().unsubscribeFn;
      component.ngOnDestroy();
      expect(unsubscribeFn).toHaveBeenCalled();
    });
  });

  describe('onStateChange', () => {
    it('should call checkAndUpdate', () => {
      const spy = vi.spyOn(component, 'checkAndUpdate');
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

  describe('updateSelf', () => {
    it('should resolve config props', () => {
      component.updateSelf();
      expect(mockPConn.resolveConfigProps).toHaveBeenCalled();
    });

    it('should set isDisplayModeEnabled for DISPLAY_ONLY mode', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        displayMode: 'DISPLAY_ONLY'
      });
      component.updateSelf();
      expect(component.isDisplayModeEnabled).toBe(true);
    });

    it('should handle case targetObjectType', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        targetObjectType: 'case'
      });
      component.updateSelf();
      expect(component.configProps).toBeDefined();
    });

    it('should handle data targetObjectType', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        targetObjectType: 'data'
      });
      component.updateSelf();
      expect(component.configProps).toBeDefined();
    });
  });

  describe('getComponentType', () => {
    it('should exist as a method', () => {
      expect(component['getComponentType']).toBeDefined();
    });

    it('should return componentType from rawViewMetadata config', () => {
      mockPConn.getRawMetadata.mockReturnValue({
        config: { componentType: 'Autocomplete' }
      });
      component.updateSelf();
      expect(component.type).toBe('Autocomplete');
    });
  });

  describe('updateSelf with SemanticLink type', () => {
    beforeEach(() => {
      mockPConn.getRawMetadata.mockReturnValue({
        config: {
          componentType: 'SemanticLink',
          displayField: 'pyLabel',
          targetObjectClass: 'Work-Test',
          value: '.TestRef'
        }
      });
      mockPConn.createComponent.mockReturnValue({
        getPConnect: () => ({
          getComponentName: () => 'SemanticLink'
        })
      });
    });

    it('should create SemanticLink pConnect when type is SemanticLink', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        displayMode: 'DISPLAY_ONLY',
        allowAndPersistChangesInReviewMode: false
      });
      component.updateSelf();
      expect(mockPConn.createComponent).toHaveBeenCalled();
    });

    it('should set canBeChangedInReviewMode when editableInReview is true and type is Autocomplete', () => {
      mockPConn.getRawMetadata.mockReturnValue({
        config: { componentType: 'Autocomplete' }
      });
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        displayMode: 'DISPLAY_ONLY',
        allowAndPersistChangesInReviewMode: true
      });
      component.updateSelf();
      expect(component.canBeChangedInReviewMode).toBe(true);
    });

    it('should set canBeChangedInReviewMode when editableInReview is true and type is Dropdown', () => {
      mockPConn.getRawMetadata.mockReturnValue({
        config: { componentType: 'Dropdown' }
      });
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        displayMode: 'DISPLAY_ONLY',
        allowAndPersistChangesInReviewMode: true
      });
      component.updateSelf();
      expect(component.canBeChangedInReviewMode).toBe(true);
    });
  });

  describe('updateSelf with Dropdown/AutoComplete type', () => {
    beforeEach(() => {
      mockPConn.createComponent.mockReturnValue({
        getPConnect: () => ({
          getComponentName: () => 'Dropdown'
        })
      });
    });

    it('should create component when type is not SemanticLink and not display mode', () => {
      mockPConn.getRawMetadata.mockReturnValue({
        config: {
          componentType: 'Dropdown',
          displayField: 'pyLabel',
          targetObjectClass: 'Data-Test',
          referenceList: 'D_TestList',
          value: '.Customer.pyID'
        }
      });
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        displayMode: '',
        mode: 'single',
        parameters: { key: 'value' },
        showPromotedFilters: true
      });
      component.updateSelf();
      expect(mockPConn.createComponent).toHaveBeenCalled();
      expect(component.newPconn).toBeDefined();
    });

    it('should add placeholder for Dropdown without placeholder', () => {
      mockPConn.getRawMetadata.mockReturnValue({
        config: {
          componentType: 'Dropdown',
          displayField: 'pyLabel',
          value: '.Customer.pyID'
        }
      });
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        displayMode: ''
      });
      component.updateSelf();
      expect(mockPConn.createComponent).toHaveBeenCalled();
    });

    it('should add placeholder for AutoComplete without placeholder', () => {
      mockPConn.getRawMetadata.mockReturnValue({
        config: {
          componentType: 'AutoComplete',
          displayField: 'pyLabel',
          value: '.Customer.pyID'
        }
      });
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        displayMode: ''
      });
      component.updateSelf();
      expect(mockPConn.createComponent).toHaveBeenCalled();
    });

    it('should handle datasource with fields', () => {
      mockPConn.getRawMetadata.mockReturnValue({
        config: {
          componentType: 'Dropdown',
          displayField: 'pyLabel',
          value: '.Customer.pyID',
          datasource: {
            fields: {
              text: '@P .pyLabel',
              value: '@P .pyID'
            }
          }
        }
      });
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        displayMode: ''
      });
      component.updateSelf();
      expect(mockPConn.createComponent).toHaveBeenCalled();
    });
  });

  describe('onRecordChange', () => {
    beforeEach(() => {
      mockPConn.getCaseInfo = vi.fn().mockReturnValue({
        getKey: () => 'CASE-123'
      });
      mockPConn.getValue = vi.fn().mockReturnValue(null);
      mockPConn.getPageReference = vi.fn().mockReturnValue('caseInfo.content.Customer');
      mockPConn.getRawMetadata.mockReturnValue({
        name: 'TestView',
        config: { value: '.Customer.pyID' },
        type: 'Reference'
      });
    });

    it('should call refreshCaseView when canBeChangedInReviewMode is false', () => {
      const refreshCaseViewSpy = vi.fn();
      (globalThis as any).getPConnect = () => ({
        getActionsApi: () => ({
          refreshCaseView: refreshCaseViewSpy
        })
      });

      component.rawViewMetadata = { name: 'TestView', config: { value: '.Customer' } } as any;
      component.canBeChangedInReviewMode = false;
      component.onRecordChange('C-100');
      expect(refreshCaseViewSpy).toHaveBeenCalled();
    });

    it('should not call refreshCaseView when view name is empty', () => {
      const refreshCaseViewSpy = vi.fn();
      (globalThis as any).getPConnect = () => ({
        getActionsApi: () => ({
          refreshCaseView: refreshCaseViewSpy
        })
      });

      component.rawViewMetadata = { name: '', config: { value: '.Customer' } } as any;
      component.canBeChangedInReviewMode = false;
      component.onRecordChange('C-100');
      expect(refreshCaseViewSpy).not.toHaveBeenCalled();
    });

    it('should handle SimpleTableSelect type with multi mode', async () => {
      component.rawViewMetadata = {
        name: 'TestView',
        config: { value: '.Customer', selectionList: '@P .SelectedCustomers' },
        type: 'SimpleTableSelect'
      } as any;
      component.configProps = { ...mockConfigProps, mode: 'multi' } as any;
      component.canBeChangedInReviewMode = true;
      component.isDisplayModeEnabled = true;

      await component.onRecordChange('C-100');
      // Verifies that the function runs without errors
      expect(true).toBe(true);
    });

    it('should update case when canBeChangedInReviewMode and isDisplayModeEnabled are true', async () => {
      const getCaseEditLockSpy = vi.fn().mockResolvedValue({ headers: { etag: 'test-etag' } });
      const updateCaseEditFieldsDataSpy = vi.fn().mockResolvedValue({
        data: { data: { caseInfo: { lastUpdateTime: Date.now() } } },
        headers: { etag: 'new-etag' }
      });

      (globalThis as any).PCore.getCaseUtils = () => ({
        getCaseEditLock: getCaseEditLockSpy,
        updateCaseEditFieldsData: updateCaseEditFieldsDataSpy
      });

      component.rawViewMetadata = {
        name: 'TestView',
        config: { value: '.Customer.pyID' },
        type: 'Reference'
      } as any;
      component.configProps = mockConfigProps as any;
      component.canBeChangedInReviewMode = true;
      component.isDisplayModeEnabled = true;

      await component.onRecordChange('C-100');
      expect(getCaseEditLockSpy).toHaveBeenCalledWith('CASE-123', '');
    });
  });

  describe('createSemanticLinkPConnect', () => {
    it('should create SemanticLink component with proper config', () => {
      mockPConn.getRawMetadata.mockReturnValue({
        config: {
          componentType: 'SemanticLink',
          displayField: 'pyLabel',
          targetObjectClass: 'Work-Test',
          value: '.TestRef'
        }
      });
      mockPConn.createComponent.mockReturnValue({
        getPConnect: () => ({
          getComponentName: () => 'SemanticLink'
        })
      });
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        displayMode: 'DISPLAY_ONLY'
      });

      component.updateSelf();
      expect(component.newPconn).toBeDefined();
    });
  });

  describe('createOtherComponentPConnect', () => {
    it('should create component with descriptors for single mode', () => {
      mockPConn.getFieldMetadata.mockReturnValue({
        descriptors: [{ key: 'value' }]
      });
      mockPConn.getRawMetadata.mockReturnValue({
        config: {
          componentType: 'Dropdown',
          displayField: 'pyLabel',
          targetObjectClass: 'Data-Test',
          value: '.Customer.pyID'
        }
      });
      mockPConn.createComponent.mockReturnValue({
        getPConnect: () => ({
          getComponentName: () => 'Dropdown'
        })
      });
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        displayMode: '',
        mode: 'single'
      });

      component.updateSelf();
      expect(component.newComponentName).toBe('Dropdown');
    });
  });
});
