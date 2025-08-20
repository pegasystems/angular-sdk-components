import { Directive } from '@angular/core';
import { FieldBase } from '../field.base';
import { FormControl } from '@angular/forms';
import { doSearch, getDisplayFieldsMetaData, getGroupDataForItemsTree, preProcessColumns } from './utils';
import { deleteInstruction, insertInstruction } from '../../../../_helpers/instructions-utils';

@Directive()
export class MultiselectBase extends FieldBase {
  override fieldControl = new FormControl('', null);

  configProps$: any;

  hideLabel: boolean;

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
   * Updates the component's properties based on the configuration.
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

    const groupsDisplayFieldMeta = listType !== 'associated' ? getDisplayFieldsMetaData(dataConfig.groupColumnsConfig) : null;

    this.itemsTreeBaseData = getGroupDataForItemsTree(groupDataSource, groupsDisplayFieldMeta, this.showSecondaryInSearchOnly) || [];

    this.itemsTree = isGroupData ? getGroupDataForItemsTree(groupDataSource, groupsDisplayFieldMeta, this.showSecondaryInSearchOnly) : [];

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
