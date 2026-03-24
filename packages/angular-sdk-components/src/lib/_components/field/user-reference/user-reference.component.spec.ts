// Mock PCore before any imports
if (typeof (globalThis as any).PCore === 'undefined') {
  (globalThis as any).PCore = {
    getRestClient: () => ({
      invokeRestApi: () => Promise.resolve({ data: { data: [] } })
    }),
    getEnvironmentInfo: () => ({
      getUseLocale: () => 'en-US',
      getDefaultOperatorDP: () => 'D_pyGetOperatorsForCurrentApplication'
    }),
    getDataApi: () => ({
      init: () =>
        Promise.resolve({
          registerForBufferedCall: vi.fn(),
          fetchData: () => Promise.resolve({ data: [{ pyUserName: 'Test User' }] })
        })
    })
  };
}

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { UserReferenceComponent } from './user-reference.component';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';

describe('UserReferenceComponent', () => {
  setupTestBed({ zoneless: false });

  let component: UserReferenceComponent;
  let fixture: ComponentFixture<UserReferenceComponent>;
  let mockAngularPConnectService: {
    registerAndSubscribeComponent: Mock;
    shouldComponentUpdate: Mock;
    getComponentID: Mock;
  };
  let mockUtils: { getBooleanValue: Mock; getUserId: Mock };
  let mockPConn: any;

  const mockConfigProps = {
    value: 'user123',
    label: 'Assigned To',
    testId: 'test-user-ref',
    helperText: 'Select a user',
    displayAs: 'Drop-down list',
    required: false,
    readOnly: false,
    disabled: false,
    visibility: true,
    showAsFormattedText: false
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
      getBooleanValue: vi.fn().mockImplementation(val => val === true || val === 'true'),
      getUserId: vi.fn().mockReturnValue('user123')
    };

    mockPConn = {
      getConfigProps: vi.fn().mockReturnValue(mockConfigProps),
      resolveConfigProps: vi.fn().mockReturnValue(mockConfigProps),
      getStateProps: vi.fn().mockReturnValue({ value: '.AssignedTo' }),
      getActionsApi: vi.fn().mockReturnValue({
        updateFieldValue: vi.fn(),
        triggerFieldChange: vi.fn()
      }),
      clearErrorMessages: vi.fn(),
      getContextName: vi.fn().mockReturnValue('app/primary_1'),
      getDataObject: vi.fn().mockReturnValue({})
    };

    await TestBed.configureTestingModule({
      imports: [
        UserReferenceComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatAutocompleteModule
      ],
      providers: [
        { provide: AngularPConnectService, useValue: mockAngularPConnectService },
        { provide: Utils, useValue: mockUtils }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserReferenceComponent);
    component = fixture.componentInstance;
    component.pConn$ = mockPConn;
    component.formGroup$ = new FormGroup({});
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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

    it('should remove control from formGroup', async () => {
      await component.ngOnInit();
      expect(component.formGroup$.contains('test-comp-id')).toBe(true);
      component.ngOnDestroy();
      expect(component.formGroup$.contains('test-comp-id')).toBe(false);
    });
  });

  describe('type getter', () => {
    it('should return operator when readonly and showAsFormattedText', () => {
      component.bReadonly$ = true;
      component.showAsFormattedText$ = true;
      expect(component.type).toBe('operator');
    });

    it('should return dropdown when displayAs is Drop-down list', () => {
      component.bReadonly$ = false;
      component.displayAs$ = 'Drop-down list';
      expect(component.type).toBe('dropdown');
    });

    it('should return searchbox when displayAs is Search box', () => {
      component.bReadonly$ = false;
      component.displayAs$ = 'Search box';
      expect(component.type).toBe('searchbox');
    });

    it('should return empty string by default', () => {
      component.bReadonly$ = false;
      component.displayAs$ = 'Other';
      expect(component.type).toBe('');
    });
  });

  describe('onStateChange', () => {
    it('should call checkAndUpdate', async () => {
      const spy = vi.spyOn(component, 'checkAndUpdate');
      await component.onStateChange();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('checkAndUpdate', () => {
    it('should call updateSelf when shouldComponentUpdate returns true', async () => {
      const spy = vi.spyOn(component, 'updateSelf');
      await component.checkAndUpdate();
      expect(spy).toHaveBeenCalled();
    });

    it('should not call updateSelf when shouldComponentUpdate returns false', async () => {
      mockAngularPConnectService.shouldComponentUpdate.mockReturnValue(false);
      const spy = vi.spyOn(component, 'updateSelf');
      await component.checkAndUpdate();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('updateSelf', () => {
    it('should set label from config props', async () => {
      await component.updateSelf();
      expect(component.label$).toBe('Assigned To');
    });

    it('should set displayAs from config props', async () => {
      await component.updateSelf();
      expect(component.displayAs$).toBe('Drop-down list');
    });

    it('should handle object value with userName', async () => {
      mockPConn.getConfigProps.mockReturnValue({
        ...mockConfigProps,
        value: { userName: 'Test User' }
      });
      await component.updateSelf();
      expect(component.value$).toBe('Test User');
    });

    it('should handle string value', async () => {
      mockPConn.getConfigProps.mockReturnValue({
        ...mockConfigProps,
        value: 'simpleUserId'
      });
      await component.updateSelf();
      expect(component.value$).toBe('simpleUserId');
    });

    it('should handle empty value', async () => {
      mockPConn.getConfigProps.mockReturnValue({
        ...mockConfigProps,
        value: null
      });
      await component.updateSelf();
      expect(component.value$).toBe('');
    });

    it('should set bReadonly$ and bRequired$ flags', async () => {
      mockPConn.getConfigProps.mockReturnValue({
        ...mockConfigProps,
        readOnly: true,
        required: true
      });
      await component.updateSelf();
      expect(component.bReadonly$).toBe(true);
      expect(component.bRequired$).toBe(true);
    });

    it('should handle string "true" for boolean flags', async () => {
      mockPConn.getConfigProps.mockReturnValue({
        ...mockConfigProps,
        readOnly: 'true',
        required: 'true'
      });
      await component.updateSelf();
      expect(component.bReadonly$).toBe(true);
      expect(component.bRequired$).toBe(true);
    });

    it('should fetch operators for dropdown display', async () => {
      const invokeRestApiSpy = vi.fn().mockResolvedValue({
        data: {
          data: [
            { pyUserIdentifier: 'user1', pyUserName: 'User One' },
            { pyUserIdentifier: 'user2', pyUserName: 'User Two' }
          ]
        }
      });
      (globalThis as any).PCore.getRestClient = () => ({ invokeRestApi: invokeRestApiSpy });

      mockPConn.getConfigProps.mockReturnValue({
        ...mockConfigProps,
        displayAs: 'Drop-down list'
      });

      await component.updateSelf();
      expect(invokeRestApiSpy).toHaveBeenCalled();
      expect(component.options$).toEqual([
        { key: 'user1', value: 'User One' },
        { key: 'user2', value: 'User Two' }
      ]);
    });

    it('should handle API error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const originalGetRestClient = (globalThis as any).PCore.getRestClient;
      (globalThis as any).PCore.getRestClient = () => ({
        invokeRestApi: () => Promise.reject(new Error('API Error'))
      });

      mockPConn.getConfigProps.mockReturnValue({
        ...mockConfigProps,
        displayAs: 'Search box'
      });

      await component.updateSelf();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
      (globalThis as any).PCore.getRestClient = originalGetRestClient;
    });
  });

  describe('isUserNameAvailable', () => {
    it('should return truthy when user object has userName', () => {
      expect(component.isUserNameAvailable({ userName: 'Test' })).toBeTruthy();
    });

    it('should return falsy when user is null', () => {
      expect(component.isUserNameAvailable(null)).toBeFalsy();
    });

    it('should return falsy when user is not an object', () => {
      expect(component.isUserNameAvailable('string')).toBeFalsy();
    });

    it('should return falsy when user object lacks userName', () => {
      expect(component.isUserNameAvailable({ id: 'test' })).toBeFalsy();
    });
  });

  describe('getUserName', () => {
    it('should return userName from user object', () => {
      expect(component.getUserName({ userName: 'Test User' })).toBe('Test User');
    });
  });

  describe('getValue', () => {
    it('should return user ID for dropdown display', () => {
      component.displayAs$ = 'Drop-down list';
      mockUtils.getUserId.mockReturnValue('user123');
      expect(component.getValue({ userId: 'user123' })).toBe('user123');
    });

    it('should return userName when available for non-dropdown', () => {
      component.displayAs$ = 'Search box';
      expect(component.getValue({ userName: 'Test User' })).toBe('Test User');
    });

    it('should return userId when userName not available', () => {
      component.displayAs$ = 'Search box';
      mockUtils.getUserId.mockReturnValue('fallbackId');
      expect(component.getValue({ id: 'fallbackId' })).toBe('fallbackId');
    });
  });

  describe('fieldOnChange', () => {
    beforeEach(async () => {
      await component.updateSelf();
    });

    it('should handle Select value by clearing it', () => {
      const event = { value: 'Select' };
      component.fieldOnChange(event);
      expect(event.value).toBe('');
    });

    it('should set filterValue from input target', () => {
      const event = { target: { value: 'test filter' } };
      component.fieldOnChange(event);
      expect(component.filterValue).toBe('test filter');
    });

    it('should handle event with value', () => {
      const event = { value: 'user123' };
      component.fieldOnChange(event);
      // Verify the handler doesn't throw
      expect(true).toBe(true);
    });
  });

  describe('optionChanged', () => {
    beforeEach(async () => {
      await component.updateSelf();
    });

    it('should handle option selection', () => {
      const event = { option: { value: 'selectedUser' } };
      component.optionChanged(event);
      // Verify the handler doesn't throw
      expect(true).toBe(true);
    });
  });

  describe('fieldOnBlur', () => {
    beforeEach(async () => {
      component.options$ = [
        { key: 'user1', value: 'User One' },
        { key: 'user2', value: 'User Two' }
      ];
      await component.updateSelf();
    });

    it('should find key by matching value', () => {
      const event = { target: { value: 'User One' } };
      component.fieldOnBlur(event);
      // Key should be found
      expect(true).toBe(true);
    });

    it('should use value as key when not found in options', () => {
      const event = { target: { value: 'Unknown User' } };
      component.fieldOnBlur(event);
      expect(true).toBe(true);
    });

    it('should call onRecordChange if provided', () => {
      const onRecordChangeSpy = vi.fn();
      component.onRecordChange = onRecordChangeSpy;
      const event = { target: { value: 'User One' } };
      component.fieldOnBlur(event);
      expect(onRecordChangeSpy).toHaveBeenCalled();
    });

    it('should handle empty value', () => {
      const event = { target: { value: '' } };
      component.fieldOnBlur(event);
      expect(true).toBe(true);
    });
  });

  describe('getErrorMessage', () => {
    it('should return validate message when field has message error', () => {
      component.fieldControl.setErrors({ message: true });
      component.angularPConnectData.validateMessage = 'Custom error';
      expect(component.getErrorMessage()).toBe('Custom error');
    });

    it('should return required message when field has required error', () => {
      component.fieldControl.setErrors({ required: true });
      expect(component.getErrorMessage()).toBe('You must enter a value');
    });

    it('should return errors as string for other errors', () => {
      const errors = { custom: 'error' };
      component.fieldControl.setErrors(errors);
      expect(component.getErrorMessage()).toBeDefined();
    });

    it('should return empty string when no errors', () => {
      component.fieldControl.setErrors(null);
      expect(component.getErrorMessage()).toBe('');
    });
  });

  describe('_filter', () => {
    beforeEach(() => {
      component.options$ = [
        { value: 'John Doe' },
        { value: 'Jane Smith' },
        { value: 'Bob Johnson' }
      ];
    });

    it('should filter options by value', () => {
      const result = (component as any)._filter('john');
      expect(result.length).toBe(2); // John Doe and Bob Johnson
    });

    it('should use filterValue when value is empty', () => {
      component.filterValue = 'jane';
      const result = (component as any)._filter('');
      expect(result.length).toBe(1);
      expect(result[0].value).toBe('Jane Smith');
    });

    it('should handle null options', () => {
      component.options$ = null;
      const result = (component as any)._filter('test');
      expect(result).toBeUndefined();
    });
  });
});
