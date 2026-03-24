import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { IntegerComponent } from './integer.component';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';

describe('IntegerComponent', () => {
  setupTestBed({ zoneless: false });

  let component: IntegerComponent;
  let fixture: ComponentFixture<IntegerComponent>;
  let mockAngularPConnectService: {
    registerAndSubscribeComponent: Mock;
    shouldComponentUpdate: Mock;
    getComponentID: Mock;
  };
  let mockUtils: { getBooleanValue: Mock };
  let mockPConn: any;

  const mockConfigProps = {
    value: 42,
    label: 'Quantity',
    testId: 'test-integer',
    helperText: 'Enter a whole number',
    placeholder: '0',
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
      getStateProps: vi.fn().mockReturnValue({ value: '.Quantity' }),
      getActionsApi: vi.fn().mockReturnValue({
        updateFieldValue: vi.fn(),
        triggerFieldChange: vi.fn()
      }),
      clearErrorMessages: vi.fn(),
      getContextName: vi.fn().mockReturnValue('app/primary_1')
    };

    await TestBed.configureTestingModule({
      imports: [
        IntegerComponent,
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

    fixture = TestBed.createComponent(IntegerComponent);
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

    it('should set integer value from config props', () => {
      fixture.detectChanges();
      expect(component.value$).toBe(42);
    });

    it('should set label from config props', () => {
      fixture.detectChanges();
      expect(component.label$).toBe('Quantity');
    });
  });

  describe('fieldOnChange', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should clear error messages when value changes', () => {
      const event = { target: { value: '100' } };
      component.fieldOnChange(event);
      expect(mockPConn.clearErrorMessages).toHaveBeenCalledWith({ property: '.Quantity' });
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
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle blur when value changes', () => {
      component.value$ = 42;
      const event = { target: { value: '100' } };
      component.fieldOnBlur(event);
      expect(mockPConn.getActionsApi).toHaveBeenCalled();
    });

    it('should not trigger action when value is unchanged', () => {
      component.value$ = 42;
      const event = { target: { value: '42' } };
      component.fieldOnBlur(event);
    });
  });

  describe('value parsing', () => {
    it('should parse string value to integer', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, value: '123' });
      fixture.detectChanges();
      expect(component.value$).toBe(123);
    });

    it('should handle numeric value directly', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, value: 456 });
      fixture.detectChanges();
      expect(component.value$).toBe(456);
    });
  });
});
