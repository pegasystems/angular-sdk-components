import { Component, OnInit, forwardRef, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import isEqual from 'fast-deep-equal';

import { FieldBase } from '../field.base';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { handleEvent } from '../../../_helpers/event-util';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

function flattenParameters(params = {}) {
  const flatParams = {};
  Object.keys(params).forEach(key => {
    const { name, value: theVal } = params[key];
    flatParams[name] = theVal;
  });

  return flatParams;
}

function preProcessColumns(columnList) {
  return columnList.map(col => {
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

interface IOption {
  key: string;
  value: string;
}

// Can't use DropdownProps with 8.23 until getLocaleRuleNameFromKeys is NOT private
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

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatOptionModule, forwardRef(() => ComponentMapperComponent)]
})
export class DropdownComponent extends FieldBase implements OnInit, OnDestroy {
  @Output() onRecordChange: EventEmitter<any> = new EventEmitter();

  configProps$: DropdownProps;

  options$: IOption[];
  theDatasource: any[] | null;
  localeContext = '';
  localeClass = '';
  localeName = '';
  localePath = '';
  localizedValue = '';

  set options(options: IOption[]) {
    this.options$ = options;
    if (this.displayMode$) {
      this.value$ = this.options$?.find(option => option.key === this.value$)?.value || this.value$;
      this.localizedValue = this.pConn$.getLocalizedValue(
        this.value$ === 'Select...' ? '' : this.value$,
        this.localePath,
        this.pConn$.getLocaleRuleNameFromKeys(this.localeClass, this.localeContext, this.localeName)
      );
    }
  }

  /**
   * Updates the component when there are changes in the state.
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
   * Updates dropdown properties based on the provided configuration.
   * @param configProps - Configuration properties
   */
  updateDropdownProperties(configProps) {
    const { value, fieldMetadata, datasource } = configProps;

    this.value$ = value;

    if (!isEqual(datasource, this.theDatasource)) {
      this.theDatasource = datasource || null;
    }

    if (this.value$ === '' && !this.bReadonly$) {
      this.value$ = 'Select';
    }

    if (this.theDatasource) {
      this.setOptionsList();
    }

    this.actionsApi = this.pConn$.getActionsApi();
    this.propName = this.pConn$.getStateProps().value;
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

    this.localizedValue = this.options$?.find(opt => opt.key === this.value$)?.value || this.localizedValue;

    this.getDatapageData();
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
    if (listType !== 'associated' && typeof datasource === 'string') {
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
          this.options = optionsData;
        });
      });
  }

  isSelected(buttonValue: string): boolean {
    return this.value$ === buttonValue;
  }

  fieldOnChange(event: any) {
    if (event?.value === 'Select') {
      event.value = '';
    }
    handleEvent(this.actionsApi, 'changeNblur', this.propName, event.value);

    this.pConn$.clearErrorMessages({
      property: this.propName
    });
    if (this.onRecordChange) {
      this.onRecordChange.emit(event.value);
    }
  }

  getLocalizedOptionValue(opt: IOption) {
    return this.pConn$.getLocalizedValue(
      opt.value,
      this.localePath,
      this.pConn$.getLocaleRuleNameFromKeys(this.localeClass, this.localeContext, this.localeName)
    );
  }
}
