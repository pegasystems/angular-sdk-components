import { Directive, inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';

import { FieldBase } from '../field.base';
import { DatapageService } from '../../../../_services/datapage.service';
import { PConnFieldProps } from '../../../../_types/PConnProps.interface';

interface AutoCompleteProps extends PConnFieldProps {
  // If any, enter additional props that only exist on AutoComplete here
  deferDatasource?: boolean;
  datasourceMetadata?: any;
  onRecordChange?: any;
  additionalProps?: object;
  listType: string;
  parameters?: any;
  datasource: any;
  columns: any[];
}

interface IOption {
  key: string;
  value: string;
}

function preProcessColumns(columnList) {
  return columnList?.map(col => {
    const tempColObj = { ...col };
    tempColObj.value = col.value && col.value.startsWith('.') ? col.value.substring(1) : col.value;
    return tempColObj;
  });
}

function flattenParameters(params = {}) {
  const flatParams = {};
  Object.keys(params).forEach(key => {
    const { name, value: theVal } = params[key];
    flatParams[name] = theVal;
  });

  return flatParams;
}

function getDisplayFieldsMetaData(columnList) {
  const displayColumns = columnList.filter(col => col.display === 'true');
  const metaDataObj: any = { key: '', primary: '', secondary: [] };
  const keyCol = columnList.filter(col => col.key === 'true');
  metaDataObj.key = keyCol.length > 0 ? keyCol[0].value : 'auto';
  for (let index = 0; index < displayColumns.length; index += 1) {
    if (displayColumns[index].primary === 'true') {
      metaDataObj.primary = displayColumns[index].value;
    } else {
      metaDataObj.secondary.push(displayColumns[index].value);
    }
  }
  return metaDataObj;
}

@Directive()
export class AutoCompleteBase extends FieldBase implements OnInit {
  protected dataPageService = inject(DatapageService);

  configProps$: AutoCompleteProps;

  override fieldControl = new FormControl('', null);

  options$: any[];
  listType: string;
  columns = [];
  parameters: {};
  hideLabel: boolean;
  filteredOptions: Observable<any[]>;
  filterValue = '';

  // Override ngOnInit method
  override ngOnInit(): void {
    super.ngOnInit();

    this.filteredOptions = this.fieldControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter((value as string) || ''))
    );
  }

  private _filter(value: string): string[] {
    const filterVal = (value || this.filterValue).toLowerCase();
    return this.options$?.filter(option => option.value?.toLowerCase().includes(filterVal));
  }

  /**
   * Updates the component's properties based on the configuration.
   */
  override async updateSelf(): Promise<void> {
    // Resolve configuration properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as AutoCompleteProps;

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    // Set component specific properties
    const { value, listType, parameters, hideLabel } = this.configProps$;

    if (value != undefined) {
      const index = this.options$?.findIndex(element => element.key === value);
      this.value$ = index > -1 ? this.options$[index].value : value;
      this.fieldControl.setValue(this.value$);
    }

    this.listType = listType;
    this.hideLabel = hideLabel;
    this.parameters = parameters;

    const context = this.pConn$.getContextName();
    const { columns, datasource } = this.generateColumnsAndDataSource();

    if (columns) {
      this.columns = preProcessColumns(columns);
    }

    if (this.listType === 'associated') {
      const optionsList = this.utils.getOptionList(this.configProps$, this.pConn$.getDataObject('')); // 1st arg empty string until typedef marked correctly
      this.setOptions(optionsList);
    }

    if (!this.displayMode$ && this.listType !== 'associated') {
      const results = await this.dataPageService.getDataPageData(datasource, this.parameters, context);
      this.fillOptions(results);
    }
  }

  generateColumnsAndDataSource() {
    let datasource = this.configProps$.datasource;
    let columns = this.configProps$.columns;
    // const { deferDatasource, datasourceMetadata } = this.configProps$;
    const { deferDatasource, datasourceMetadata } = this.pConn$.getConfigProps();
    // convert associated to datapage listtype and transform props
    // Process deferDatasource when datapage name is present. WHhen tableType is promptList / localList
    if (deferDatasource && datasourceMetadata?.datasource?.name) {
      this.listType = 'datapage';
      datasource = datasourceMetadata.datasource.name;
      const { parameters, propertyForDisplayText, propertyForValue } = datasourceMetadata.datasource;
      this.parameters = flattenParameters(parameters);
      const displayProp = propertyForDisplayText?.startsWith('@P') ? propertyForDisplayText.substring(3) : propertyForDisplayText;
      const valueProp = propertyForValue?.startsWith('@P') ? propertyForValue.substring(3) : propertyForValue;
      columns = [
        {
          key: 'true',
          setProperty: 'Associated property',
          value: valueProp
        },
        {
          display: 'true',
          primary: 'true',
          useForSearch: true,
          value: displayProp
        }
      ];
    }

    return { columns, datasource };
  }

  fillOptions(results: any) {
    const optionsData: any[] = [];
    const displayColumn = getDisplayFieldsMetaData(this.columns);
    results?.forEach(element => {
      const obj = {
        key: element[displayColumn.key] || element.pyGUID,
        value: element[displayColumn.primary]?.toString()
      };
      optionsData.push(obj);
    });
    this.setOptions(optionsData);
  }

  setOptions(options: IOption[]) {
    this.options$ = options;
    const index = this.options$?.findIndex(element => element.key === this.configProps$.value);
    this.value$ = index > -1 ? this.options$[index].value : this.configProps$.value;
    this.fieldControl.setValue(this.value$);
  }
}
