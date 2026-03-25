import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { CheckBoxComponent } from './check-box.component';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';

describe('CheckBoxComponent', () => {
  setupTestBed({ zoneless: false });

  let component: CheckBoxComponent;
  let fixture: ComponentFixture<CheckBoxComponent>;
  let mockAngularPConnectService: {
    registerAndSubscribeComponent: Mock;
    shouldComponentUpdate: Mock;
    getComponentID: Mock;
  };
  let mockUtils: { getBooleanValue: Mock };
  let mockPConn: any;

  const mockConfigProps = {
    value: true,
    label: 'Accept Terms',
    testId: 'test-checkbox',
    helperText: 'Please accept the terms',
    caption: 'I agree to the terms and conditions',
    trueLabel: 'Yes',
    falseLabel: 'No',
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
      getStateProps: vi.fn().mockReturnValue({ value: '.AcceptTerms' }),
      getActionsApi: vi.fn().mockReturnValue({
        updateFieldValue: vi.fn(),
        triggerFieldChange: vi.fn()
      }),
      getValidationApi: vi.fn().mockReturnValue({
        validate: vi.fn()
      }),
      clearErrorMessages: vi.fn(),
      setReferenceList: vi.fn(),
      getContextName: vi.fn().mockReturnValue('app/primary_1')
    };

    await TestBed.configureTestingModule({
      imports: [CheckBoxComponent, ReactiveFormsModule, NoopAnimationsModule, MatCheckboxModule, MatFormFieldModule],
      providers: [
        { provide: AngularPConnectService, useValue: mockAngularPConnectService },
        { provide: Utils, useValue: mockUtils }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckBoxComponent);
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

    it('should set checkbox value from config props', () => {
      fixture.detectChanges();
      expect(component.value$).toBe(true);
    });

    it('should set isChecked to true when value is true', () => {
      fixture.detectChanges();
      expect(component.isChecked$).toBe(true);
    });

    it('should set isChecked to false when value is false', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, value: false });
      fixture.detectChanges();
      expect(component.isChecked$).toBe(false);
    });

    it('should set caption from config props', () => {
      fixture.detectChanges();
      expect(component.caption$).toBe('I agree to the terms and conditions');
    });

    it('should set trueLabel from config props', () => {
      fixture.detectChanges();
      expect(component.trueLabel$).toBe('Yes');
    });

    it('should set falseLabel from config props', () => {
      fixture.detectChanges();
      expect(component.falseLabel$).toBe('No');
    });

    it('should use default trueLabel when not provided', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, trueLabel: undefined });
      fixture.detectChanges();
      expect(component.trueLabel$).toBe('Yes');
    });

    it('should use default falseLabel when not provided', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, falseLabel: undefined });
      fixture.detectChanges();
      expect(component.falseLabel$).toBe('No');
    });
  });

  describe('fieldOnChange', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should clear error messages on change', () => {
      const event = { checked: true };
      component.fieldOnChange(event);
      expect(mockPConn.clearErrorMessages).toHaveBeenCalledWith({ property: '.AcceptTerms' });
    });

    it('should set event.value to event.checked', () => {
      const event = { checked: true } as any;
      component.fieldOnChange(event);
      expect(event.value).toBe(true);
    });
  });

  describe('fieldOnBlur', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should validate on blur', () => {
      const event = { target: { checked: true } };
      component.fieldOnBlur(event);
      expect(mockPConn.getValidationApi().validate).toHaveBeenCalledWith(true);
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

  describe('multi selection mode', () => {
    const multiConfigProps = {
      ...mockConfigProps,
      selectionMode: 'multi',
      referenceList: 'SelectedItems',
      selectionList: [],
      datasource: {
        source: [
          { key: '1', value: 'Option 1' },
          { key: '2', value: 'Option 2' }
        ]
      },
      selectionKey: '.ID',
      primaryField: 'Name',
      readonlyContextList: [],
      renderMode: 'Editable'
    };

    beforeEach(() => {
      // Add additional mocks needed for multi-selection mode
      mockPConn.getFieldMetadata = vi.fn().mockReturnValue({
        datasource: { parameters: {} }
      });
      mockPConn.getListActions = vi.fn().mockReturnValue({
        initDefaultPageInstructions: vi.fn(),
        insert: vi.fn(),
        deleteEntry: vi.fn()
      });
    });

    it('should handle multi selection mode', () => {
      mockPConn.resolveConfigProps.mockReturnValue(multiConfigProps);
      fixture.detectChanges();
      expect(component.selectionMode).toBe('multi');
    });

    it('should set listOfCheckboxes from datasource', () => {
      mockPConn.resolveConfigProps.mockReturnValue(multiConfigProps);
      fixture.detectChanges();
      expect(component.listOfCheckboxes.length).toBe(2);
    });
  });
});
