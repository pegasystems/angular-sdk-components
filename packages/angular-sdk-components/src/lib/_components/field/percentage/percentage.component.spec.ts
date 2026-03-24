import { vi } from 'vitest';

// Mock currency-utils before importing the component
vi.mock('../../../_helpers/currency-utils', () => ({
  getCurrencyOptions: () => ({ locale: 'en-US', style: 'currency', currency: 'USD' }),
  getCurrencyCharacters: () => ({
    theCurrencySymbol: '$',
    theDecimalIndicator: '.',
    theDigitGroupSeparator: ','
  })
}));

// Mock formatters to avoid PCore dependency
vi.mock('../../../_helpers/formatters', () => ({
  format: (value: any) => value?.toString() ?? ''
}));

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { describe, it, expect, beforeEach, type Mock } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { PercentageComponent } from './percentage.component';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';

describe('PercentageComponent', () => {
  setupTestBed({ zoneless: false });

  let component: PercentageComponent;
  let fixture: ComponentFixture<PercentageComponent>;
  let mockAngularPConnectService: {
    registerAndSubscribeComponent: Mock;
    shouldComponentUpdate: Mock;
    getComponentID: Mock;
  };
  let mockUtils: { getBooleanValue: Mock };
  let mockPConn: any;

  const mockConfigProps = {
    value: 75.5,
    label: 'Completion Rate',
    testId: 'test-percentage',
    helperText: 'Enter percentage value',
    placeholder: '0%',
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
      getStateProps: vi.fn().mockReturnValue({ value: '.CompletionRate' }),
      getActionsApi: vi.fn().mockReturnValue({
        updateFieldValue: vi.fn(),
        triggerFieldChange: vi.fn()
      }),
      clearErrorMessages: vi.fn(),
      getContextName: vi.fn().mockReturnValue('app/primary_1')
    };

    await TestBed.configureTestingModule({
      imports: [PercentageComponent, ReactiveFormsModule, NoopAnimationsModule, MatFormFieldModule, MatInputModule],
      providers: [
        { provide: AngularPConnectService, useValue: mockAngularPConnectService },
        { provide: Utils, useValue: mockUtils }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PercentageComponent);
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

    it('should set percentage value from config props', () => {
      fixture.detectChanges();
      expect(component.value$).toBe(75.5);
    });

    it('should set label from config props', () => {
      fixture.detectChanges();
      expect(component.label$).toBe('Completion Rate');
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

  describe('updatePercentageProperties', () => {
    it('should set decimal precision from config', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, decimalPrecision: 3 });
      fixture.detectChanges();
      expect(component.decimalPrecision).toBe(3);
    });

    it('should use default decimal precision of 2 when not specified', () => {
      fixture.detectChanges();
      expect(component.decimalPrecision).toBe(2);
    });

    it('should set thousand separator when showGroupSeparators is true', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, showGroupSeparators: true });
      fixture.detectChanges();
      expect(component.thousandSeparator).toBe(',');
    });

    it('should set empty thousand separator when showGroupSeparators is false', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, showGroupSeparators: false });
      fixture.detectChanges();
      expect(component.thousandSeparator).toBe('');
    });
  });

  describe('fieldOnChange', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should clear error messages when value changes', () => {
      component.value$ = 75.5;
      const event = { target: { value: '80.0' } };
      component.fieldOnChange(event);
      expect(mockPConn.clearErrorMessages).toHaveBeenCalledWith({ property: '.CompletionRate' });
    });

    it('should not clear error messages when value is unchanged', () => {
      component.value$ = 75.5;
      const event = { target: { value: '75.5' } };
      component.fieldOnChange(event);
      expect(mockPConn.clearErrorMessages).not.toHaveBeenCalled();
    });
  });

  describe('fieldOnBlur', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle blur when value changes', () => {
      component.value$ = 75.5;
      component.configProps$ = { ...mockConfigProps, showGroupSeparators: false };
      component.decimalSeparator = '.';
      const event = { target: { value: '80.5%' } };
      component.fieldOnBlur(event);
      expect(mockPConn.getActionsApi).toHaveBeenCalled();
    });

    it('should not trigger action when value is unchanged', () => {
      component.value$ = 75.5;
      const event = { target: { value: '75.5' } };
      component.fieldOnBlur(event);
    });

    it('should remove % sign from value', () => {
      component.value$ = 75.5;
      component.configProps$ = { ...mockConfigProps, showGroupSeparators: false };
      component.decimalSeparator = '.';
      const event = { target: { value: '80%' } };
      component.fieldOnBlur(event);
      expect(mockPConn.getActionsApi).toHaveBeenCalled();
    });

    it('should remove thousand separators when showGroupSeparators is true', () => {
      component.value$ = 75.5;
      component.configProps$ = { ...mockConfigProps, showGroupSeparators: true };
      component.thousandSeparator = ',';
      component.decimalSeparator = '.';
      const event = { target: { value: '1,234.56%' } };
      component.fieldOnBlur(event);
      expect(mockPConn.getActionsApi).toHaveBeenCalled();
    });

    it('should replace decimal separator when not a dot', () => {
      component.value$ = 75.5;
      component.configProps$ = { ...mockConfigProps, showGroupSeparators: false };
      component.decimalSeparator = ',';
      const event = { target: { value: '80,5%' } };
      component.fieldOnBlur(event);
      expect(mockPConn.getActionsApi).toHaveBeenCalled();
    });
  });

  describe('display modes', () => {
    it('should format value for DISPLAY_ONLY mode', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        displayMode: 'DISPLAY_ONLY'
      });
      component.displayMode$ = 'DISPLAY_ONLY';
      component.updateSelf();
      expect(component.formattedValue).toBeDefined();
    });

    it('should format value for STACKED_LARGE_VAL mode', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        displayMode: 'STACKED_LARGE_VAL'
      });
      component.displayMode$ = 'STACKED_LARGE_VAL';
      component.updateSelf();
      expect(component.formattedValue).toBeDefined();
    });
  });
});
