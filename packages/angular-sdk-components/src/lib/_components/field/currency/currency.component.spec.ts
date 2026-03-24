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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { describe, it, expect, beforeEach, type Mock } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { CurrencyComponent } from './currency.component';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';

describe('CurrencyComponent', () => {
  setupTestBed({ zoneless: false });

  let component: CurrencyComponent;
  let fixture: ComponentFixture<CurrencyComponent>;
  let mockAngularPConnectService: {
    registerAndSubscribeComponent: Mock;
    shouldComponentUpdate: Mock;
    getComponentID: Mock;
  };
  let mockUtils: { getBooleanValue: Mock };
  let mockPConn: any;

  const mockConfigProps = {
    value: 1234.56,
    label: 'Amount',
    testId: 'test-currency',
    helperText: 'Enter amount',
    placeholder: '0.00',
    required: false,
    readOnly: false,
    disabled: false,
    visibility: true,
    currencyISOCode: 'USD',
    allowDecimals: true
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
      getStateProps: vi.fn().mockReturnValue({ value: '.Amount' }),
      getActionsApi: vi.fn().mockReturnValue({
        updateFieldValue: vi.fn(),
        triggerFieldChange: vi.fn()
      }),
      clearErrorMessages: vi.fn(),
      getContextName: vi.fn().mockReturnValue('app/primary_1')
    };

    await TestBed.configureTestingModule({
      imports: [CurrencyComponent, ReactiveFormsModule, NoopAnimationsModule, MatFormFieldModule, MatInputModule],
      providers: [
        { provide: AngularPConnectService, useValue: mockAngularPConnectService },
        { provide: Utils, useValue: mockUtils }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CurrencyComponent);
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

    it('should set numeric value from config props', () => {
      fixture.detectChanges();
      expect(component.value$).toBe(1234.56);
    });

    it('should parse string value to number', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, value: '999.99' });
      fixture.detectChanges();
      expect(component.value$).toBe(999.99);
    });

    it('should set label from config props', () => {
      fixture.detectChanges();
      expect(component.label$).toBe('Amount');
    });
  });

  describe('updateCurrencyProperties', () => {
    it('should set currency symbol for USD', () => {
      fixture.detectChanges();
      expect(component.currencySymbol).toBeDefined();
    });

    it('should set decimal precision to 2 when allowDecimals is true', () => {
      fixture.detectChanges();
      expect(component.decimalPrecision).toBe(2);
    });

    it('should set decimal precision to 0 when allowDecimals is false', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, allowDecimals: false });
      fixture.detectChanges();
      expect(component.decimalPrecision).toBe(0);
    });

    it('should set thousand separator', () => {
      fixture.detectChanges();
      expect(component.thousandSeparator).toBeDefined();
    });

    it('should set decimal separator', () => {
      fixture.detectChanges();
      expect(component.decimalSeparator).toBeDefined();
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
      component.value$ = 1234.56;
      component.thousandSeparator = ',';
      component.decimalSeparator = '.';
      const event = { target: { value: '$2,000.00' } };
      component.fieldOnBlur(event);
      expect(mockPConn.getActionsApi).toHaveBeenCalled();
    });

    it('should not trigger action when value is unchanged', () => {
      component.value$ = 1234.56;
      const event = { target: { value: '1234.56' } };
      component.fieldOnBlur(event);
    });

    it('should handle blur with dot as thousand separator', () => {
      component.value$ = 1234.56;
      component.thousandSeparator = '.';
      component.decimalSeparator = ',';
      const event = { target: { value: '$1.234,56' } };
      component.fieldOnBlur(event);
      expect(mockPConn.getActionsApi).toHaveBeenCalled();
    });
    it('should replace decimal separator when not a dot', () => {
      component.value$ = 1234.56;
      component.thousandSeparator = ' ';
      component.decimalSeparator = ',';
      const event = { target: { value: '$1 234,56' } };
      component.fieldOnBlur(event);
      expect(mockPConn.getActionsApi).toHaveBeenCalled();
    });
  });
});
