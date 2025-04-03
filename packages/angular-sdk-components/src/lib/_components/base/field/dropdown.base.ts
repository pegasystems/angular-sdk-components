import { Directive, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import isEqual from 'fast-deep-equal';

import { FieldBase } from './field.base';
import { handleEvent } from '../../../_helpers/event-util';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

/**
 * Flattens an object of parameters into a single-level object.
 *
 * @param {Object} params - The object of parameters to flatten.
 * @returns {Object} A new object with the flattened parameters.
 */
function flattenParameters(params = {}) {
  const flatParams = {};
  Object.keys(params).forEach(key => {
    const { name, value: theVal } = params[key];
    flatParams[name] = theVal;
  });

  return flatParams;
}

/**
 * Pre-processes a list of columns by removing the leading dot from the value if present.
 *
 * @param {Array<Object>} columnList - The list of columns to pre-process.
 * @returns {Array<Object>} The pre-processed list of columns.
 */
function preProcessColumns(columnList) {
  return columnList.map(col => ({ ...col, value: col.value?.startsWith('.') ? col.value.substring(1) : col.value }));
}

/**
 * Extracts display fields metadata from a list of columns.
 *
 * @param {Array} columnList - A list of column objects with display, key, primary, and value properties.
 * @returns {Object} An object containing key, primary, and secondary display fields metadata.
 */
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

interface IOption {
  key: string;
  value: string;
}

interface DropdownProps extends PConnFieldProps {
  // If any, enter additional props that only exist on Dropdown here
  datasource?: any[];
  onRecordChange?: any;
  fieldMetadata?: any;
  listType?: string;
  columns?: any[];
  deferDatasource?: boolean;
  datasourceMetadata?: any;
  parameters?: any;
}

@Directive()
export class DropdownBase extends FieldBase implements OnInit {
  configProps$: DropdownProps;

  override fieldControl = new FormControl('', null);

  options$: IOption[];
  theDatasource: any[] | null;
  localeContext = '';
  localeClass = '';
  localeName = '';
  localePath = '';
  localizedValue = '';

  // Override ngOnInit method
  override ngOnInit(): void {
    super.ngOnInit();

    // this should get called afer checkAndUpdate
    this.getDatapageData();
  }

  /**
   * Updates the component's properties based on the configuration.
   */
  override updateSelf(): void {
    // Resolve configuration properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as DropdownProps;

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    // Set component specific properties
    this.updateDropdownProperties(this.configProps$);
  }

  /**
   * Handles the change event on the dropdown field.
   *
   * @param event The event object triggered by the change action.
   */
  override fieldOnChange(event?: any) {
    // Reset the value to empty string if it's 'Select'
    if (event?.value === 'Select') {
      event.value = '';
    }

    // Trigger the change and blur event
    handleEvent(this.actionsApi, 'changeNblur', this.propName, event.value);

    // Call the onRecordChange callback if it exists
    if (this.configProps$?.onRecordChange) {
      this.configProps$.onRecordChange(event);
    }

    // Clear any error messages for the current property
    this.pConn$.clearErrorMessages({
      property: this.propName
    });
  }

  updateDropdownProperties(configProps) {
    const { value, fieldMetadata, datasource } = configProps;

    this.value$ = value;

    if (!isEqual(datasource, this.theDatasource)) {
      // inbound datasource is different, so update theDatasource
      this.theDatasource = datasource || null;
    }

    if (this.value$ === '' && !this.bReadonly$) {
      this.value$ = 'Select';
    }

    if (this.theDatasource) {
      const optionsList = [...this.utils.getOptionList(configProps, this.pConn$.getDataObject())];
      optionsList?.unshift({ key: 'Select', value: this.pConn$.getLocalizedValue('Select...', '', '') });
      this.options$ = optionsList;
    }

    const className = this.pConn$.getCaseInfo().getClassName();
    const refName = this.propName?.slice(this.propName.lastIndexOf('.') + 1);

    const metaData = Array.isArray(fieldMetadata) ? fieldMetadata.filter(field => field?.classID === className)[0] : fieldMetadata;

    let displayName = metaData?.datasource?.propertyForDisplayText;
    displayName = displayName?.slice(displayName.lastIndexOf('.') + 1);
    this.localeContext = metaData?.datasource?.tableType === 'DataPage' ? 'datapage' : 'associated';
    this.localeClass = this.localeContext === 'datapage' ? '@baseclass' : className;
    this.localeName = this.localeContext === 'datapage' ? metaData?.datasource?.name : refName;
    this.localePath = this.localeContext === 'datapage' ? displayName : this.localeName;

    this.localizedValue = this.pConn$.getLocalizedValue(
      this.value$,
      this.localePath,
      this.pConn$.getLocaleRuleNameFromKeys(this.localeClass, this.localeContext, this.localeName)
    );
  }

  getDatapageData() {
    const configProps = this.pConn$.getConfigProps() as DropdownProps;
    let { listType, parameters, datasource = [], columns = [] } = configProps;
    const { deferDatasource, datasourceMetadata } = configProps;
    const context = this.pConn$.getContextName();
    if (deferDatasource && datasourceMetadata?.datasource?.name) {
      listType = 'datapage';
      datasource = datasourceMetadata.datasource.name;
      const { parameters: dataSourceParameters, propertyForDisplayText, propertyForValue } = datasourceMetadata.datasource;
      parameters = flattenParameters(dataSourceParameters);
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

    columns = preProcessColumns(columns) || [];
    if (!this.displayMode$ && listType !== 'associated' && typeof datasource === 'string') {
      this.getData(datasource, parameters, columns, context, listType);
    }
  }

  getData(dataSource, parameters, columns, context, listType) {
    const dataConfig: any = {
      columns,
      dataSource,
      deferDatasource: true,
      listType,
      parameters,
      matchPosition: 'contains',
      maxResultsDisplay: '5000',
      cacheLifeSpan: 'form'
    };
    PCore.getDataApi()
      .init(dataConfig, context)
      .then((dataApiObj: any) => {
        const optionsData: any[] = [];
        const displayColumn = getDisplayFieldsMetaData(columns);
        dataApiObj?.fetchData('').then(response => {
          response.data?.forEach(element => {
            const val = element[displayColumn.primary]?.toString();
            const obj = {
              key: element[displayColumn.key] || element.pyGUID,
              value: val
            };
            optionsData.push(obj);
          });
          optionsData?.unshift({ key: 'Select', value: this.pConn$.getLocalizedValue('Select...', '', '') });
          this.options$ = optionsData;
        });
      });
  }

  getLocalizedOptionValue(opt: IOption) {
    return this.pConn$.getLocalizedValue(
      opt.value,
      this.localePath,
      this.pConn$.getLocaleRuleNameFromKeys(this.localeClass, this.localeContext, this.localeName)
    );
  }
}
