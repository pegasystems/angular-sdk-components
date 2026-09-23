import { Component, EventEmitter, OnInit, Output, ViewChild, forwardRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { FieldBase } from '../field.base';
import { FieldWarningDirective } from '../../../_directives/field-warning.directive';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { DatapageService } from '../../../_services/datapage.service';
import { handleEvent } from '../../../_helpers/event-util';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface AutoCompleteOption {
  key: string;
  value: string;
  // Present only when at least one secondary column resolves to a non-empty value
  secondaryComponents?: any[];
  secondarySearchText?: string;
  // Present only when a group-by field is configured for this (datapage-sourced) field
  group?: string;
}

// Internal, render-time-only view-model — never part of the PConnect contract
interface AutoCompleteGroup {
  label: string;
  options: AutoCompleteOption[];
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
  allowCreatingRecords?: boolean;
  onCreateNew?: () => void;
  createNewLabel?: string;
  createNewRecord?: () => Promise<unknown>;
  contextClass?: string;
  referenceType?: string;
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
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    FieldWarningDirective,
    forwardRef(() => ComponentMapperComponent)
  ],
  providers: [DatapageService]
})
export class AutoCompleteComponent extends FieldBase implements OnInit {
  protected dataPageService = inject(DatapageService);

  @Output() onRecordChange: EventEmitter<any> = new EventEmitter();

  @ViewChild(MatAutocompleteTrigger) private autocompleteTrigger?: MatAutocompleteTrigger;

  configProps$: AutoCompleteProps;

  options$: AutoCompleteOption[];
  listType: string;
  columns: any[] = [];
  parameters: {};
  datasource: any;
  filteredOptions: Observable<AutoCompleteOption[]>;
  // Grouped view of filteredOptions, only rendered when hasGroupBy is true
  groupedFilteredOptions$: Observable<AutoCompleteGroup[]>;
  hasGroupBy = false;
  filterValue = '';

  // "Create new" footer button state
  showCreateButton = false;
  createNewLabel = 'Create new';
  contextClass?: string;
  referenceType?: string;
  private onCreateNewFn?: () => void;
  private createNewRecordFn?: () => Promise<unknown>;

