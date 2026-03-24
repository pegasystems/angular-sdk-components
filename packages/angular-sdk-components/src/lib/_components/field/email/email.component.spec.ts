import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { EmailComponent } from './email.component';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';

describe('EmailComponent', () => {
  setupTestBed({ zoneless: false });

  let component: EmailComponent;
  let fixture: ComponentFixture<EmailComponent>;
  let mockAngularPConnectService: {
    registerAndSubscribeComponent: Mock;
    shouldComponentUpdate: Mock;
    getComponentID: Mock;
  };
  let mockUtils: { getBooleanValue: Mock };
  let mockPConn: any;

  const mockConfigProps = {
    value: 'test@example.com',
    label: 'Email Address',
    testId: 'test-email',
    helperText: 'Enter your email',
    placeholder: 'email@example.com',
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
      getStateProps: vi.fn().mockReturnValue({ value: '.Email' }),
      getActionsApi: vi.fn().mockReturnValue({
        updateFieldValue: vi.fn(),
        triggerFieldChange: vi.fn()
      }),
      clearErrorMessages: vi.fn(),
      getContextName: vi.fn().mockReturnValue('app/primary_1')
    };

    await TestBed.configureTestingModule({
      imports: [
        EmailComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule
      ],
      providers: [
        { provide: AngularPConnectService, useValue: mockAngularPConnectService },
        { provide: Utils, useValue: mockUtils }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmailComponent);
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

    it('should set email value from config props', () => {
      fixture.detectChanges();
      expect(component.value$).toBe('test@example.com');
    });

    it('should set label from config props', () => {
      fixture.detectChanges();
      expect(component.label$).toBe('Email Address');
    });

    it('should set placeholder from config props', () => {
      fixture.detectChanges();
      expect(component.placeholder).toBe('email@example.com');
    });
  });

  describe('fieldOnChange', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should clear error messages when email value changes', () => {
      const event = { target: { value: 'newemail@example.com' } };
      component.fieldOnChange(event);
      expect(mockPConn.clearErrorMessages).toHaveBeenCalledWith({ property: '.Email' });
    });

    it('should not clear error messages when value is the same', () => {
      const event = { target: { value: 'test@example.com' } };
      component.fieldOnChange(event);
      expect(mockPConn.clearErrorMessages).not.toHaveBeenCalled();
    });
  });

  describe('fieldOnBlur', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should not trigger event when value is unchanged', () => {
      const event = { target: { value: 'test@example.com' } };
      component.fieldOnBlur(event);
      // No action expected since value is unchanged
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
});
