import { Component, EventEmitter, OnInit, Output, forwardRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { FieldBase } from '../field.base';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { DatapageService } from '../../../_services/datapage.service';
import { handleEvent } from '../../../_helpers/event-util';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface IOption {
  key: string;
  value: string;
}
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

@Component({
  selector: 'app-auto-complete',
  templateUrl: './auto-complete.component.html',
  styleUrls: ['./auto-complete.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    forwardRef(() => ComponentMapperComponent)
  ],
  providers: [DatapageService]
})
export class AutoCompleteComponent extends FieldBase implements OnInit {
  protected dataPageService = inject(DatapageService);

  @Output() onRecordChange: EventEmitter<any> = new EventEmitter();

  configProps$: AutoCompleteProps;

  options$: any[];
  listType: string;
  columns = [];
  parameters: {};
  filteredOptions: Observable<any[]>;
  filterValue = '';

  // Override ngOnInit method
  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    this.filteredOptions = this.fieldControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter((value as string) || ''))
    );
  }

  setOptions(options: IOption[]) {
    this.options$ = options;
    const index = this.options$?.findIndex(element => element.key === this.configProps$.value);
    this.value$ = index > -1 ? this.options$[index].value : this.configProps$.value;
    this.fieldControl.setValue(this.value$);
  }

  private _filter(value: string): string[] {
    const filterVal = (value || this.filterValue).toLowerCase();
    return this.options$?.filter(option => option.value?.toLowerCase().includes(filterVal));
  }

  /**
   * Updates the component when there are changes in the state.
   */
  override async updateSelf(): Promise<void> {
    // Resolve configuration properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as AutoCompleteProps;

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    // Set component specific properties
    const { value, listType, parameters } = this.configProps$;

    if (value != undefined) {
      const index = this.options$?.findIndex(element => element.key === value);
      this.value$ = index > -1 ? this.options$[index].value : value;
      this.fieldControl.setValue(this.value$);
    }

    this.listType = listType;
    this.parameters = parameters;

    const context = this.pConn$.getContextName();
    const { columns, datasource } = this.generateColumnsAndDataSource();

    if (columns) {
      this.columns = this.preProcessColumns(columns);
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
      this.parameters = this.flattenParameters(parameters);
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
    const displayColumn = this.getDisplayFieldsMetaData(this.columns);
    results?.forEach(element => {
      const obj = {
        key: element[displayColumn.key] || element.pyGUID,
        value: element[displayColumn.primary]?.toString()
      };
      optionsData.push(obj);
    });
    this.setOptions(optionsData);
  }

  flattenParameters(params = {}) {
    const flatParams = {};
    Object.keys(params).forEach(key => {
      const { name, value: theVal } = params[key];
      flatParams[name] = theVal;
    });

    return flatParams;
  }

  getDisplayFieldsMetaData(columnList) {
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

  preProcessColumns(columnList) {
    return columnList?.map(col => {
      const tempColObj = { ...col };
      tempColObj.value = col.value && col.value.startsWith('.') ? col.value.substring(1) : col.value;
      return tempColObj;
    });
  }

  fieldOnChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.filterValue = value;
    handleEvent(this.actionsApi, 'change', this.propName, value);
  }

  optionChanged(event: any) {
    const val = event?.option?.value;

    let key = '';
    if (val) {
      const index = this.options$?.findIndex(element => element.value === val);
      key = index > -1 ? (key = this.options$[index].key) : val;
    }
    const value = key;
    handleEvent(this.actionsApi, 'changeNblur', this.propName, value);

    if (this.onRecordChange) {
      this.onRecordChange.emit(value);
    }
  }
}
