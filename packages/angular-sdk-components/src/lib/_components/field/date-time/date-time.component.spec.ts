// Ensure PCore is defined before component module loads
if (typeof (globalThis as any).PCore === 'undefined') {
  (globalThis as any).PCore = {
    getEnvironmentInfo: () => ({
      getTimeZone: () => 'UTC'
    }),
    getLocaleUtils: () => ({
      getLocaleValue: (value: string) => value
    })
  };
}

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

// Mock formatters
vi.mock('../../../_helpers/formatters', () => ({
  DateFormatters: {
    convertToTimezone: vi.fn().mockImplementation(value => value)
  }
}));

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { describe, it, expect, beforeEach, type Mock } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { DateTimeComponent } from './date-time.component';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';

describe('DateTimeComponent', () => {
  setupTestBed({ zoneless: false });

  let component: DateTimeComponent;
  let fixture: ComponentFixture<DateTimeComponent>;
  let mockAngularPConnectService: {
    registerAndSubscribeComponent: Mock;
    shouldComponentUpdate: Mock;
    getComponentID: Mock;
  };
  let mockUtils: {
    getBooleanValue: Mock;
    generateDate: Mock;
    generateDateTime: Mock;
  };
  let mockPConn: any;

  const mockConfigProps = {
    value: '2024-01-15T10:30:00Z',
    label: 'Appointment Time',
    testId: 'test-datetime',
    helperText: 'Select date and time',
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
      getBooleanValue: vi.fn().mockImplementation(val => val === true || val === 'true'),
      generateDate: vi.fn().mockReturnValue('Jan 15, 2024'),
      generateDateTime: vi.fn().mockReturnValue('Jan 15, 2024 10:30 AM')
    };

    mockPConn = {
      getConfigProps: vi.fn().mockReturnValue(mockConfigProps),
      resolveConfigProps: vi.fn().mockReturnValue(mockConfigProps),
      getStateProps: vi.fn().mockReturnValue({ value: '.AppointmentTime' }),
      getActionsApi: vi.fn().mockReturnValue({
        updateFieldValue: vi.fn(),
        triggerFieldChange: vi.fn()
      }),
      clearErrorMessages: vi.fn(),
      getContextName: vi.fn().mockReturnValue('app/primary_1')
    };

    await TestBed.configureTestingModule({
      imports: [
        DateTimeComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule
      ],
      providers: [
        { provide: AngularPConnectService, useValue: mockAngularPConnectService },
        { provide: Utils, useValue: mockUtils }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DateTimeComponent);
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

    it('should set datetime value from config props', () => {
      fixture.detectChanges();
      expect(component.value$).toBe('2024-01-15T10:30:00Z');
    });

    it('should set label from config props', () => {
      fixture.detectChanges();
      expect(component.label$).toBe('Appointment Time');
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

  describe('generateDateTime', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return empty string for empty value', () => {
      expect(component.generateDateTime('')).toBe('');
    });

    it('should return empty string for null value', () => {
      expect(component.generateDateTime(null)).toBe('');
    });

    it('should call generateDate for date-only string (10 chars)', () => {
      component.generateDateTime('2024-01-15');
      expect(mockUtils.generateDate).toHaveBeenCalledWith('2024-01-15', 'Date-Long-Custom-YYYY');
    });

    it('should call generateDateTime for full datetime string', () => {
      component.generateDateTime('2024-01-15T10:30:00Z');
      expect(mockUtils.generateDateTime).toHaveBeenCalledWith('2024-01-15T10:30:00Z', 'DateTime-Long-YYYY-Custom');
    });
  });

  describe('fieldOnDateChange', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle date object from picker', () => {
      const mockDate = new Date('2024-02-20T14:30:00Z');
      const event = { value: mockDate };
      component.fieldOnDateChange(event);
      expect(mockPConn.getActionsApi).toHaveBeenCalled();
    });

    it('should handle string value', () => {
      const event = { value: '2024-02-20T14:30:00Z' };
      component.fieldOnDateChange(event);
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

  describe('initialization', () => {
    it('should have default step values', () => {
      fixture.detectChanges();
      expect(component.stepHour).toBe(1);
      expect(component.stepMinute).toBe(1);
      expect(component.stepSecond).toBe(1);
    });

    it('should have primary color', () => {
      fixture.detectChanges();
      expect(component.color).toBe('primary');
    });
  });
});
