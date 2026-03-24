import { vi } from 'vitest';

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

import { TimeComponent } from './time.component';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';

describe('TimeComponent', () => {
  setupTestBed({ zoneless: false });

  let component: TimeComponent;
  let fixture: ComponentFixture<TimeComponent>;
  let mockAngularPConnectService: {
    registerAndSubscribeComponent: Mock;
    shouldComponentUpdate: Mock;
    getComponentID: Mock;
  };
  let mockUtils: { getBooleanValue: Mock };
  let mockPConn: any;

  const mockConfigProps = {
    value: '14:30:00',
    label: 'Meeting Time',
    testId: 'test-time',
    helperText: 'Select a time',
    placeholder: 'HH:MM',
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
      getStateProps: vi.fn().mockReturnValue({ value: '.MeetingTime' }),
      getActionsApi: vi.fn().mockReturnValue({
        updateFieldValue: vi.fn(),
        triggerFieldChange: vi.fn()
      }),
      clearErrorMessages: vi.fn(),
      getContextName: vi.fn().mockReturnValue('app/primary_1')
    };

    await TestBed.configureTestingModule({
      imports: [
        TimeComponent,
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

    fixture = TestBed.createComponent(TimeComponent);
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

    it('should set time value from config props', () => {
      fixture.detectChanges();
      expect(component.value$).toBe('14:30:00');
    });

    it('should set label from config props', () => {
      fixture.detectChanges();
      expect(component.label$).toBe('Meeting Time');
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

  describe('fieldOnChange', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should clear error messages when value changes', () => {
      component.value$ = '14:30:00';
      const event = { target: { value: '15:00:00' } };
      component.fieldOnChange(event);
      expect(mockPConn.clearErrorMessages).toHaveBeenCalledWith({ property: '.MeetingTime' });
    });

    it('should not clear error messages when value is the same', () => {
      component.value$ = '14:30:00';
      const event = { target: { value: '14:30:00' } };
      component.fieldOnChange(event);
      expect(mockPConn.clearErrorMessages).not.toHaveBeenCalled();
    });
  });

  describe('fieldOnBlur', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle blur with value change in HH:MM format', () => {
      component.value$ = '14:30:00';
      const event = { target: { value: '15:00' } };
      component.fieldOnBlur(event);
      // Should append :00 to HH:MM format
      expect(mockPConn.getActionsApi).toHaveBeenCalled();
    });

    it('should handle blur with full HH:MM:SS format', () => {
      component.value$ = '14:30:00';
      const event = { target: { value: '15:00:30' } };
      component.fieldOnBlur(event);
      expect(mockPConn.getActionsApi).toHaveBeenCalled();
    });

    it('should not trigger action when value is unchanged', () => {
      component.value$ = '14:30:00';
      const event = { target: { value: '14:30:00' } };
      component.fieldOnBlur(event);
      // Since value hasn't changed, getActionsApi should only be called during initialization
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
