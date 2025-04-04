import { Directive, inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';
import { FieldBase } from '../field.base';
import { DatapageService } from '../../../../_services/datapage.service';
import { handleEvent } from '../../../../_helpers/event-util';
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

  // Override ngOnInit method
  override ngOnInit(): void {
    super.ngOnInit();

    this.filteredOptions = this.fieldControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter((value as string) || ''))
    );
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
      this.options$ = this.utils.getOptionList(this.configProps$, this.pConn$.getDataObject('')); // 1st arg empty string until typedef marked correctly
    }

    if (!this.displayMode$ && this.listType !== 'associated') {
      const results = await this.dataPageService.getDataPageData(datasource, this.parameters, context);
      this.options$ = getOptions(results, this.columns);
    }
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

  /**
   * Handles the change event of a field.
   *
   * @param event The event triggered by the field change.
   */
  override fieldOnChange(event?: Event) {
    const target = event?.target as HTMLInputElement;
    const value = target?.value;

    this.filterValue = value;
    handleEvent(this.actionsApi, 'change', this.propName, value);
  }

  /**
   * Handles the change event of an option.
   *
   * @param event The event triggered by the option change.
   */
  optionChanged(event: any) {
    const value = event?.option?.value;
    handleEvent(this.actionsApi, 'change', this.propName, value);
  }

  /**
   * Handles the blur event on the field.
   *
   * @param {Event} event - The blur event.
   */
  override fieldOnBlur(event: Event) {
    const target = event?.target as HTMLInputElement;

    // finds the option object that matches the target element's value.
    const option = this.options$?.find(o => o.value === target.value);
    const value = option?.key || target.value || '';

    // handles the change and blur event.
    handleEvent(this.actionsApi, 'changeNblur', this.propName, value);

    // if a record change callback is provided, updates the target element's value and calls the callback.
    if (this.configProps$?.onRecordChange) {
      this.configProps$.onRecordChange(event);
    }
  }
}
