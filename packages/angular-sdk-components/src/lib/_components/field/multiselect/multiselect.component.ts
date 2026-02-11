import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { FieldBase } from '../field.base';
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
export class MultiselectComponent extends FieldBase {
  configProps$: any;

  listType: string;
  parameters: {};

  referenceList: any;
  selectionKey: string;
  primaryField: string;
  showSecondaryInSearchOnly = false;
  selectionList;
  listActions: any;
  selectedItems: any[] = [];
  itemsTreeBaseData = [];
  displayFieldMeta: any;
  dataApiObj: any;
  itemsTree: any[] = [];
  trigger: any;

  /**
   * Updates the component when there are changes in the state.
   */
  override updateSelf() {
    // Resolve configuration properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    this.setPropertyValuesFromProps();

    const {
      groupDataSource = [],
      parameters = {},
      listType = '',
      showSecondaryInSearchOnly = false,
      isGroupData = false,
      referenceType,
      secondaryFields,
      matchPosition = 'contains',
      maxResultsDisplay,
      groupColumnsConfig = [{}]
    } = this.configProps$;
    let { datasource = [], columns = [{}] } = this.configProps$;

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
      if (secondaryFields) {
        secondaryColumns = secondaryFields.map(secondaryField => ({
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
      if (referenceType === 'Case') {
        columns = [...columns, ...secondaryColumns];
      }
    }

    this.value$ = this.value$ ? this.value$ : '';
    const contextName = this.pConn$.getContextName();

    const dataConfig = {
      dataSource: datasource,
      groupDataSource,
      isGroupData,
      showSecondaryInSearchOnly,
      parameters,
      matchPosition,
      listType,
      maxResultsDisplay: maxResultsDisplay || '100',
      columns: preProcessColumns(columns),
      groupColumnsConfig: preProcessColumns(groupColumnsConfig),
      associationFilter: undefined,
      ignoreCase: undefined
    };

    const groupsDisplayFieldMeta = this.listType !== 'associated' ? getDisplayFieldsMetaData(dataConfig.groupColumnsConfig) : null;

    this.itemsTreeBaseData = getGroupDataForItemsTree(groupDataSource, groupsDisplayFieldMeta, this.showSecondaryInSearchOnly) || [];

    this.itemsTree = isGroupData ? getGroupDataForItemsTree(groupDataSource, groupsDisplayFieldMeta, this.showSecondaryInSearchOnly) : [];

    this.displayFieldMeta = this.listType !== 'associated' ? getDisplayFieldsMetaData(dataConfig.columns) : null;

    this.listActions = this.pConn$.getListActions();
    this.pConn$.setReferenceList(this.selectionList);

    if (this.listType !== 'associated') {
      PCore.getDataApi()
        ?.init(dataConfig, contextName)
        .then(async dataObj => {
          this.dataApiObj = dataObj;
          if (!isGroupData) {
            this.getCaseListBasedOnParams(this.value$ ?? '', '', [...this.selectedItems], [...this.itemsTree]);
          }
        });
    }
  }

  setPropertyValuesFromProps() {
    this.referenceList = this.configProps$?.referenceList;
    this.selectionKey = this.configProps$?.selectionKey;
    this.primaryField = this.configProps$?.primaryField;
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

        const { initialCaseClass, isGroupData, showSecondaryInSearchOnly } = this.configProps$;

        doSearch(
          searchText,
          group,
          initialCaseClass,
          this.displayFieldMeta,
          this.dataApiObj,
          initalItemsTree,
          isGroupData,
          showSecondaryInSearchOnly,
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
}
