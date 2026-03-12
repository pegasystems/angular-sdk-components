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
import { AutoCompleteLogic, IOption } from './auto-complete-logic';

interface AutoCompleteProps extends PConnFieldProps {
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
  options$: IOption[] = [];
  listType: string;
  columns: any[] = [];
  parameters: Record<string, any> = {};
  filteredOptions: Observable<IOption[]>;
  filterValue = '';

  // Logic class instance
  private logic = new AutoCompleteLogic();

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    this.filteredOptions = this.fieldControl.valueChanges.pipe(
      startWith(''),
      map(value => this.logic.filterOptions(this.options$, (value as string) || this.filterValue))
    );
  }

  setOptions(options: IOption[]) {
    this.options$ = options;
    this.value$ = this.logic.getDisplayValue(options, this.configProps$.value as any);
    this.fieldControl.setValue(this.value$);
  }

  override async updateSelf(): Promise<void> {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as AutoCompleteProps;
    this.updateComponentCommonProperties(this.configProps$);

    const { value, listType, parameters } = this.configProps$;

    if (value !== undefined) {
      this.value$ = this.logic.getDisplayValue(this.options$, value);
      this.fieldControl.setValue(this.value$);
    }

    this.listType = listType;
    this.parameters = parameters;

    const context = this.pConn$.getContextName();
    const { deferDatasource, datasourceMetadata } = this.pConn$.getConfigProps();

    const result = this.logic.generateColumnsAndDataSource(
      this.configProps$.datasource,
      this.configProps$.columns,
      deferDatasource as boolean,
      datasourceMetadata
    );

    // Update listType and parameters if returned from deferred datasource processing
    if (result.listType) {
      this.listType = result.listType;
    }
    if (result.parameters) {
      this.parameters = result.parameters;
    }

    if (result.columns) {
      this.columns = this.logic.preProcessColumns(result.columns);
    }

    if (this.listType === 'associated') {
      const optionsList = this.utils.getOptionList(this.configProps$, this.pConn$.getDataObject(''));
      this.setOptions(optionsList);
    }

    if (!this.displayMode$ && this.listType !== 'associated') {
      const results = await this.dataPageService.getDataPageData(result.datasource, this.parameters, context);
      const options = this.logic.buildOptionsFromResults(results as any, this.columns);
      this.setOptions(options);
    }
  }

  fieldOnChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.filterValue = value;
    handleEvent(this.actionsApi, 'change', this.propName, value);
  }

  optionChanged(event: any) {
    const val = event?.option?.value;
    const key = this.logic.findOptionKey(this.options$, val);

    handleEvent(this.actionsApi, 'changeNblur', this.propName, key);

    if (this.onRecordChange) {
      this.onRecordChange.emit(key);
    }
  }
}
