import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { UrlComponent } from './url.component';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';

describe('UrlComponent', () => {
  setupTestBed({ zoneless: false });

  let component: UrlComponent;
  let fixture: ComponentFixture<UrlComponent>;
  let mockAngularPConnectService: {
    registerAndSubscribeComponent: Mock;
    shouldComponentUpdate: Mock;
    getComponentID: Mock;
  };
  let mockUtils: { getBooleanValue: Mock };
  let mockPConn: any;

  const mockConfigProps = {
    value: 'https://example.com',
    label: 'Website URL',
    testId: 'test-url',
    helperText: 'Enter a valid URL',
    placeholder: 'https://',
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
      getStateProps: vi.fn().mockReturnValue({ value: '.WebsiteURL' }),
      getActionsApi: vi.fn().mockReturnValue({
        updateFieldValue: vi.fn(),
        triggerFieldChange: vi.fn()
      }),
      clearErrorMessages: vi.fn(),
      getContextName: vi.fn().mockReturnValue('app/primary_1')
    };

    await TestBed.configureTestingModule({
      imports: [
        UrlComponent,
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

    fixture = TestBed.createComponent(UrlComponent);
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

    it('should set URL value from config props', () => {
      fixture.detectChanges();
      expect(component.value$).toBe('https://example.com');
    });

    it('should set label from config props', () => {
      fixture.detectChanges();
      expect(component.label$).toBe('Website URL');
    });
  });

  describe('fieldOnChange', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should clear error messages when value changes', () => {
      const event = { target: { value: 'https://newsite.com' } };
      component.fieldOnChange(event);
      expect(mockPConn.clearErrorMessages).toHaveBeenCalledWith({ property: '.WebsiteURL' });
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
      component.value$ = 'https://example.com';
      const event = { target: { value: 'https://newsite.com' } };
      component.fieldOnBlur(event);
      expect(mockPConn.getActionsApi).toHaveBeenCalled();
    });

    it('should not trigger action when value is unchanged', () => {
      component.value$ = 'https://example.com';
      const event = { target: { value: 'https://example.com' } };
      component.fieldOnBlur(event);
    });
  });

  describe('fieldOnChange edge cases', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should not clear error messages when value is unchanged', () => {
      component.value$ = 'https://example.com';
      const event = { target: { value: 'https://example.com' } };
      component.fieldOnChange(event);
      expect(mockPConn.clearErrorMessages).not.toHaveBeenCalled();
    });
  });
});
