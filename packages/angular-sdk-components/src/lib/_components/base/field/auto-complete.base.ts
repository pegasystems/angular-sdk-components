import { Directive, inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';
import { FieldBase } from './field.base';
import { DatapageService } from '../../../_services/datapage.service';
import { handleEvent } from '../../../_helpers/event-util';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

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

function preProcessColumns(columnList) {
  return columnList?.map(col => {
    const tempColObj = { ...col };
    tempColObj.value = col.value && col.value.startsWith('.') ? col.value.substring(1) : col.value;
    return tempColObj;
  });
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

function getOptions(results, columns) {
  const displayColumn = getDisplayFieldsMetaData(columns);

  return (
    results?.map(element => {
      return {
        key: element[displayColumn.key] || element.pyGUID,
        value: element[displayColumn.primary]?.toString()
      };
    }) || []
  );
}

function flattenParameters(params = {}) {
  const flatParams = {};
  Object.keys(params).forEach(key => {
    const { name, value: theVal } = params[key];
    flatParams[name] = theVal;
  });

  return flatParams;
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

  override ngOnInit(): void {
    super.ngOnInit();

    this.filteredOptions = this.fieldControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter((value as string) || ''))
    );
  }

  // updateSelf
  override async updateSelf(): Promise<void> {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as AutoCompleteProps;

    if (this.configProps$.value != undefined) {
      const index = this.options$?.findIndex(element => element.key === this.configProps$.value);
      this.value$ = index > -1 ? this.options$[index].value : this.configProps$.value;
    }

    this.setPropertyValuesFromProps();

    this.actionsApi = this.pConn$.getActionsApi();
    this.propName = this.pConn$.getStateProps().value;

    const context = this.pConn$.getContextName();
    const { columns, datasource } = this.generateColumnsAndDataSource();

    if (columns) {
      this.columns = preProcessColumns(columns);
    }

    this.bRequired$ = this.utils.getBooleanValue(this.configProps$.required);
    this.bVisible$ = this.utils.getBooleanValue(this.configProps$.visibility);
    this.bDisabled$ = this.utils.getBooleanValue(this.configProps$.disabled);
    this.bReadonly$ = this.utils.getBooleanValue(this.configProps$.readOnly);

    if (this.bDisabled$) {
      this.fieldControl.disable();
    } else {
      this.fieldControl.enable();
    }

    if (this.listType === 'associated') {
      this.options$ = this.utils.getOptionList(this.configProps$, this.pConn$.getDataObject('')); // 1st arg empty string until typedef marked correctly
    }

    if (!this.displayMode$ && this.listType !== 'associated') {
      const results = await this.dataPageService.getDataPageData(datasource, this.parameters, context);
      this.options$ = getOptions(results, this.columns);
    }

    // trigger display of error message with field control
    if (this.angularPConnectData.validateMessage != null && this.angularPConnectData.validateMessage != '') {
      this.fieldControl.setErrors({ message: true });
      this.fieldControl.markAsTouched();
    }
  }

  private setPropertyValuesFromProps() {
    this.testId = this.configProps$.testId;
    this.label$ = this.configProps$.label;
    this.placeholder = this.configProps$.placeholder || '';
    this.displayMode$ = this.configProps$.displayMode;
    this.listType = this.configProps$.listType;
    this.hideLabel = this.configProps$.hideLabel;
    this.helperText = this.configProps$.helperText;
    this.parameters = this.configProps$?.parameters;
  }

  private _filter(value: string): string[] {
    const filterVal = (value || this.filterValue).toLowerCase();
    return this.options$?.filter(option => option.value?.toLowerCase().includes(filterVal));
  }

  generateColumnsAndDataSource() {
    let datasource = this.configProps$.datasource;
    let columns = this.configProps$.columns;
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

  fieldOnChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.filterValue = value;
    handleEvent(this.actionsApi, 'change', this.propName, value);
  }

  optionChanged(event: any) {
    const value = event?.option?.value;
    handleEvent(this.actionsApi, 'change', this.propName, value);
  }

  fieldOnBlur(event: Event) {
    let key = '';
    const el = event?.target as HTMLInputElement;
    if (el?.value) {
      const index = this.options$?.findIndex(element => element.value === el.value);
      key = index > -1 ? (key = this.options$[index].key) : el.value;
    }
    const value = key;

    handleEvent(this.actionsApi, 'changeNblur', this.propName, value);

    if (this.configProps$?.onRecordChange) {
      el.value = value;
      this.configProps$.onRecordChange(event);
    }
  }
}
