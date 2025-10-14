import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';
import { doSearch, getDisplayFieldsMetaData, getGroupDataForItemsTree, preProcessColumns } from './utils';
import { deleteInstruction, insertInstruction } from '../../../_helpers/instructions-utils';
import { handleEvent } from '../../../_helpers/event-util';

@Component({
  selector: 'app-multiselect',
  templateUrl: './multiselect.component.html',
  styleUrls: ['./multiselect.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatCheckboxModule,
    MatIconModule,
    MatChipsModule
  ]
})
export class MultiselectComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  // Used with AngularPConnect
  angularPConnectData: AngularPConnectData = {};

  label$ = '';
  value$ = '';
  bRequired$ = false;
  bDisabled$ = false;
  bVisible$ = true;
  controlName$: string;
  bHasForm$ = true;
  listType: string;
  placeholder: string;
  fieldControl = new FormControl('', null);
  parameters: {};
  hideLabel: boolean;
  configProps$: any;

  referenceList: any;
  selectionKey: string;
  primaryField: string;
  initialCaseClass: any;
  showSecondaryInSearchOnly = false;
  isGroupData = false;
  referenceType;
  secondaryFields;
  groupDataSource = [];
  matchPosition = 'contains';
  maxResultsDisplay;
  groupColumnsConfig = [{}];
  selectionList;
  listActions: any;
  selectedItems: any[] = [];
  itemsTreeBaseData = [];
  displayFieldMeta: any;
  dataApiObj: any;
  itemsTree: any[] = [];
  trigger: any;
  actionsApi: object;
  propName: string;

  constructor(
    private angularPConnect: AngularPConnectService,
    private utils: Utils
  ) {}

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    this.controlName$ = this.angularPConnect.getComponentID(this);

    // Then, continue on with other initialization
    this.checkAndUpdate();

    if (this.formGroup$) {
      // add control to formGroup
      this.formGroup$.addControl(this.controlName$, this.fieldControl);
      this.fieldControl.setValue(this.value$);
      this.bHasForm$ = true;
    } else {
      this.bHasForm$ = false;
    }
  }

  ngOnDestroy(): void {
    if (this.formGroup$) {
      this.formGroup$.removeControl(this.controlName$);
    }

    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  // Callback passed when subscribing to store change
  onStateChange() {
    this.checkAndUpdate();
  }

  checkAndUpdate() {
    // Should always check the bridge to see if the component should
    // update itself (re-render)
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);

    // ONLY call updateSelf when the component should update
    if (bUpdateSelf) {
      this.updateSelf();
    }
  }

  // updateSelf
  updateSelf() {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());

    let { datasource = [], columns = [{}] } = this.configProps$;
    this.setPropertyValuesFromProps();

    if (this.referenceList.length > 0) {
      datasource = this.referenceList;
      columns = [
        {
          value: this.primaryField,
          display: 'true',
          useForSearch: true,
          primary: 'true'
        },
        {
          value: this.selectionKey,
          setProperty: this.selectionKey,
          key: 'true'
        }
      ];
      let secondaryColumns: any = [];
      if (this.secondaryFields) {
        secondaryColumns = this.secondaryFields.map(secondaryField => ({
          value: secondaryField,
          display: 'true',
          secondary: 'true',
          useForSearch: 'true'
        }));
      } else {
        secondaryColumns = [
          {
            value: this.selectionKey,
            display: 'true',
            secondary: 'true',
            useForSearch: 'true'
          }
        ];
      }
      if (this.referenceType === 'Case') {
        columns = [...columns, ...secondaryColumns];
      }
    }

    this.value$ = this.value$ ? this.value$ : '';
    const contextName = this.pConn$.getContextName();

    const dataConfig = {
      dataSource: datasource,
      groupDataSource: this.groupDataSource,
      isGroupData: this.isGroupData,
      showSecondaryInSearchOnly: this.showSecondaryInSearchOnly,
      parameters: this.parameters,
      matchPosition: this.matchPosition,
      listType: this.listType,
      maxResultsDisplay: this.maxResultsDisplay || '100',
      columns: preProcessColumns(columns),
      groupColumnsConfig: preProcessColumns(this.groupColumnsConfig),
      associationFilter: undefined,
      ignoreCase: undefined
    };

    const groupsDisplayFieldMeta = this.listType !== 'associated' ? getDisplayFieldsMetaData(dataConfig.groupColumnsConfig) : null;

    this.itemsTreeBaseData = getGroupDataForItemsTree(this.groupDataSource, groupsDisplayFieldMeta, this.showSecondaryInSearchOnly) || [];

    this.itemsTree = this.isGroupData ? getGroupDataForItemsTree(this.groupDataSource, groupsDisplayFieldMeta, this.showSecondaryInSearchOnly) : [];

    this.displayFieldMeta = this.listType !== 'associated' ? getDisplayFieldsMetaData(dataConfig.columns) : null;

    this.listActions = this.pConn$.getListActions();
    this.pConn$.setReferenceList(this.selectionList);

    if (this.configProps$.visibility != null) {
      this.bVisible$ = this.utils.getBooleanValue(this.configProps$.visibility);
    }

    // disabled
    if (this.configProps$.disabled != undefined) {
      this.bDisabled$ = this.utils.getBooleanValue(this.configProps$.disabled);
    }

    if (this.bDisabled$) {
      this.fieldControl.disable();
    } else {
      this.fieldControl.enable();
    }

    this.actionsApi = this.pConn$.getActionsApi();
    this.propName = this.pConn$.getStateProps().value;

    if (this.listType !== 'associated') {
      PCore.getDataApi()
        ?.init(dataConfig, contextName)
        .then(async dataObj => {
          this.dataApiObj = dataObj;
          if (!this.isGroupData) {
            this.getCaseListBasedOnParams(this.value$ ?? '', '', [...this.selectedItems], [...this.itemsTree]);
          }
        });
    }
  }

  setPropertyValuesFromProps() {
    this.label$ = this.configProps$.label;
    this.placeholder = this.configProps$.placeholder || '';
    this.listType = this.configProps$.listType ? this.configProps$.listType : '';
    this.hideLabel = this.configProps$.hideLabel;
    this.parameters = this.configProps$?.parameters ? this.configProps$?.parameters : {};
    this.referenceList = this.configProps$?.referenceList;
    this.selectionKey = this.configProps$?.selectionKey;
    this.primaryField = this.configProps$?.primaryField;
    this.initialCaseClass = this.configProps$?.initialCaseClass;
    this.showSecondaryInSearchOnly = this.configProps$?.showSecondaryInSearchOnly ? this.configProps$?.showSecondaryInSearchOnly : false;
    this.isGroupData = this.configProps$?.isGroupData ? this.configProps$.isGroupData : false;
    this.referenceType = this.configProps$?.referenceType;
    this.secondaryFields = this.configProps$?.secondaryFields;
    this.groupDataSource = this.configProps$?.groupDataSource ? this.configProps$?.groupDataSource : [];
    this.matchPosition = this.configProps$?.matchPosition ? this.configProps$?.matchPosition : 'contains';
    this.maxResultsDisplay = this.configProps$?.maxResultsDisplay;
    this.groupColumnsConfig = this.configProps$?.groupColumnsConfig ? this.configProps$?.groupColumnsConfig : [{}];
    this.selectionList = this.configProps$?.selectionList;
    this.value$ = this.configProps$?.value;
  }

  // main search function trigger
  getCaseListBasedOnParams(searchText, group, selectedRows, currentItemsTree, isTriggeredFromSearch = false) {
    if (this.referenceList && this.referenceList.length > 0) {
      this.listActions.getSelectedRows(true).then(result => {
        selectedRows =
          result.length > 0
            ? result.map(item => {
                return {
                  id: item[this.selectionKey.startsWith('.') ? this.selectionKey.substring(1) : this.selectionKey],
                  primary: item[this.primaryField.startsWith('.') ? this.primaryField.substring(1) : this.primaryField]
                };
              })
            : [];
        this.selectedItems = selectedRows;

        const initalItemsTree = isTriggeredFromSearch || !currentItemsTree ? [...this.itemsTreeBaseData] : [...currentItemsTree];

        doSearch(
          searchText,
          group,
          this.initialCaseClass,
          this.displayFieldMeta,
          this.dataApiObj,
          initalItemsTree,
          this.isGroupData,
          this.showSecondaryInSearchOnly,
          selectedRows || []
        ).then(res => {
          this.itemsTree = res || [];
        });
      });
    }
  }

  fieldOnChange(event: Event) {
    this.value$ = (event.target as HTMLInputElement).value;
    this.getCaseListBasedOnParams(this.value$, '', [...this.selectedItems], [...this.itemsTree], true);
  }

  optionChanged(event: any) {
    let value = event?.target?.value;
    value = value?.substring(1);
    handleEvent(this.actionsApi, 'changeNblur', this.propName, value);
  }

  optionClicked = (event: Event, data: any): void => {
    event.stopPropagation();
    this.toggleSelection(data);
  };

  toggleSelection = (data: any): void => {
    data.selected = !data.selected;
    this.itemsTree.map((ele: any) => {
      if (ele.id === data.id) {
        ele.selected = data.selected;
      }
      return ele;
    });

    if (data.selected === true) {
      this.selectedItems.push(data);
    } else {
      const index = this.selectedItems.findIndex(value => value.id === data.id);
      this.selectedItems.splice(index, 1);
    }

    this.value$ = '';
    // if this is a referenceList case
    if (this.referenceList) this.setSelectedItemsForReferenceList(data);

    this.getCaseListBasedOnParams(this.value$, '', [...this.selectedItems], [...this.itemsTree], true);
  };

  removeChip = (data: any): void => {
    if (data) {
      data = this.itemsTree.filter((ele: any) => {
        return ele.id === data.id;
      });
      this.toggleSelection(data[0]);
    }
  };

  setSelectedItemsForReferenceList(data: any) {
    // Clear error messages if any
    const propName = this.pConn$.getStateProps().selectionList;
    this.pConn$.clearErrorMessages({
      property: propName,
      category: '',
      context: ''
    });
    const { selected } = data;
    if (selected) {
      insertInstruction(this.pConn$, this.selectionList, this.selectionKey, this.primaryField, data);
    } else {
      deleteInstruction(this.pConn$, this.selectionList, this.selectionKey, data);
    }
  }

  getErrorMessage() {
    let errMessage = '';

    // look for validation messages for json, pre-defined or just an error pushed from workitem (400)
    if (this.fieldControl.hasError('message')) {
      errMessage = this.angularPConnectData.validateMessage ?? '';
      return errMessage;
    }
    if (this.fieldControl.hasError('required')) {
      errMessage = 'You must enter a value';
    } else if (this.fieldControl.errors) {
      errMessage = this.fieldControl.errors.toString();
    }

    return errMessage;
  }
}
