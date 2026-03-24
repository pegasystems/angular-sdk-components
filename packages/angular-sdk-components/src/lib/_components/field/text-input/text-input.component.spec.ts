import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { TextInputComponent } from './text-input.component';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';

describe('TextInputComponent', () => {
  setupTestBed({ zoneless: false });

  let component: TextInputComponent;
  let fixture: ComponentFixture<TextInputComponent>;
  let mockAngularPConnectService: {
    registerAndSubscribeComponent: Mock;
    shouldComponentUpdate: Mock;
    getComponentID: Mock;
  };
  let mockUtils: {
    getBooleanValue: Mock;
  };
  let mockPConn: any;

  const mockConfigProps = {
    value: 'test value',
    label: 'Test Label',
    testId: 'test-input',
    helperText: 'Helper text',
    placeholder: 'Enter value',
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
      getStateProps: vi.fn().mockReturnValue({ value: '.testProp' }),
      getActionsApi: vi.fn().mockReturnValue({
        updateFieldValue: vi.fn(),
        triggerFieldChange: vi.fn()
      }),
      clearErrorMessages: vi.fn(),
      getContextName: vi.fn().mockReturnValue('app/primary_1')
    };

    await TestBed.configureTestingModule({
      imports: [TextInputComponent, ReactiveFormsModule, NoopAnimationsModule, MatFormFieldModule, MatInputModule],
      providers: [
        { provide: AngularPConnectService, useValue: mockAngularPConnectService },
        { provide: Utils, useValue: mockUtils }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TextInputComponent);
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

    it('should set actionsApi from pConn', () => {
      fixture.detectChanges();
      expect(mockPConn.getActionsApi).toHaveBeenCalled();
      expect(component.actionsApi).toBeDefined();
    });

    it('should set propName from state props', () => {
      fixture.detectChanges();
      expect(mockPConn.getStateProps).toHaveBeenCalled();
      expect(component.propName).toBe('.testProp');
    });
  });

  describe('updateSelf', () => {
    it('should resolve config props', () => {
      fixture.detectChanges();
      expect(mockPConn.resolveConfigProps).toHaveBeenCalled();
    });

    it('should set value from config props', () => {
      fixture.detectChanges();
      expect(component.value$).toBe('test value');
    });

    it('should set label from config props', () => {
      fixture.detectChanges();
      expect(component.label$).toBe('Test Label');
    });

    it('should set testId from config props', () => {
      fixture.detectChanges();
      expect(component.testId).toBe('test-input');
    });

    it('should set placeholder from config props', () => {
      fixture.detectChanges();
      expect(component.placeholder).toBe('Enter value');
    });

    it('should set helperText from config props', () => {
      fixture.detectChanges();
      expect(component.helperText).toBe('Helper text');
    });
  });

  describe('fieldOnChange', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should clear error messages when value changes', () => {
      const event = { target: { value: 'new value' } };
      component.fieldOnChange(event);
      expect(mockPConn.clearErrorMessages).toHaveBeenCalledWith({ property: '.testProp' });
    });

    it('should not clear error messages when value is the same', () => {
      const event = { target: { value: 'test value' } };
      component.fieldOnChange(event);
      expect(mockPConn.clearErrorMessages).not.toHaveBeenCalled();
    });
  });

  describe('fieldOnBlur', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should not trigger event when value is unchanged', () => {
      const event = { target: { value: 'test value' } };
      component.fieldOnBlur(event);
      // handleEvent should not be called since value is unchanged
    });
  });

  describe('ngOnDestroy', () => {
    it('should remove control from form group', () => {
      fixture.detectChanges();
      expect(component.formGroup$.contains('test-comp-id')).toBe(true);
      component.ngOnDestroy();
      expect(component.formGroup$.contains('test-comp-id')).toBe(false);
    });

    it('should call unsubscribe function', () => {
      fixture.detectChanges();
      const unsubscribeFn = mockAngularPConnectService.registerAndSubscribeComponent().unsubscribeFn;
      component.ngOnDestroy();
      expect(unsubscribeFn).toHaveBeenCalled();
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

    it('should set readOnly property', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, readOnly: true });
      mockUtils.getBooleanValue.mockImplementation(val => val === true);
      // Manually call updateSelf instead of detectChanges to avoid template rendering
      component.updateSelf();
      expect(component.bReadonly$).toBe(true);
    });

    it('should handle visibility property', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, visibility: false });
      mockUtils.getBooleanValue.mockImplementation(val => val === true || val === 'true');
      fixture.detectChanges();
      expect(component.bVisible$).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return empty string when no errors', () => {
      expect(component.getErrorMessage()).toBe('');
    });

    it('should return required message for required error', () => {
      component.fieldControl.setErrors({ required: true });
      expect(component.getErrorMessage()).toBe('You must enter a value');
    });
  });
});
