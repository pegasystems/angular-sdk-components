import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { RadioButtonsComponent } from './radio-buttons.component';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';

describe('RadioButtonsComponent', () => {
  setupTestBed({ zoneless: false });

  let component: RadioButtonsComponent;
  let fixture: ComponentFixture<RadioButtonsComponent>;
  let mockAngularPConnectService: {
    registerAndSubscribeComponent: Mock;
    shouldComponentUpdate: Mock;
    getComponentID: Mock;
  };
  let mockUtils: { getBooleanValue: Mock; getOptionList: Mock };
  let mockPConn: any;

  const mockOptions = [
    { key: 'option1', value: 'Option 1' },
    { key: 'option2', value: 'Option 2' },
    { key: 'option3', value: 'Option 3' }
  ];

  const mockConfigProps = {
    value: 'option1',
    label: 'Select Option',
    testId: 'test-radio',
    helperText: 'Choose one option',
    required: false,
    readOnly: false,
    disabled: false,
    visibility: true,
    datasource: mockOptions,
    inline: false
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
      getOptionList: vi.fn().mockReturnValue(mockOptions)
    };

    mockPConn = {
      getConfigProps: vi.fn().mockReturnValue(mockConfigProps),
      resolveConfigProps: vi.fn().mockReturnValue(mockConfigProps),
      getStateProps: vi.fn().mockReturnValue({ value: '.SelectedOption' }),
      getActionsApi: vi.fn().mockReturnValue({
        updateFieldValue: vi.fn(),
        triggerFieldChange: vi.fn()
      }),
      clearErrorMessages: vi.fn(),
      getContextName: vi.fn().mockReturnValue('app/primary_1'),
      getDataObject: vi.fn().mockReturnValue({}),
      getCaseInfo: vi.fn().mockReturnValue({
        getClassName: vi.fn().mockReturnValue('TestClass')
      }),
      getLocalizedValue: vi.fn().mockImplementation(val => val),
      getLocaleRuleNameFromKeys: vi.fn().mockReturnValue('')
    };

    await TestBed.configureTestingModule({
      imports: [RadioButtonsComponent, ReactiveFormsModule, NoopAnimationsModule, MatRadioModule, MatFormFieldModule],
      providers: [{ provide: AngularPConnectService, useValue: mockAngularPConnectService }]
    })
      .overrideComponent(RadioButtonsComponent, {
        set: { providers: [{ provide: Utils, useValue: mockUtils }] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(RadioButtonsComponent);
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

    it('should set selected value from config props', () => {
      fixture.detectChanges();
      expect(component.value$).toBe('option1');
    });

    it('should set label from config props', () => {
      fixture.detectChanges();
      expect(component.label$).toBe('Select Option');
    });
  });

  describe('fieldOnChange', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call handleEvent when value changes', () => {
      const event = { value: 'option2' };
      component.fieldOnChange(event);
      // handleEvent is called which uses actionsApi
      expect(mockPConn.getActionsApi).toHaveBeenCalled();
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
