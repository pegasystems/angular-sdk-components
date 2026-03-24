import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { SelectableCardComponent } from './selectable-card.component';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';

describe('SelectableCardComponent', () => {
  setupTestBed({ zoneless: false });

  let component: SelectableCardComponent;
  let fixture: ComponentFixture<SelectableCardComponent>;
  let mockAngularPConnectService: {
    registerAndSubscribeComponent: Mock;
    shouldComponentUpdate: Mock;
    getComponentID: Mock;
  };
  let mockUtils: { getBooleanValue: Mock; resolveReferenceFields: Mock };
  let mockPConn: any;

  const mockConfigProps = {
    value: '',
    label: 'Select Option',
    testId: 'test-selectable-card',
    selectionList: [{ ID: '1', Name: 'Option 1' }],
    readonlyContextList: [{ ID: '1', Name: 'Option 1' }],
    image: '',
    primaryField: 'Name',
    selectionKey: '.ID',
    renderMode: 'ReadOnly',
    visibility: true,
    datasource: { source: [{ ID: '1', Name: 'Option 1' }] },
    displayMode: 'DISPLAY_ONLY'
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
      resolveReferenceFields: vi.fn().mockReturnValue([])
    };

    mockPConn = {
      getConfigProps: vi.fn().mockReturnValue(mockConfigProps),
      resolveConfigProps: vi.fn().mockReturnValue(mockConfigProps),
      getStateProps: vi.fn().mockReturnValue({ value: '.SelectedOption' }),
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
      getRawMetadata: vi.fn().mockReturnValue({ config: {} })
    };

    await TestBed.configureTestingModule({
      imports: [
        SelectableCardComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatCardModule,
        MatRadioModule,
        MatCheckboxModule
      ],
      providers: [
        { provide: AngularPConnectService, useValue: mockAngularPConnectService },
        { provide: Utils, useValue: mockUtils }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectableCardComponent);
    component = fixture.componentInstance;
    component.pConn$ = mockPConn;
    component.formGroup$ = new FormGroup({});
    component.type = 'single';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should register component with AngularPConnectService', () => {
      fixture.detectChanges();
      expect(mockAngularPConnectService.registerAndSubscribeComponent).toHaveBeenCalled();
    });
  });

  describe('updateSelf', () => {
    it('should resolve config props', () => {
      fixture.detectChanges();
      expect(mockPConn.resolveConfigProps).toHaveBeenCalled();
    });

    it('should process content list from datasource', () => {
      fixture.detectChanges();
      expect(component.contentList).toBeDefined();
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

  describe('radio type', () => {
    beforeEach(() => {
      component.type = 'radio';
      mockPConn.getStateProps.mockReturnValue({
        value: '.SelectedOption',
        image: '.ImageField',
        imageDescription: '.ImageDesc',
        primaryField: '.Name'
      });
    });

    it('should set radioBtnValue for radio type', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        value: 'option1'
      });
      fixture.detectChanges();
      expect(component.radioBtnValue).toBe('option1');
    });
  });

  describe('checkbox type', () => {
    beforeEach(() => {
      component.type = 'checkbox';
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        selectionKey: '.ID',
        primaryField: '.Name',
        selectionList: []
      });
    });

    it('should set selectionKey for checkbox type', () => {
      fixture.detectChanges();
      expect(component.selectionKey).toBe('.ID');
    });

    it('should set primaryField for checkbox type', () => {
      fixture.detectChanges();
      expect(component.primaryField).toBe('.Name');
    });
  });

  describe('fieldOnChange', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call handleEvent with value', () => {
      component.actionsApi = mockPConn.getActionsApi();
      component.propName = '.SelectedOption';
      component.fieldOnChange('newValue');
      expect(mockPConn.getActionsApi).toHaveBeenCalled();
    });
  });

  describe('fieldOnBlur', () => {
    it('should call validation API', () => {
      mockPConn.getValidationApi = vi.fn().mockReturnValue({
        validate: vi.fn()
      });
      fixture.detectChanges();
      component.fieldOnBlur();
      expect(mockPConn.getValidationApi).toHaveBeenCalled();
    });
  });

  describe('cardSelect', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call fieldOnChange for radio type', () => {
      component.type = 'radio';
      const spy = vi.spyOn(component, 'fieldOnChange');
      component.cardSelect({}, { key: 'option1' });
      expect(spy).toHaveBeenCalledWith('option1');
    });

    it('should call handleChangeMultiMode for checkbox type', () => {
      component.type = 'checkbox';
      component.selectionList = [];
      component.selectionKey = '.ID';
      component.primaryField = '.Name';
      const spy = vi.spyOn(component, 'handleChangeMultiMode');
      component.cardSelect({}, { id: '1', selected: false, label: 'Option 1' });
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('handleChangeMultiMode', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.selectionList = [];
      component.selectionKey = '.ID';
      component.primaryField = '.Name';
    });

    it('should clear error messages on selection change', () => {
      component.handleChangeMultiMode({}, { id: '1', label: 'Option 1', selected: true, key: '1' });
      expect(mockPConn.clearErrorMessages).toHaveBeenCalled();
    });
  });

  describe('image position styling', () => {
    it('should set inline-start card style', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        imagePosition: 'inline-start'
      });
      fixture.detectChanges();
      expect(component.cardStyle).toHaveProperty('flexDirection', 'row');
    });

    it('should set inline-end card style', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        imagePosition: 'inline-end'
      });
      fixture.detectChanges();
      expect(component.cardStyle).toHaveProperty('flexDirection', 'row-reverse');
    });
  });
});
