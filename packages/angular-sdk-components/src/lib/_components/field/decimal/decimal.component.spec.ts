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

import { DecimalComponent } from './decimal.component';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';

describe('DecimalComponent', () => {
  setupTestBed({ zoneless: false });

  let component: DecimalComponent;
  let fixture: ComponentFixture<DecimalComponent>;
  let mockAngularPConnectService: {
    registerAndSubscribeComponent: Mock;
    shouldComponentUpdate: Mock;
    getComponentID: Mock;
  };
  let mockUtils: { getBooleanValue: Mock };
  let mockPConn: any;

  const mockConfigProps = {
    value: 123.45,
    label: 'Price',
    testId: 'test-decimal',
    helperText: 'Enter a decimal number',
    placeholder: '0.00',
    required: false,
    readOnly: false,
    disabled: false,
    visibility: true,
    decimalPrecision: 2
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
      getStateProps: vi.fn().mockReturnValue({ value: '.Price' }),
      getActionsApi: vi.fn().mockReturnValue({
        updateFieldValue: vi.fn(),
        triggerFieldChange: vi.fn()
      }),
      clearErrorMessages: vi.fn(),
      getContextName: vi.fn().mockReturnValue('app/primary_1')
    };

    await TestBed.configureTestingModule({
      imports: [
        DecimalComponent,
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

    fixture = TestBed.createComponent(DecimalComponent);
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

    it('should set decimal value from config props', () => {
      fixture.detectChanges();
      expect(component.value$).toBe(123.45);
    });

    it('should set label from config props', () => {
      fixture.detectChanges();
      expect(component.label$).toBe('Price');
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

  describe('updateDecimalProperties', () => {
    it('should set decimal precision from config', () => {
      fixture.detectChanges();
      expect(component.decimalPrecision).toBe(2);
    });

    it('should use default decimal precision of 2 when not specified', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, decimalPrecision: undefined });
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

    it('should set currency symbol when readonly and formatter is Currency', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, readOnly: true, formatter: 'Currency' });
      mockUtils.getBooleanValue.mockImplementation(val => val === true);
      fixture.detectChanges();
      expect(component.currencySymbol).toBe('$');
    });

    it('should set suffix to % when readonly and formatter is Percentage', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, readOnly: true, formatter: 'Percentage' });
      mockUtils.getBooleanValue.mockImplementation(val => val === true);
      fixture.detectChanges();
      expect(component.suffix).toBe('%');
    });
  });

  describe('fieldOnBlur', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle blur when value changes', () => {
      component.value$ = 123.45;
      component.configProps$ = { ...mockConfigProps, showGroupSeparators: false };
      component.decimalSeparator = '.';
      const event = { target: { value: '200.50' } };
      component.fieldOnBlur(event);
      expect(mockPConn.getActionsApi).toHaveBeenCalled();
    });

    it('should not trigger action when value is unchanged', () => {
      component.value$ = 123.45;
      const event = { target: { value: '123.45' } };
      component.fieldOnBlur(event);
    });

    it('should remove thousand separators when showGroupSeparators is true', () => {
      component.value$ = 123.45;
      component.configProps$ = { ...mockConfigProps, showGroupSeparators: true };
      component.thousandSeparator = ',';
      component.decimalSeparator = '.';
      const event = { target: { value: '1,234.56' } };
      component.fieldOnBlur(event);
      expect(mockPConn.getActionsApi).toHaveBeenCalled();
    });

    it('should handle dot as thousand separator', () => {
      component.value$ = 123.45;
      component.configProps$ = { ...mockConfigProps, showGroupSeparators: true };
      component.thousandSeparator = '.';
      component.decimalSeparator = ',';
      const event = { target: { value: '1.234,56' } };
      component.fieldOnBlur(event);
      expect(mockPConn.getActionsApi).toHaveBeenCalled();
    });

    it('should replace decimal separator when not a dot', () => {
      component.value$ = 123.45;
      component.configProps$ = { ...mockConfigProps, showGroupSeparators: false };
      component.decimalSeparator = ',';
      const event = { target: { value: '200,50' } };
      component.fieldOnBlur(event);
      expect(mockPConn.getActionsApi).toHaveBeenCalled();
    });
  });
});
