import { Component, OnInit, Input, ChangeDetectorRef, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { interval, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
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

@Component({
  selector: 'app-auto-complete',
  templateUrl: './auto-complete.component.html',
  styleUrls: ['./auto-complete.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    forwardRef(() => ComponentMapperComponent)
  ]
})
export class AutoCompleteComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  // Used with AngularPConnect
  angularPConnectData: AngularPConnectData = {};
  configProps$: AutoCompleteProps;

  label$ = '';
  value$ = '';
  bRequired$ = false;
  bReadonly$ = false;
  bDisabled$ = false;
  bVisible$ = true;
  displayMode$?: string = '';
  controlName$: string;
  bHasForm$ = true;
  options$: any[];
  componentReference = '';
  testId: string;
  listType: string;
  columns = [];
  helperText: string;
  placeholder: string;

  fieldControl = new FormControl('', null);
  parameters: {};
  hideLabel: boolean;
  filteredOptions: Observable<any[]>;
  filterValue = '';

  constructor(
    private angularPConnect: AngularPConnectService,
    private cdRef: ChangeDetectorRef,
    private utils: Utils,
    private dataPageService: DatapageService
  ) {}

  async ngOnInit(): Promise<void> {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    this.controlName$ = this.angularPConnect.getComponentID(this);

    // Then, continue on with other initialization

    // call updateSelf when initializing
    // this.updateSelf();
    await this.checkAndUpdate();

    if (this.formGroup$) {
      // add control to formGroup
      this.formGroup$.addControl(this.controlName$, this.fieldControl);
      this.fieldControl.setValue(this.value$);
      this.bHasForm$ = true;
    } else {
      this.bReadonly$ = true;
      this.bHasForm$ = false;
    }

    this.filteredOptions = this.fieldControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );
  }

  ngOnDestroy(): void {
    if (this.formGroup$) {
      this.formGroup$.removeControl(this.controlName$);
    }

    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  private _filter(value: string): string[] {
    const filterVal = (value || this.filterValue).toLowerCase();
    return this.options$?.filter(option => option.value?.toLowerCase().includes(filterVal));
  }

  // Callback passed when subscribing to store change
  async onStateChange() {
    await this.checkAndUpdate();
  }

  async checkAndUpdate() {
    // Should always check the bridge to see if the component should
    // update itself (re-render)
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);

    // ONLY call updateSelf when the component should update
    if (bUpdateSelf) {
      await this.updateSelf();
    }
  }

  // updateSelf
  async updateSelf(): Promise<void> {
    // starting very simple...

    // moved this from ngOnInit() and call this from there instead...
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as AutoCompleteProps;

    if (this.configProps$.value != undefined) {
      const index = this.options$?.findIndex(element => element.key === this.configProps$.value);
      this.value$ = index > -1 ? this.options$[index].value : this.configProps$.value;
    }

    this.setPropertyValuesFromProps();

    const context = this.pConn$.getContextName();
    const { columns, datasource } = this.generateColumnsAndDataSource();

    if (columns) {
      this.columns = this.preProcessColumns(columns);
    }
    // timeout and detectChanges to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      if (this.configProps$.required != null) {
        this.bRequired$ = this.utils.getBooleanValue(this.configProps$.required);
      }
      this.cdRef.detectChanges();
    });

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

    if (this.configProps$.readOnly != null) {
      this.bReadonly$ = this.utils.getBooleanValue(this.configProps$.readOnly);
    }

    this.componentReference = (this.pConn$.getStateProps() as any).value;
    if (this.listType === 'associated') {
      this.options$ = this.utils.getOptionList(this.configProps$, this.pConn$.getDataObject('')); // 1st arg empty string until typedef marked correctly
    }

    if (!this.displayMode$ && this.listType !== 'associated') {
      const results = await this.dataPageService.getDataPageData(datasource, this.parameters, context);
      this.fillOptions(results);
    }

    // trigger display of error message with field control
    if (this.angularPConnectData.validateMessage != null && this.angularPConnectData.validateMessage != '') {
      const timer = interval(100).subscribe(() => {
        this.fieldControl.setErrors({ message: true });
        this.fieldControl.markAsTouched();

        timer.unsubscribe();
      });
    }
  }

  setPropertyValuesFromProps() {
    this.testId = this.configProps$.testId;
    this.label$ = this.configProps$.label;
    this.placeholder = this.configProps$.placeholder || '';
    this.displayMode$ = this.configProps$.displayMode;
    this.listType = this.configProps$.listType;
    this.hideLabel = this.configProps$.hideLabel;
    this.helperText = this.configProps$.helperText;
    this.parameters = this.configProps$?.parameters;
  }

  generateColumnsAndDataSource() {
    let datasource = this.configProps$.datasource;
    let columns = this.configProps$.columns;
    // const { deferDatasource, datasourceMetadata } = this.configProps$;
    const { deferDatasource, datasourceMetadata }: any = this.pConn$.getConfigProps();
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
    this.options$ = optionsData;
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
    // this works - this.pConn$.setValue( this.componentReference, `property: ${this.componentReference}`);
    // this works - this.pConn$.setValue( this.componentReference, this.fieldControl.value);
    // PConnect wants to use changeHandler for onChange
    // this.angularPConnect.changeHandler( this, event);
    this.filterValue = (event.target as HTMLInputElement).value;

    this.angularPConnectData.actions?.onChange(this, event);
  }

  optionChanged(event: MatAutocompleteSelectedEvent) {
    this.angularPConnectData.actions?.onChange(this, event);
  }

  fieldOnBlur(event: Event) {
    let key = '';
    const el = event?.target as HTMLInputElement;
    if (el?.value) {
      const index = this.options$?.findIndex(element => element.value === el.value);
      key = index > -1 ? (key = this.options$[index].key) : el.value;
    }

    const value = key;
    const actionsApi = this.pConn$?.getActionsApi();
    const propName = (this.pConn$?.getStateProps() as any).value;
    handleEvent(actionsApi, 'changeNblur', propName, value);
    if (this.configProps$?.onRecordChange) {
      el.value = value;
      this.configProps$.onRecordChange(event);
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
