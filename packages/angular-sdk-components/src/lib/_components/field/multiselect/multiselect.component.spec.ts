import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { MultiselectComponent } from './multiselect.component';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';

describe('MultiselectComponent', () => {
  setupTestBed({ zoneless: false });

  let component: MultiselectComponent;
  let fixture: ComponentFixture<MultiselectComponent>;
  let mockAngularPConnectService: {
    registerAndSubscribeComponent: Mock;
    shouldComponentUpdate: Mock;
    getComponentID: Mock;
  };
  let mockUtils: { getBooleanValue: Mock };
  let mockPConn: any;

  const mockConfigProps = {
    value: [],
    label: 'Select Items',
    testId: 'test-multiselect',
    helperText: 'Select multiple items',
    required: false,
    readOnly: false,
    disabled: false,
    visibility: true,
    datasource: [],
    columns: [{}],
    listType: 'associated',
    referenceList: '',
    selectionKey: '.ID',
    primaryField: 'Name'
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
      getStateProps: vi.fn().mockReturnValue({ value: '.SelectedItems' }),
      getActionsApi: vi.fn().mockReturnValue({
        updateFieldValue: vi.fn(),
        triggerFieldChange: vi.fn()
      }),
      getListActions: vi.fn().mockReturnValue({
        insert: vi.fn(),
        deleteEntry: vi.fn()
      }),
      getValue: vi.fn().mockReturnValue([]),
      getPageReference: vi.fn().mockReturnValue(''),
      clearErrorMessages: vi.fn(),
      getContextName: vi.fn().mockReturnValue('app/primary_1'),
      setReferenceList: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        MultiselectComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatChipsModule
      ],
      providers: [
        { provide: AngularPConnectService, useValue: mockAngularPConnectService },
        { provide: Utils, useValue: mockUtils }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MultiselectComponent);
    component = fixture.componentInstance;
    component.pConn$ = mockPConn;
    component.formGroup$ = new FormGroup({});
    // Set listType to 'associated' to skip PCore.getDataApi() call
    component.listType = 'associated';
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
      expect(component.label$).toBe('Select Items');
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

  describe('setPropertyValuesFromProps', () => {
    it('should set property values from config props', () => {
      component.configProps$ = mockConfigProps;
      component.setPropertyValuesFromProps();
      expect(component.selectionKey).toBe('.ID');
      expect(component.primaryField).toBe('Name');
    });
  });

  describe('fieldOnChange', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.selectedItems = [];
      component.itemsTree = [];
    });

    it('should update value on change', () => {
      const event = { target: { value: 'search text' } } as unknown as Event;
      component.fieldOnChange(event);
      expect(component.value$).toBe('search text');
    });
  });

  describe('optionChanged', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.actionsApi = mockPConn.getActionsApi();
      component.propName = '.SelectedItems';
    });

    it('should handle option change', () => {
      const event = { target: { value: '$option1' } };
      component.optionChanged(event);
      expect(mockPConn.getActionsApi).toHaveBeenCalled();
    });
  });

  describe('toggleSelection', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.selectedItems = [];
      component.itemsTree = [{ id: '1', primary: 'Item 1', selected: false }];
    });

    it('should add item to selectedItems when selecting', () => {
      const data = { id: '1', primary: 'Item 1', selected: false };
      component.toggleSelection(data);
      expect(data.selected).toBe(true);
      expect(component.selectedItems.length).toBe(1);
    });

    it('should remove item from selectedItems when deselecting', () => {
      const data = { id: '1', primary: 'Item 1', selected: true };
      component.selectedItems = [data];
      component.toggleSelection(data);
      expect(data.selected).toBe(false);
      expect(component.selectedItems.length).toBe(0);
    });
  });

  describe('removeChip', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.itemsTree = [{ id: '1', primary: 'Item 1', selected: true }];
      component.selectedItems = [{ id: '1', primary: 'Item 1', selected: true }];
    });

    it('should remove chip by toggling selection', () => {
      const spy = vi.spyOn(component, 'toggleSelection');
      component.removeChip({ id: '1' });
      expect(spy).toHaveBeenCalled();
    });

    it('should handle null data', () => {
      component.removeChip(null);
      // Should not throw
      expect(component).toBeTruthy();
    });
  });

  describe('optionClicked', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should stop propagation and toggle selection', () => {
      const event = { stopPropagation: vi.fn() } as unknown as Event;
      const data = { id: '1', selected: false };
      component.itemsTree = [data];
      component.selectedItems = [];
      component.optionClicked(event, data);
      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('setSelectedItemsForReferenceList', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.selectionList = '.SelectedList';
      component.selectionKey = '.ID';
      component.primaryField = '.Name';
      mockPConn.getStateProps.mockReturnValue({ selectionList: '.SelectedList' });
    });

    it('should clear error messages', () => {
      const data = { id: '1', primary: 'Item 1', selected: true };
      component.setSelectedItemsForReferenceList(data);
      expect(mockPConn.clearErrorMessages).toHaveBeenCalled();
    });
  });

  describe('updateSelf with referenceList', () => {
    it('should configure columns when referenceList is provided', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        referenceList: [{ ID: '1', Name: 'Item 1' }],
        referenceType: 'Case',
        selectionKey: '.ID',
        primaryField: 'Name'
      });
      fixture.detectChanges();
      expect(component.referenceList).toBeDefined();
    });

    it('should handle secondary fields for Case referenceType', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        referenceList: [{ ID: '1', Name: 'Item 1' }],
        referenceType: 'Case',
        secondaryFields: ['Description', 'Status'],
        selectionKey: '.ID',
        primaryField: 'Name'
      });
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should use selectionKey as secondary when no secondaryFields', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        referenceList: [{ ID: '1', Name: 'Item 1' }],
        referenceType: 'Case',
        selectionKey: '.ID',
        primaryField: 'Name'
      });
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });
  });

  describe('updateSelf with datapage listType', () => {
    beforeEach(() => {
      // Mock PCore.getDataApi
      (globalThis as any).PCore = {
        getDataApi: vi.fn().mockReturnValue({
          init: vi.fn().mockResolvedValue({
            fetchData: vi.fn().mockResolvedValue({ data: [] })
          })
        })
      };
    });

    it('should process groupData items when isGroupData is false', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        listType: 'associated',
        isGroupData: false,
        groupDataSource: []
      });
      fixture.detectChanges();
      expect(component.itemsTree).toBeDefined();
    });
  });

  describe('getCaseListBasedOnParams with referenceList', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.referenceList = [{ ID: '1', Name: 'Item 1' }];
      component.selectionKey = '.ID';
      component.primaryField = '.Name';
      component.configProps$ = {
        ...mockConfigProps,
        initialCaseClass: 'TestClass',
        isGroupData: false,
        showSecondaryInSearchOnly: false
      };
      mockPConn.getListActions.mockReturnValue({
        getSelectedRows: vi.fn().mockResolvedValue([{ ID: '1', Name: 'Item 1' }])
      });
    });

    it('should get selected rows and search', async () => {
      component.listActions = mockPConn.getListActions();
      component.displayFieldMeta = { key: 'ID', primary: 'Name', secondary: [] };
      component.dataApiObj = {
        fetchData: vi.fn().mockResolvedValue({ data: [{ ID: '1', Name: 'Item 1' }] })
      };
      component.itemsTreeBaseData = [];

      component.getCaseListBasedOnParams('', '', [], [], false);

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(component.listActions.getSelectedRows).toHaveBeenCalled();
    });

    it('should process selected rows properly', async () => {
      component.listActions = mockPConn.getListActions();
      component.displayFieldMeta = { key: 'ID', primary: 'Name', secondary: [] };
      component.dataApiObj = {
        fetchData: vi.fn().mockResolvedValue({ data: [] })
      };

      component.getCaseListBasedOnParams('search', '', [], [], true);

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(component.selectedItems).toBeDefined();
    });
  });

  describe('toggleSelection with referenceList', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.referenceList = [{ ID: '1', Name: 'Item 1' }];
      component.selectionList = '.SelectedList';
      component.selectionKey = '.ID';
      component.primaryField = '.Name';
      component.selectedItems = [];
      component.itemsTree = [{ id: '1', primary: 'Item 1', selected: false }];
      component.listActions = {
        getSelectedRows: vi.fn().mockResolvedValue([])
      };
      mockPConn.getStateProps.mockReturnValue({ selectionList: '.SelectedList' });
    });

    it('should call setSelectedItemsForReferenceList when toggling', () => {
      const spy = vi.spyOn(component, 'setSelectedItemsForReferenceList');
      const data = { id: '1', primary: 'Item 1', selected: false };
      component.toggleSelection(data);
      expect(spy).toHaveBeenCalledWith(data);
    });
  });

  describe('edge cases', () => {
    it('should handle empty value by setting to empty string', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        value: null
      });
      fixture.detectChanges();
      expect(component.value$).toBe('');
    });

    it('should handle columns with dot prefix', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        columns: [{ value: '.Name', display: 'true', primary: 'true' }]
      });
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should update itemsTree on toggleSelection', () => {
      fixture.detectChanges();
      const data = { id: '1', primary: 'Item 1', selected: false };
      component.itemsTree = [data];
      component.selectedItems = [];
      component.toggleSelection(data);
      expect(component.itemsTree[0].selected).toBe(true);
    });
  });
});
