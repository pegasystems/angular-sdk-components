import { Directive } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldBase } from '../field.base';
import { doSearch, getDisplayFieldsMetaData, getGroupDataForItemsTree, preProcessColumns } from './utils';
import { deleteInstruction, insertInstruction } from '../../../../_helpers/instructions-utils';

@Directive()
export class MultiselectBase extends FieldBase {
  configProps$: any;

  override fieldControl = new FormControl('', null);

  referenceList: any;
  selectionKey: string;
  primaryField: string;
  selectionList;
  listActions: any;
  selectedItems: any[] = [];
  itemsTreeBaseData = [];
  displayFieldMeta: any;
  dataApiObj: any;
  itemsTree: any[] = [];

  override updateSelf() {
    // Resolve config properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    this.setPropertyValuesFromProps(this.configProps$);

    const {
      listType = '',
      parameters = {},
      isGroupData = false,
      showSecondaryInSearchOnly = false,
      groupColumnsConfig = [{}],
      groupDataSource = [],
      matchPosition = 'contains',
      secondaryFields,
      referenceType,
      maxResultsDisplay
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

    const groupsDisplayFieldMeta = listType !== 'associated' ? getDisplayFieldsMetaData(dataConfig.groupColumnsConfig) : null;

    this.itemsTreeBaseData = getGroupDataForItemsTree(groupDataSource, groupsDisplayFieldMeta, showSecondaryInSearchOnly) || [];

    this.itemsTree = isGroupData ? getGroupDataForItemsTree(groupDataSource, groupsDisplayFieldMeta, showSecondaryInSearchOnly) : [];

    this.displayFieldMeta = listType !== 'associated' ? getDisplayFieldsMetaData(dataConfig.columns) : null;

    this.listActions = this.pConn$.getListActions();
    this.pConn$.setReferenceList(this.selectionList);

    if (listType !== 'associated') {
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

  override fieldOnChange(event?: Event) {
    this.value$ = (event?.target as HTMLInputElement).value;
    this.getCaseListBasedOnParams(this.value$, '', [...this.selectedItems], [...this.itemsTree], true);
  }

  setPropertyValuesFromProps(configProps) {
    const { referenceList, selectionKey, primaryField, selectionList, value } = configProps;

    this.referenceList = referenceList;
    this.selectionKey = selectionKey;
    this.primaryField = primaryField;
    this.selectionList = selectionList;
    this.value$ = value;
  }

  // Extract the logic of getting selected rows into a separate function
  protected async getSelectedRows(): Promise<any[]> {
    const result = await this.listActions.getSelectedRows(true);
    return result.length > 0
      ? result.map(item => ({
          id: item[this.selectionKey.startsWith('.') ? this.selectionKey.substring(1) : this.selectionKey],
          primary: item[this.primaryField.startsWith('.') ? this.primaryField.substring(1) : this.primaryField]
        }))
      : [];
  }

  protected async performSearch(searchText: string, group: any, selectedRows: any[], currentItemsTree, isTriggeredFromSearch): Promise<any[]> {
    const initalItemsTree = isTriggeredFromSearch || !currentItemsTree ? [...this.itemsTreeBaseData] : [...currentItemsTree];

    const { initialCaseClass, isGroupData, showSecondaryInSearchOnly } = this.configProps$;

    return doSearch(
      searchText,
      group,
      initialCaseClass,
      this.displayFieldMeta,
      this.dataApiObj,
      initalItemsTree,
      isGroupData,
      showSecondaryInSearchOnly,
      selectedRows || []
    );
  }

  // main search function trigger
  public async getCaseListBasedOnParams(searchText, group, selectedRows, currentItemsTree, isTriggeredFromSearch = false) {
    if (this.referenceList && this.referenceList.length > 0) {
      this.selectedItems = await this.getSelectedRows();

      const result = await this.performSearch(searchText, group, selectedRows, currentItemsTree, isTriggeredFromSearch);
      this.itemsTree = result || [];
    }
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
