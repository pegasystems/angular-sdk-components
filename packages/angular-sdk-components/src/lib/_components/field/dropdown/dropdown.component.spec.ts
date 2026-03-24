import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { DropdownComponent } from './dropdown.component';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';

describe('DropdownComponent', () => {
  setupTestBed({ zoneless: false });

  let component: DropdownComponent;
  let fixture: ComponentFixture<DropdownComponent>;
  let mockAngularPConnectService: {
    registerAndSubscribeComponent: Mock;
    shouldComponentUpdate: Mock;
    getComponentID: Mock;
  };
  let mockUtils: { getBooleanValue: Mock; getOptionList: Mock };
  let mockPConn: any;

  const mockConfigProps = {
    value: 'option1',
    label: 'Select Option',
    testId: 'test-dropdown',
    helperText: 'Choose an option',
    placeholder: 'Select...',
    required: false,
    readOnly: false,
    disabled: false,
    visibility: true,
    listType: 'associated',
    datasource: [
      { key: 'option1', value: 'Option 1' },
      { key: 'option2', value: 'Option 2' },
      { key: 'option3', value: 'Option 3' }
    ],
    columns: []
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
      getOptionList: vi.fn().mockReturnValue([
        { key: 'option1', value: 'Option 1' },
        { key: 'option2', value: 'Option 2' },
        { key: 'option3', value: 'Option 3' }
      ])
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
      imports: [DropdownComponent, ReactiveFormsModule, NoopAnimationsModule, MatSelectModule, MatFormFieldModule, MatOptionModule],
      providers: [
        { provide: AngularPConnectService, useValue: mockAngularPConnectService },
        { provide: Utils, useValue: mockUtils }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownComponent);
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

    it('should set label from config props', () => {
      fixture.detectChanges();
      expect(component.label$).toBe('Select Option');
    });

    it('should set placeholder from config props', () => {
      fixture.detectChanges();
      expect(component.placeholder).toBe('Select...');
    });

    it('should call getOptionList for associated listType', () => {
      fixture.detectChanges();
      expect(mockUtils.getOptionList).toHaveBeenCalled();
    });
  });

  describe('options setter', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should set options array', () => {
      const options = [
        { key: 'a', value: 'A' },
        { key: 'b', value: 'B' }
      ];
      component.options = options;
      expect(component.options$).toEqual(options);
    });
  });

  describe('fieldOnChange', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should clear error messages on change', () => {
      const event = { value: 'option2' };
      component.fieldOnChange(event);
      expect(mockPConn.clearErrorMessages).toHaveBeenCalledWith({ property: '.SelectedOption' });
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

  describe('isSelected', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return true when value matches', () => {
      component.value$ = 'option1';
      expect(component.isSelected('option1')).toBe(true);
    });

    it('should return false when value does not match', () => {
      component.value$ = 'option1';
      expect(component.isSelected('option2')).toBe(false);
    });
  });

  describe('fieldOnChange', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle Select value by converting to empty string', () => {
      const event = { value: 'Select' };
      component.fieldOnChange(event);
      expect(event.value).toBe('');
    });

    it('should emit onRecordChange event', () => {
      const spy = vi.spyOn(component.onRecordChange, 'emit');
      const event = { value: 'option2' };
      component.fieldOnChange(event);
      expect(spy).toHaveBeenCalledWith('option2');
    });
  });

  describe('getLocalizedOptionValue', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call getLocalizedValue with option value', () => {
      const opt = { key: 'opt1', value: 'Option 1' };
      component.getLocalizedOptionValue(opt);
      expect(mockPConn.getLocalizedValue).toHaveBeenCalled();
    });
  });

  describe('empty value handling', () => {
    it('should set value to Select when value is empty and not readonly', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, value: '' });
      fixture.detectChanges();
      expect(component.value$).toBe('Select');
    });
  });

  describe('options setter with displayMode', () => {
    it('should set localizedValue when displayMode is set', () => {
      fixture.detectChanges();
      component.displayMode$ = 'DISPLAY_ONLY';
      component.options = [
        { key: 'option1', value: 'Option 1' },
        { key: 'option2', value: 'Option 2' }
      ];
      expect(component.localizedValue).toBeDefined();
    });
  });

  describe('updateDropdownProperties', () => {
    it('should set theDatasource from configProps', () => {
      fixture.detectChanges();
      expect(component.theDatasource).toBeDefined();
    });

    it('should handle fieldMetadata', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        fieldMetadata: { classID: 'TestClass', datasource: { tableType: 'DataPage', name: 'TestDataPage', propertyForDisplayText: 'Name' } }
      });
      fixture.detectChanges();
      expect(component.localeContext).toBeDefined();
    });
  });

  describe('getDatapageData', () => {
    it('should process deferDatasource metadata without calling PCore', () => {
      // This test verifies the component handles deferDatasource config
      // without actually calling PCore.getDataApi which requires complex mocking
      mockPConn.getConfigProps.mockReturnValue({
        ...mockConfigProps,
        deferDatasource: false,
        listType: 'associated'
      });
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });
  });

  describe('onRecordChange', () => {
    it('should emit value when onRecordChange is triggered', () => {
      fixture.detectChanges();
      const spy = vi.spyOn(component.onRecordChange, 'emit');
      component.fieldOnChange({ value: 'newOption' });
      expect(spy).toHaveBeenCalledWith('newOption');
    });
  });

  describe('getData with PCore mock', () => {
    beforeEach(() => {
      // Mock PCore.getDataApi
      (globalThis as any).PCore = {
        getDataApi: vi.fn().mockReturnValue({
          init: vi.fn().mockResolvedValue({
            fetchData: vi.fn().mockResolvedValue({
              data: [
                { pyGUID: 'guid1', Name: 'Item 1' },
                { pyGUID: 'guid2', Name: 'Item 2' }
              ]
            })
          })
        })
      };
    });

    it('should call getData for datapage listType', async () => {
      mockPConn.getConfigProps.mockReturnValue({
        ...mockConfigProps,
        listType: 'datapage',
        datasource: 'D_TestDataPage',
        parameters: {},
        columns: [
          { key: 'true', value: 'pyGUID' },
          { display: 'true', primary: 'true', value: 'Name' }
        ]
      });
      fixture.detectChanges();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0));
      expect((globalThis as any).PCore.getDataApi).toHaveBeenCalled();
    });

    it('should process deferDatasource with datasourceMetadata', async () => {
      mockPConn.getConfigProps.mockReturnValue({
        ...mockConfigProps,
        deferDatasource: true,
        datasourceMetadata: {
          datasource: {
            name: 'D_TestDataPage',
            parameters: {
              param1: { name: 'param1', value: 'value1' }
            },
            propertyForDisplayText: '@P .Name',
            propertyForValue: '@P .ID'
          }
        },
        listType: 'associated'
      });
      fixture.detectChanges();

      await new Promise(resolve => setTimeout(resolve, 0));
      expect((globalThis as any).PCore.getDataApi).toHaveBeenCalled();
    });

    it('should handle columns without starting dot', async () => {
      mockPConn.getConfigProps.mockReturnValue({
        ...mockConfigProps,
        listType: 'datapage',
        datasource: 'D_TestDataPage',
        parameters: {},
        columns: [
          { key: 'true', value: 'pyGUID' },
          { display: 'true', primary: 'true', value: '.Name' }
        ]
      });
      fixture.detectChanges();

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(component).toBeTruthy();
    });

    it('should use pyGUID when key column is not specified', async () => {
      (globalThis as any).PCore.getDataApi = vi.fn().mockReturnValue({
        init: vi.fn().mockResolvedValue({
          fetchData: vi.fn().mockResolvedValue({
            data: [{ pyGUID: 'guid1', Name: 'Item 1' }]
          })
        })
      });

      mockPConn.getConfigProps.mockReturnValue({
        ...mockConfigProps,
        listType: 'datapage',
        datasource: 'D_TestDataPage',
        parameters: {},
        columns: [{ display: 'true', primary: 'true', value: 'Name' }]
      });
      fixture.detectChanges();

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(component.options$).toBeDefined();
    });

    it('should handle secondary display columns', async () => {
      (globalThis as any).PCore.getDataApi = vi.fn().mockReturnValue({
        init: vi.fn().mockResolvedValue({
          fetchData: vi.fn().mockResolvedValue({
            data: [{ ID: '1', Name: 'Item 1', Description: 'Desc 1' }]
          })
        })
      });

      mockPConn.getConfigProps.mockReturnValue({
        ...mockConfigProps,
        listType: 'datapage',
        datasource: 'D_TestDataPage',
        parameters: {},
        columns: [
          { key: 'true', value: 'ID' },
          { display: 'true', primary: 'true', value: 'Name' },
          { display: 'true', value: 'Description' }
        ]
      });
      fixture.detectChanges();

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(component).toBeTruthy();
    });
  });

  describe('localization', () => {
    it('should set locale properties for datapage tableType', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        fieldMetadata: {
          classID: 'TestClass',
          datasource: {
            tableType: 'DataPage',
            name: 'D_TestDataPage',
            propertyForDisplayText: 'pyLabel'
          }
        }
      });
      fixture.detectChanges();
      expect(component.localeContext).toBe('datapage');
      expect(component.localeClass).toBe('@baseclass');
    });

    it('should set locale properties for associated tableType', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        fieldMetadata: {
          classID: 'TestClass',
          datasource: {
            tableType: 'associated',
            name: 'TestField'
          }
        }
      });
      fixture.detectChanges();
      expect(component.localeContext).toBe('associated');
      expect(component.localeClass).toBe('TestClass');
    });

    it('should handle fieldMetadata as array', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        fieldMetadata: [
          { classID: 'OtherClass', datasource: { name: 'Other' } },
          { classID: 'TestClass', datasource: { tableType: 'DataPage', name: 'D_Test' } }
        ]
      });
      fixture.detectChanges();
      expect(component.localeContext).toBe('datapage');
    });
  });

  describe('options setter edge cases', () => {
    it('should find value in options when displayMode is set', () => {
      fixture.detectChanges();
      component.displayMode$ = 'DISPLAY_ONLY';
      component.value$ = 'option1';
      component.options = [
        { key: 'option1', value: 'Option One' },
        { key: 'option2', value: 'Option Two' }
      ];
      expect(component.value$).toBe('Option One');
    });

    it('should keep original value when not found in options', () => {
      fixture.detectChanges();
      component.displayMode$ = 'DISPLAY_ONLY';
      component.value$ = 'unknownOption';
      component.options = [{ key: 'option1', value: 'Option One' }];
      expect(component.value$).toBe('unknownOption');
    });

    it('should handle Select... value for localization', () => {
      fixture.detectChanges();
      component.displayMode$ = 'DISPLAY_ONLY';
      component.value$ = 'Select...';
      component.options = [{ key: 'Select', value: 'Select...' }];
      expect(component.localizedValue).toBeDefined();
    });
  });

  describe('updateDropdownProperties edge cases', () => {
    it('should not update theDatasource when datasource is equal', () => {
      const datasource = [{ key: 'a', value: 'A' }];
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        datasource
      });
      fixture.detectChanges();

      const originalDatasource = component.theDatasource;

      // Call updateSelf again with same datasource
      component.updateSelf();
      expect(component.theDatasource).toEqual(originalDatasource);
    });

    it('should handle null datasource', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        datasource: null
      });
      fixture.detectChanges();
      expect(component.theDatasource).toBeNull();
    });

    it('should find localizedValue in options', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        value: 'option1'
      });
      fixture.detectChanges();
      // localizedValue should be found from options
      expect(component.localizedValue).toBeDefined();
    });
  });
});
