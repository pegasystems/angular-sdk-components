import { vi } from 'vitest';

// Mock date-format-utils before importing the component
vi.mock('../../../_helpers/date-format-utils', () => ({
  dateFormatInfoDefault: {
    dateFormatString: 'MM/DD/YYYY',
    dateFormatStringLong: 'MMM DD, YYYY',
    dateFormatStringLC: 'mm/dd/yyyy',
    dateFormatMask: '__/__/____'
  },
  getDateFormatInfo: () => ({
    dateFormatString: 'MM/DD/YYYY',
    dateFormatStringLong: 'MMM DD, YYYY',
    dateFormatStringLC: 'mm/dd/yyyy',
    dateFormatMask: '__/__/____'
  })
}));

// Mock formatters to avoid PCore dependency
vi.mock('../../../_helpers/formatters', () => ({
  format: (value: any) => value?.toString() ?? ''
}));

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MomentDateModule } from '@angular/material-moment-adapter';
import { describe, it, expect, beforeEach, type Mock } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { DateComponent } from './date.component';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';

describe('DateComponent', () => {
  setupTestBed({ zoneless: false });

  let component: DateComponent;
  let fixture: ComponentFixture<DateComponent>;
  let mockAngularPConnectService: {
    registerAndSubscribeComponent: Mock;
    shouldComponentUpdate: Mock;
    getComponentID: Mock;
  };
  let mockUtils: { getBooleanValue: Mock };
  let mockPConn: any;

  const mockConfigProps = {
    value: '2024-01-15',
    label: 'Date of Birth',
    testId: 'test-date',
    helperText: 'Select your date of birth',
    placeholder: 'MM/DD/YYYY',
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
      getStateProps: vi.fn().mockReturnValue({ value: '.DateOfBirth' }),
      getActionsApi: vi.fn().mockReturnValue({
        updateFieldValue: vi.fn(),
        triggerFieldChange: vi.fn()
      }),
      clearErrorMessages: vi.fn(),
      getContextName: vi.fn().mockReturnValue('app/primary_1')
    };

    await TestBed.configureTestingModule({
      imports: [
        DateComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MomentDateModule
      ],
      providers: [
        { provide: AngularPConnectService, useValue: mockAngularPConnectService },
        { provide: Utils, useValue: mockUtils }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DateComponent);
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

    it('should set date value from config props', () => {
      fixture.detectChanges();
      expect(component.value$).toBe('2024-01-15');
    });

    it('should set label from config props', () => {
      fixture.detectChanges();
      expect(component.label$).toBe('Date of Birth');
    });

    it('should have date format info', () => {
      fixture.detectChanges();
      expect(component.theDateFormat).toBeDefined();
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

    it('should set readOnly property', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, readOnly: true });
      mockUtils.getBooleanValue.mockImplementation(val => val === true);
      // Manually call updateSelf instead of detectChanges to avoid template rendering
      component.updateSelf();
      expect(component.bReadonly$).toBe(true);
    });
  });

  describe('fieldOnDateChange', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call clearErrorMessages when date changes', () => {
      const mockEvent = {
        target: {
          value: {
            format: vi.fn().mockReturnValue('2024-02-20')
          }
        }
      };
      component.fieldOnDateChange(mockEvent);
      expect(mockPConn.clearErrorMessages).toHaveBeenCalledWith({ property: '.DateOfBirth' });
    });
  });

  describe('hasErrors', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return true when field control is INVALID', () => {
      component.fieldControl.setErrors({ required: true });
      expect(component.hasErrors()).toBe(true);
    });

    it('should return false when field control is VALID', () => {
      component.fieldControl.setErrors(null);
      expect(component.hasErrors()).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return required message when hasError required', () => {
      component.fieldControl.setErrors({ required: true });
      expect(component.getErrorMessage()).toBe('You must enter a value');
    });

    it('should return date parse error message when has matDatepickerParse error', () => {
      component.fieldControl.setErrors({ matDatepickerParse: { text: 'invalid-date' } });
      expect(component.getErrorMessage()).toBe('invalid-date is not a valid date value');
    });

    it('should return empty string when no errors', () => {
      component.fieldControl.setErrors(null);
      expect(component.getErrorMessage()).toBe('');
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
      expect(component.formattedValue$).toBeDefined();
    });

    it('should format value for STACKED_LARGE_VAL mode', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        displayMode: 'STACKED_LARGE_VAL'
      });
      component.displayMode$ = 'STACKED_LARGE_VAL';
      component.updateSelf();
      expect(component.formattedValue$).toBeDefined();
    });
  });
});
