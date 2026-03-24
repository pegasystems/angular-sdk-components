import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { AutoCompleteComponent } from './auto-complete.component';
import { DatapageService } from '../../../_services/datapage.service';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';

describe('AutoCompleteComponent', () => {
  setupTestBed({ zoneless: false });

  let component: AutoCompleteComponent;
  let fixture: ComponentFixture<AutoCompleteComponent>;
  let mockDatapageService: {
    getDataPageData: Mock;
  };
  let mockAngularPConnectService: {
    registerAndSubscribeComponent: Mock;
    shouldComponentUpdate: Mock;
    getComponentID: Mock;
  };
  let mockUtils: {
    getBooleanValue: Mock;
    getOptionList: Mock;
  };
  let mockPConn: any;

  const mockConfigProps = {
    value: 'key1',
    label: 'Test Label',
    testId: 'test-autocomplete',
    helperText: 'Helper text',
    placeholder: 'Enter value',
    required: false,
    readOnly: false,
    disabled: false,
    visibility: true,
    listType: 'associated',
    datasource: [
      { key: 'key1', value: 'Value 1' },
      { key: 'key2', value: 'Value 2' },
      { key: 'key3', value: 'Value 3' }
    ],
    columns: []
  };

  beforeEach(async () => {
    mockDatapageService = {
      getDataPageData: vi.fn().mockResolvedValue([
        { pyGUID: 'guid1', Name: 'Item 1' },
        { pyGUID: 'guid2', Name: 'Item 2' }
      ])
    };

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
        { key: 'key1', value: 'Value 1' },
        { key: 'key2', value: 'Value 2' },
        { key: 'key3', value: 'Value 3' }
      ])
    };

    mockPConn = {
      getConfigProps: vi.fn().mockReturnValue(mockConfigProps),
      resolveConfigProps: vi.fn().mockReturnValue(mockConfigProps),
      getStateProps: vi.fn().mockReturnValue({ value: '.testProp' }),
      getActionsApi: vi.fn().mockReturnValue({
        updateFieldValue: vi.fn(),
        triggerFieldChange: vi.fn()
      }),
      getContextName: vi.fn().mockReturnValue('app/primary_1'),
      getDataObject: vi.fn().mockReturnValue({})
    };

    await TestBed.configureTestingModule({
      imports: [
        AutoCompleteComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        MatOptionModule
      ],
      providers: [
        { provide: AngularPConnectService, useValue: mockAngularPConnectService },
        { provide: Utils, useValue: mockUtils }
      ]
    })
      .overrideComponent(AutoCompleteComponent, {
        set: {
          providers: [{ provide: DatapageService, useValue: mockDatapageService }]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(AutoCompleteComponent);
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

    it('should set up filteredOptions observable', () => {
      fixture.detectChanges();
      expect(component.filteredOptions).toBeDefined();
    });
  });

  describe('setOptions', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should set options array', () => {
      const options = [
        { key: 'k1', value: 'V1' },
        { key: 'k2', value: 'V2' }
      ];
      component.setOptions(options);
      expect(component.options$).toEqual(options);
    });

    it('should set value from options when key matches', () => {
      component.configProps$ = { ...mockConfigProps, value: 'k1' } as any;
      const options = [
        { key: 'k1', value: 'V1' },
        { key: 'k2', value: 'V2' }
      ];
      component.setOptions(options);
      expect(component.value$).toBe('V1');
    });

    it('should set value directly when key not found in options', () => {
      component.configProps$ = { ...mockConfigProps, value: 'unknown' } as any;
      const options = [{ key: 'k1', value: 'V1' }];
      component.setOptions(options);
      expect(component.value$).toBe('unknown');
    });

    it('should update field control value', () => {
      const options = [{ key: 'k1', value: 'V1' }];
      component.configProps$ = { ...mockConfigProps, value: 'k1' } as any;
      component.setOptions(options);
      expect(component.fieldControl.value).toBe('V1');
    });
  });

  describe('_filter', () => {
    it('should filter options by value (case insensitive)', () => {
      fixture.detectChanges();
      // Set options after detectChanges to avoid updateSelf overwriting them
      component.options$ = [
        { key: 'k1', value: 'Apple' },
        { key: 'k2', value: 'Banana' },
        { key: 'k3', value: 'Pineapple' } // Contains 'app'
      ];
      // Test the _filter method directly
      const filtered = (component as any)._filter('app');
      expect(filtered.length).toBe(2);
      expect(filtered.map((o: any) => o.value)).toContain('Apple');
      expect(filtered.map((o: any) => o.value)).toContain('Pineapple');
    });

    it('should return all options when filter is empty', () => {
      fixture.detectChanges();
      component.options$ = [
        { key: 'k1', value: 'Apple' },
        { key: 'k2', value: 'Banana' },
        { key: 'k3', value: 'Apricot' }
      ];
      const filtered = (component as any)._filter('');
      expect(filtered.length).toBe(3);
    });

    it('should use filterValue when value is empty', () => {
      fixture.detectChanges();
      component.options$ = [
        { key: 'k1', value: 'Apple' },
        { key: 'k2', value: 'Banana' },
        { key: 'k3', value: 'Apricot' }
      ];
      component.filterValue = 'ban';
      const filtered = (component as any)._filter('');
      expect(filtered.length).toBe(1);
      expect(filtered[0].value).toBe('Banana');
    });
  });

  describe('updateSelf', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should resolve config props', async () => {
      await component.updateSelf();
      expect(mockPConn.resolveConfigProps).toHaveBeenCalled();
    });

    it('should set listType from config props', async () => {
      await component.updateSelf();
      expect(component.listType).toBe('associated');
    });

    it('should call getOptionList for associated listType', async () => {
      await component.updateSelf();
      expect(mockUtils.getOptionList).toHaveBeenCalled();
    });

    it('should call dataPageService for datapage listType', async () => {
      const datapageConfigProps = {
        ...mockConfigProps,
        listType: 'datapage',
        datasource: 'D_TestDataPage',
        columns: [
          { key: 'true', value: 'pyGUID' },
          { display: 'true', primary: 'true', value: 'Name' }
        ] as any[]
      };
      mockPConn.resolveConfigProps.mockReturnValue(datapageConfigProps);

      await component.updateSelf();

      expect(mockDatapageService.getDataPageData).toHaveBeenCalledWith('D_TestDataPage', undefined, 'app/primary_1');
    });
  });

  describe('generateColumnsAndDataSource', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.configProps$ = { ...mockConfigProps } as any;
    });

    it('should return columns and datasource from config props', () => {
      const result = component.generateColumnsAndDataSource();
      expect(result.columns).toEqual(mockConfigProps.columns);
      expect(result.datasource).toEqual(mockConfigProps.datasource);
    });

    it('should process deferDatasource metadata when present', () => {
      mockPConn.getConfigProps.mockReturnValue({
        ...mockConfigProps,
        deferDatasource: true,
        datasourceMetadata: {
          datasource: {
            name: 'D_DeferredDP',
            propertyForDisplayText: '@P .DisplayName',
            propertyForValue: '@P .ID',
            parameters: {
              param1: { name: 'paramName', value: 'paramValue' }
            }
          }
        }
      });

      const result = component.generateColumnsAndDataSource();

      expect(component.listType).toBe('datapage');
      expect(result.datasource).toBe('D_DeferredDP');
      // Verify column structure - @P is stripped leaving the space before the property name
      expect(result.columns.length).toBe(2);
      expect(result.columns[0].key).toBe('true');
      expect(result.columns[0].value).toBe('.ID'); // @P (3 chars) stripped from '@P .ID'
      expect(result.columns[1].display).toBe('true');
      expect(result.columns[1].primary).toBe('true');
      expect(result.columns[1].value).toBe('.DisplayName'); // @P (3 chars) stripped from '@P .DisplayName'
    });
  });

  describe('fillOptions', () => {
    beforeEach(() => {
      fixture.detectChanges();
      (component as any).columns = [
        { key: 'true', value: 'pyGUID' },
        { display: 'true', primary: 'true', value: 'Name' }
      ];
    });

    it('should transform results to options format', () => {
      const setOptionsSpy = vi.spyOn(component, 'setOptions');
      const results = [
        { pyGUID: 'guid1', Name: 'Item 1' },
        { pyGUID: 'guid2', Name: 'Item 2' }
      ];

      component.fillOptions(results);

      expect(setOptionsSpy).toHaveBeenCalledWith([
        { key: 'guid1', value: 'Item 1' },
        { key: 'guid2', value: 'Item 2' }
      ]);
    });

    it('should handle empty results', () => {
      const setOptionsSpy = vi.spyOn(component, 'setOptions');
      component.fillOptions([]);
      expect(setOptionsSpy).toHaveBeenCalledWith([]);
    });

    it('should handle null/undefined results', () => {
      const setOptionsSpy = vi.spyOn(component, 'setOptions');
      component.fillOptions(undefined);
      expect(setOptionsSpy).toHaveBeenCalledWith([]);
    });
  });

  describe('flattenParameters', () => {
    it('should flatten parameters object', () => {
      const params = {
        param1: { name: 'firstName', value: 'John' },
        param2: { name: 'lastName', value: 'Doe' }
      };

      const result = component.flattenParameters(params);

      expect(result).toEqual({
        firstName: 'John',
        lastName: 'Doe'
      });
    });

    it('should return empty object for empty params', () => {
      const result = component.flattenParameters({});
      expect(result).toEqual({});
    });

    it('should return empty object for undefined params', () => {
      const result = component.flattenParameters(undefined);
      expect(result).toEqual({});
    });
  });

  describe('getDisplayFieldsMetaData', () => {
    it('should extract key and primary fields from columns', () => {
      const columns = [
        { key: 'true', value: 'pyGUID' },
        { display: 'true', primary: 'true', value: 'Name' },
        { display: 'true', value: 'Description' }
      ];

      const result = component.getDisplayFieldsMetaData(columns);

      expect(result.key).toBe('pyGUID');
      expect(result.primary).toBe('Name');
      expect(result.secondary).toContain('Description');
    });

    it('should default key to "auto" when no key column', () => {
      const columns = [{ display: 'true', primary: 'true', value: 'Name' }];

      const result = component.getDisplayFieldsMetaData(columns);

      expect(result.key).toBe('auto');
    });
  });

  describe('preProcessColumns', () => {
    it('should remove leading dot from column values', () => {
      const columns = [{ value: '.Name' }, { value: '.Description' }, { value: 'NoLeadingDot' }];

      const result = component.preProcessColumns(columns);

      expect(result[0].value).toBe('Name');
      expect(result[1].value).toBe('Description');
      expect(result[2].value).toBe('NoLeadingDot');
    });

    it('should handle null/undefined column list', () => {
      expect(component.preProcessColumns(undefined)).toBeUndefined();
      expect(component.preProcessColumns(null)).toBeUndefined();
    });
  });

  describe('fieldOnChange', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.actionsApi = mockPConn.getActionsApi();
      component.propName = '.testProp';
    });

    it('should update filterValue', () => {
      const event = { target: { value: 'test input' } } as unknown as Event;
      component.fieldOnChange(event);
      expect(component.filterValue).toBe('test input');
    });

    it('should call handleEvent with change action', () => {
      const event = { target: { value: 'test input' } } as unknown as Event;
      component.fieldOnChange(event);
      expect(component.actionsApi['updateFieldValue']).toHaveBeenCalledWith('.testProp', 'test input');
    });
  });

  describe('optionChanged', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.actionsApi = mockPConn.getActionsApi();
      component.propName = '.testProp';
      component.options$ = [
        { key: 'k1', value: 'Value 1' },
        { key: 'k2', value: 'Value 2' }
      ];
    });

    it('should find key from options and call handleEvent', () => {
      const event = { option: { value: 'Value 1' } };
      component.optionChanged(event);

      expect(component.actionsApi['updateFieldValue']).toHaveBeenCalledWith('.testProp', 'k1');
      expect(component.actionsApi['triggerFieldChange']).toHaveBeenCalledWith('.testProp', 'k1');
    });

    it('should use value as key when not found in options', () => {
      const event = { option: { value: 'Unknown Value' } };
      component.optionChanged(event);

      expect(component.actionsApi['updateFieldValue']).toHaveBeenCalledWith('.testProp', 'Unknown Value');
    });

    it('should emit onRecordChange event', () => {
      const emitSpy = vi.spyOn(component.onRecordChange, 'emit');
      const event = { option: { value: 'Value 1' } };
      component.optionChanged(event);

      expect(emitSpy).toHaveBeenCalledWith('k1');
    });

    it('should handle null option value', () => {
      const event = { option: { value: null } };
      component.optionChanged(event);

      expect(component.actionsApi['updateFieldValue']).toHaveBeenCalledWith('.testProp', '');
    });
  });

  describe('ngOnDestroy', () => {
    it('should remove control from form group', () => {
      fixture.detectChanges();
      expect(component.formGroup$.contains('test-comp-id')).toBe(true);

      component.ngOnDestroy();

      expect(component.formGroup$.contains('test-comp-id')).toBe(false);
    });

    it('should call unsubscribe function', () => {
      fixture.detectChanges();
      const unsubscribeFn = component['angularPConnectData'].unsubscribeFn as Mock;

      component.ngOnDestroy();

      expect(unsubscribeFn).toHaveBeenCalled();
    });
  });

  describe('component properties', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await component.updateSelf();
    });

    it('should set label from config', () => {
      expect(component.label$).toBe('Test Label');
    });

    it('should set testId from config', () => {
      expect(component.testId).toBe('test-autocomplete');
    });

    it('should set placeholder from config', () => {
      expect(component.placeholder).toBe('Enter value');
    });

    it('should set helperText from config', () => {
      expect(component.helperText).toBe('Helper text');
    });
  });
});
