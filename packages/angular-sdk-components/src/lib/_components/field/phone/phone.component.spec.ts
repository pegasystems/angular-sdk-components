import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { PhoneComponent } from './phone.component';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';

describe('PhoneComponent', () => {
  setupTestBed({ zoneless: false });

  let component: PhoneComponent;
  let fixture: ComponentFixture<PhoneComponent>;
  let mockAngularPConnectService: {
    registerAndSubscribeComponent: Mock;
    shouldComponentUpdate: Mock;
    getComponentID: Mock;
  };
  let mockUtils: { getBooleanValue: Mock };
  let mockPConn: any;

  const mockConfigProps = {
    value: '+1-555-123-4567',
    label: 'Phone Number',
    testId: 'test-phone',
    helperText: 'Enter your phone number',
    placeholder: '+1-XXX-XXX-XXXX',
    required: false,
    readOnly: false,
    disabled: false,
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
      getStateProps: vi.fn().mockReturnValue({ value: '.PhoneNumber' }),
      getActionsApi: vi.fn().mockReturnValue({
        updateFieldValue: vi.fn(),
        triggerFieldChange: vi.fn()
      }),
      clearErrorMessages: vi.fn(),
      getContextName: vi.fn().mockReturnValue('app/primary_1')
    };

    await TestBed.configureTestingModule({
      imports: [PhoneComponent, ReactiveFormsModule, NoopAnimationsModule, MatFormFieldModule, MatInputModule],
      providers: [
        { provide: AngularPConnectService, useValue: mockAngularPConnectService },
        { provide: Utils, useValue: mockUtils }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PhoneComponent);
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

    it('should add field control to form group', () => {
      fixture.detectChanges();
      expect(component.formGroup$.contains('test-comp-id')).toBe(true);
    });
  });

  describe('updateSelf', () => {
    it('should resolve config props', () => {
      fixture.detectChanges();
      expect(mockPConn.resolveConfigProps).toHaveBeenCalled();
    });

    it('should set phone value from config props', () => {
      fixture.detectChanges();
      expect(component.value$).toBe('+1-555-123-4567');
    });

    it('should set label from config props', () => {
      fixture.detectChanges();
      expect(component.label$).toBe('Phone Number');
    });
  });

  describe('fieldOnChange', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call handleEvent when value changes', () => {
      // Set a new value that's different from the original
      component.formGroup$.controls[component.controlName$].setValue('+1-555-987-6543');
      component.fieldOnChange();
      // The actionsApi should be called through handleEvent
      expect(mockPConn.getActionsApi).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should remove control from form group', () => {
      fixture.detectChanges();
      expect(component.formGroup$.contains('test-comp-id')).toBe(true);
      component.ngOnDestroy();
      expect(component.formGroup$.contains('test-comp-id')).toBe(false);
    });
  });

  describe('component properties', () => {
    it('should handle required property', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, required: true });
      mockUtils.getBooleanValue.mockImplementation(val => val === true);
      fixture.detectChanges();
      expect(component.bRequired$).toBe(true);
    });

    it('should handle disabled property', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, disabled: true });
      mockUtils.getBooleanValue.mockImplementation(val => val === true);
      fixture.detectChanges();
      expect(component.bDisabled$).toBe(true);
    });
  });

  describe('fieldOnBlur', () => {
    it('should exist as a method', () => {
      fixture.detectChanges();
      expect(component.fieldOnBlur).toBeDefined();
      component.fieldOnBlur();
    });
  });

  describe('updatePreferredCountries', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should update preferred countries for US phone number', () => {
      component.value$ = '+15551234567';
      component.updatePreferredCountries();
      expect(component.preferredCountries).toContain('us');
    });

    it('should handle non-US phone numbers', () => {
      component.value$ = '+442071234567';
      component.updatePreferredCountries();
      expect(component.preferredCountries).toBeDefined();
    });

    it('should handle invalid phone numbers gracefully', () => {
      component.value$ = 'invalid';
      component.updatePreferredCountries();
      expect(component.preferredCountries).toContain('us');
    });
  });

  describe('getErrorMessage', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return validate message when hasError message', () => {
      component.fieldControl.setErrors({ message: true });
      component.angularPConnectData = { validateMessage: 'Custom phone error' };
      expect(component.getErrorMessage()).toBe('Custom phone error');
    });

    it('should return required message when hasError required', () => {
      component.fieldControl.setErrors({ required: true });
      expect(component.getErrorMessage()).toBe('You must enter a value');
    });

    it('should return Invalid Phone for other errors', () => {
      component.fieldControl.setErrors({ invalidPhone: true });
      expect(component.getErrorMessage()).toBe('Invalid Phone');
    });

    it('should return empty string when no errors', () => {
      component.fieldControl.setErrors(null);
      expect(component.getErrorMessage()).toBe('');
    });
  });
});