  // Override ngOnInit method
  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    this.filteredOptions = this.fieldControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter((value as string) || ''))
    );

    this.groupedFilteredOptions$ = this.filteredOptions.pipe(map(options => this.buildGroups(options)));
  }

  setOptions(options: AutoCompleteOption[]) {
    this.options$ = options;
    const index = this.options$?.findIndex(element => element.key === this.configProps$.value);
    this.value$ = index > -1 ? this.options$[index].value : this.configProps$.value;
    this.fieldControl.setValue(this.value$);
  }

  // Matches only primary text and secondary search text — group value is never used for search
  private _filter(value: string): AutoCompleteOption[] {
    const filterVal = (value || this.filterValue).toLowerCase();
    return this.options$?.filter(option => option.value?.toLowerCase().includes(filterVal) || option.secondarySearchText?.includes(filterVal));
  }

  // Buckets the already-sorted option list into contiguous groups by exact group value
  buildGroups(options: AutoCompleteOption[]): AutoCompleteGroup[] {
    const groups: AutoCompleteGroup[] = [];
    options?.forEach(option => {
      const label = option.group ?? '';
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.label === label) {
        lastGroup.options.push(option);
      } else {
        groups.push({ label, options: [option] });
      }
    });
    return groups;
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
    const { value, listType, parameters, allowCreatingRecords, onCreateNew, createNewLabel, createNewRecord, contextClass, referenceType } =
      this.configProps$;

    this.listType = listType;
    this.parameters = parameters;

    this.showCreateButton = allowCreatingRecords === true;
    this.createNewLabel = createNewLabel || 'Create new';
    this.contextClass = contextClass;
    this.referenceType = referenceType;
    this.onCreateNewFn = onCreateNew;
    this.createNewRecordFn = createNewRecord;

    const context = this.pConn$.getContextName();
    const { columns, datasource } = this.generateColumnsAndDataSource();
    this.datasource = datasource;

    if (columns) {
      this.columns = this.preProcessColumns(columns);
    }

    this.hasGroupBy = this.columns?.some(col => col.groupBy === 'true') ?? false;

    if (this.listType === 'associated') {
      const optionsList = this.utils.getOptionList(this.configProps$, this.pConn$.getDataObject('')); // 1st arg empty string until typedef marked correctly
      this.setOptions(optionsList);
    }

    if (!this.displayMode$ && this.listType !== 'associated') {
      const results = await this.dataPageService.getDataPageData(datasource, this.parameters, context);
      this.fillOptions(results);
    }

    if (value != undefined) {
      const index = this.options$?.findIndex(element => element.key === value);
      this.value$ = index > -1 ? this.options$[index].value : value;
      this.fieldControl.setValue(this.value$);
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

    // Secondary text and grouping are both out of scope for associated/local list options
    if (this.listType !== 'associated') {
      const secondaryColumns = this.getSecondaryColumnsFromMetadata();
      if (secondaryColumns.length > 0) {
        columns = [...(columns || []), ...secondaryColumns];
      }

      const groupByColumns = this.getGroupByColumnsFromMetadata();
      if (groupByColumns.length > 0) {
        columns = [...(columns || []), ...groupByColumns];
      }
    }

    return { columns, datasource };
  }

  // Reads unresolved groupsFields metadata to derive group-by column descriptor(s); not a
  // display/search column, so grouping stays independent of primary/secondary text
  getGroupByColumnsFromMetadata() {
    const groupsFields = (this.pConn$.getRawMetadata()?.config as any)?.groupsFields;
    if (!Array.isArray(groupsFields)) {
      return [];
    }
    return this.mapMetadataColumns(groupsFields, { display: 'false', groupBy: 'true', useForSearch: false });
  }

  // Reads unresolved columnsFormatter metadata to derive secondary (contextual) display columns
  getSecondaryColumnsFromMetadata() {
    const columnsFormatter = (this.pConn$.getRawMetadata()?.config as any)?.columnsFormatter;
    if (!Array.isArray(columnsFormatter)) {
      return [];
    }
    return this.mapMetadataColumns(columnsFormatter, { display: 'true', secondary: 'true', useForSearch: true });
  }

  // Shared by getSecondaryColumnsFromMetadata/getGroupByColumnsFromMetadata: value must stay an
  // unresolved property reference (e.g. "@P .propName") for use as a raw-row lookup key
  mapMetadataColumns(rawColumns: any[], columnFlags: object): any[] {
    return rawColumns
      .map(item => {
        const property = item?.config?.value;
        if (typeof property !== 'string' || !property) {
          return undefined;
        }
        let value = property;
        if (property.startsWith('@P ')) {
          value = property.substring(3);
        } else if (property.startsWith('@USER ')) {
          value = property.substring(6);
        }
        return { value, type: item?.type, label: item?.config?.label, ...columnFlags };
      })
      .filter(Boolean);
  }

  fillOptions(results: any) {
    const optionsData: AutoCompleteOption[] = [];
    const displayColumn = this.getDisplayFieldsMetaData(this.columns);
    const secondaryColumns = this.columns?.filter(col => col.display === 'true' && col.secondary === 'true') || [];
    const groupByColumn = this.columns?.find(col => col.groupBy === 'true');

    results?.forEach(element => {
      const obj: AutoCompleteOption = {
        key: element[displayColumn.key] || element.pyGUID,
        value: element[displayColumn.primary]?.toString()
      };

      if (secondaryColumns.length > 0) {
        const secondaryComponents = this.buildSecondaryComponents(element, secondaryColumns);
        if (secondaryComponents.length > 0) {
          obj.secondaryComponents = secondaryComponents;
        }

        const secondarySearchText = this.buildSecondarySearchText(element, secondaryColumns);
        if (secondarySearchText) {
          obj.secondarySearchText = secondarySearchText;
        }
      }

      if (groupByColumn) {
        obj.group = this.resolveGroupValue(element[groupByColumn.value as string]);
      }

      optionsData.push(obj);
    });

    if (groupByColumn) {
      this.sortByGroup(optionsData);
    }

    this.setOptions(optionsData);
  }

  // Null/undefined/whitespace-only source values normalize to '' — the shared blank group
  resolveGroupValue(rawValue: any): string {
    if (rawValue === null || rawValue === undefined) {
      return '';
    }
    const stringValue = rawValue.toString();
    return stringValue.trim() ? stringValue : '';
  }

  // Ascending, case-sensitive, stable sort so same-group options keep their original relative order
  sortByGroup(options: AutoCompleteOption[]): void {
    options.sort((a, b) => {
      const groupA = a.group ?? '';
      const groupB = b.group ?? '';
      if (groupA < groupB) {
        return -1;
      }
      if (groupA > groupB) {
        return 1;
      }
      return 0;
    });
  }

  // Rendering only — one read-only PConnect component per configured secondary field, in
  // configured order, regardless of whether its value is empty (FieldValueList's own
  // empty-value fallback renders the placeholder, e.g. "Label: ---"). Mirrors ScalarListComponent's
  // createComponent/DISPLAY_ONLY pattern.
  buildSecondaryComponents(element: any, secondaryColumns): any[] {
    return secondaryColumns.map(col =>
      this.pConn$.createComponent(
        {
          type: col.type,
          config: {
            value: element[col.value as string],
            displayMode: 'DISPLAY_ONLY',
            readOnly: true,
            label: col.label
          }
        },
        '',
        0,
        {}
      )
    ); // 2nd, 3rd, and 4th args empty string/object/null until typedef marked correctly as optional
  }

  // Search only — independent of buildSecondaryComponents; never derived from rendered output.
  buildSecondarySearchText(element: any, secondaryColumns): string {
    return secondaryColumns
      .map(col => {
        const rawValue = element[col.value as string];
        return rawValue === null || rawValue === undefined ? '' : rawValue.toString().trim().toLowerCase();
      })
      .filter(Boolean)
      .join(' ');
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
    metaDataObj.key = keyCol.length > 0 ? (keyCol[0].value ?? 'auto') : 'auto';
    for (let index = 0; index < displayColumns.length; index += 1) {
      if (displayColumns[index].primary === 'true') {
        metaDataObj.primary = displayColumns[index].value ?? '';
      } else if (displayColumns[index].secondary === 'true') {
        metaDataObj.secondary.push(displayColumns[index].value ?? '');
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

  // Re-fetches the options list
  refreshOptionsList(): void {
    if (!this.displayMode$ && this.listType !== 'associated') {
      const context = this.pConn$.getContextName();
      this.dataPageService
        .getDataPageData(this.datasource, this.parameters, context)
        .then((results: any) => this.fillOptions(results))
        .catch(e => console.error(e));
    }
  }

  // Sets values for all columns that have setProperty defined
  setValuesToAdditionalFields(record: Record<string, unknown>): void {
    const setPropertyList = this.columns.filter(col => col.setProperty).map(col => ({ source: col.value, target: col.setProperty, key: col.key }));

    setPropertyList.forEach(prop => {
      let valueToSet: string;
      if (prop.key === 'true') {
        valueToSet = record[prop.source]?.toString() || (record as any).pyGUID || '';
      } else {
        valueToSet = record[prop.source]?.toString() || '';
      }

      if (prop.target === 'Associated property') {
        handleEvent(this.actionsApi, 'changeNblur', this.propName, valueToSet);
      } else {
        const target = typeof prop.target === 'string' ? prop.target : '';
        const targetProp = target.startsWith('.') ? target : `.${target}`;
        (this.actionsApi as any).updateFieldValue(targetProp, valueToSet, { associatedProperty: this.propName });
        (this.actionsApi as any).triggerFieldChange(targetProp, valueToSet);
      }
    });
  }

  createNewButtonHandler(): void {
    // Close the options panel so it doesn't remain open on top of the create-new modal
    this.autocompleteTrigger?.closePanel();

    if (this.onCreateNewFn) {
      this.onCreateNewFn();
      return;
    }

    if (!this.contextClass) {
      return;
    }

    const context = this.pConn$.getContextName();
    const normalizedReferenceType = typeof this.referenceType === 'string' ? this.referenceType.toLowerCase() : '';
    const isDataReference = normalizedReferenceType === 'data';
    const { CREATE_STAGE_DONE } = PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS;
    const DATA_OBJECT_CREATED = (PCore.getConstants().PUB_SUB_EVENTS as any).DATA_EVENTS?.DATA_OBJECT_CREATED;
    const eventType = isDataReference && DATA_OBJECT_CREATED ? DATA_OBJECT_CREATED : CREATE_STAGE_DONE;
    const contextClass = this.contextClass;

    const createNewCallback = isDataReference
      ? (data: { data?: { responseData?: Record<string, unknown> } }) => {
          // Clear contexted cache before re-fetching
          PCore.getDataApi().clearContextedCache(context);

          const responseData = data?.data?.responseData;
          if (responseData) {
            this.setValuesToAdditionalFields(responseData);
            const displayColumn = this.getDisplayFieldsMetaData(this.columns);
            const newKey = responseData[displayColumn.key]?.toString() || (responseData as any).pyGUID;
            if (this.onRecordChange && newKey) {
              this.onRecordChange.emit({ id: newKey });
            }
          }

          this.refreshOptionsList();
          PCore.getPubSubUtils().unsubscribe(eventType, contextClass);
        }
      : (data: { caseId?: string; caseType?: string; ID?: string }) => {
          // Clear contexted cache before re-fetching
          PCore.getDataApi().clearContextedCache(context);

          const newCaseId = data.caseId?.split(' ').pop();
          if (data.caseType === contextClass) {
            const selectKey = data.ID || newCaseId;

            if (selectKey && this.listType !== 'associated' && this.datasource) {
              this.dataPageService
                .getDataPageData(this.datasource, this.parameters, context)
                .then((results: any) => {
                  this.fillOptions(results);

                  const displayColumn = this.getDisplayFieldsMetaData(this.columns);
                  const newRecord = results?.find((el: any) => el.ID === data.ID || (el[displayColumn.key] || el.pyGUID) === selectKey);
                  if (newRecord) {
                    this.setValuesToAdditionalFields(newRecord);
                  } else {
                    handleEvent(this.actionsApi, 'changeNblur', this.propName, selectKey);
                  }
                  if (this.onRecordChange) {
                    this.onRecordChange.emit({ id: selectKey });
                  }
                })
                .catch(e => console.error(e));
            }
            PCore.getPubSubUtils().unsubscribe(eventType, contextClass);
          }
        };

    // Build the create action if createNewRecord fn is not provided
    const triggerCreate = this.createNewRecordFn
      ? this.createNewRecordFn()
      : isDataReference
        ? this.pConn$.getActionsApi().showDataObjectCreateView(contextClass)
        : this.pConn$.getActionsApi().createWork(contextClass, {
            openCaseViewAfterCreate: false,
            startingFields: {}
          });

    Promise.resolve(triggerCreate)
      .then(() => {
        PCore.getPubSubUtils().subscribe(eventType, createNewCallback, contextClass);
        // Re-initialize the list
        this.refreshOptionsList();
      })
      .catch(e => console.error(e));
  }
}
