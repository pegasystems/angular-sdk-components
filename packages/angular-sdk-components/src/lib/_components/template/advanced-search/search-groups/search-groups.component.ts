import { Component, Input, OnInit, OnDestroy, forwardRef, OnChanges, ChangeDetectorRef, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { componentCachePersistUtils } from '../search-group/persist-utils';
import { MatRadioModule } from '@angular/material/radio';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ComponentMapperComponent } from '../../../../_bridge/component-mapper/component-mapper.component';
import { getCacheInfo, isValidInput } from '../search-groups/utils';
import { Subscription } from 'rxjs';

const listViewConstants = {
  EVENTS: {
    LIST_VIEW_READY: 'LIST_VIEW_READY'
  }
};

export function flattenObj(obj: any): any {
  const result: any = {};
  Object.keys(obj).forEach(key => {
    if (!['context_data', 'pageInstructions'].includes(key)) {
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        const temp = flattenObj(obj[key]);
        Object.keys(temp).forEach(nestedKey => {
          result[`${key}.${nestedKey}`] = temp[nestedKey];
        });
      } else {
        result[key] = obj[key];
      }
    }
  });
  return result;
}

export const initializeSearchFields = (searchFields, getPConnect, referenceListClassID, searchFieldRestoreValues = {}) => {
  const filtersProperties = {};
  searchFields?.forEach(field => {
    let val = '';
    const { value, defaultValue = '' } = field.config;
    const propPath = PCore.getAnnotationUtils().getPropertyName(value);

    if (searchFieldRestoreValues[propPath]) {
      val = searchFieldRestoreValues[propPath];
    } else if (PCore.getAnnotationUtils().isProperty(defaultValue)) {
      val = getPConnect().getValue(defaultValue.split(' ')[1]);
    } else if (defaultValue.startsWith('@L')) {
      val = defaultValue.split(' ')[1];
    } else {
      val = defaultValue;
    }

    filtersProperties[propPath] = val;

    const valueSplit = value.split('@P ')[1]?.split('.').filter(Boolean) ?? [];
    valueSplit.pop();

    if (valueSplit.length) {
      let path = '';
      let currentClassID = referenceListClassID;
      valueSplit.forEach(item => {
        path = path.length ? `${path}.${item}` : item;
        currentClassID = (PCore.getMetadataUtils().getPropertyMetadata(item, currentClassID) as any).pageClass;
        if (currentClassID) {
          filtersProperties[`${path}.classID`] = currentClassID;
        }
      });
    }
  });
  return filtersProperties;
};

@Component({
  selector: 'app-search-groups',
  templateUrl: './search-groups.component.html',
  styleUrls: ['./search-groups.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatRadioModule,
    MatOptionModule,
    MatSelectModule,
    MatButtonModule,
    forwardRef(() => ComponentMapperComponent)
  ]
})
export class SearchGroupsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;
  @Input() searchGroupsProps;

  configProps$: any;
  cache: any;
  previousFormValues: any;
  isValidatorField: any;
  searchSelectCacheKey: any;
  activeGroupId: string;
  getPConnect: any;
  searchFields: any;
  referenceListClassID: any;
  transientItemID: any;
  useCache: boolean;
  searchFieldsC11nEnv: any = signal(null);
  referenceFieldName: any;
  viewName: any;
  subs: Subscription[] = [];
  localizedVal = PCore.getLocaleUtils().getLocaleValue;
  setShowRecords: any;
  groups: any;
  state: any = {};
  rawGroupsConfig: any;
  initialSearchFields: {};
  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    console.log('SearchGroupsComponent - ngOnInit');
  }

  ngOnChanges() {
    this.updateSelf();
  }

  // updateSelf
  updateSelf(): void {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());
    const { searchGroups: groups, referenceList } = this.configProps$;
    const { getPConnect, editableField, searchSelectCacheKey, cache } = this.searchGroupsProps;
    this.searchSelectCacheKey = searchSelectCacheKey;
    this.getPConnect = getPConnect;
    this.cache = cache || {};
    const referenceFieldName = editableField.replaceAll('.', '_');
    const { classID: referenceListClassID } = PCore.getMetadataUtils().getDataPageMetadata(referenceList) as any;
    const { useCache, initialActiveGroupId } = getCacheInfo(cache, groups);
    this.activeGroupId = initialActiveGroupId;
    const rawGroupsConfig = this.pConn$.getRawConfigProps().searchGroups;
    const activeGroupIndex = groups.findIndex(group => group.config.id === this.activeGroupId);
    const { children: searchFieldsChildren = [] } = activeGroupIndex !== -1 ? rawGroupsConfig[activeGroupIndex] : {};
    this.searchFields = searchFieldsChildren.map(field => ({
      ...field,
      config: { ...field.config, isSearchField: true }
    }));
    this.initialSearchFields = initializeSearchFields(
      this.searchFields,
      getPConnect,
      referenceListClassID,
      useCache && cache.activeGroupId === this.activeGroupId ? cache.searchFields : {}
    );
    const filtersWithClassID = {
      ...this.initialSearchFields,
      classID: referenceListClassID
    };
    const viewName = this.pConn$.getCurrentView();
    const transientId = getPConnect.getContainerManager().addTransientItem({ id: `${referenceFieldName}-${viewName}`, data: filtersWithClassID });
    this.transientItemID = transientId;
    this.createSearchFields();
  }

  createSearchFields() {
    const searchFieldsViewConfig = {
      name: 'SearchFields',
      type: 'View',
      config: {
        template: 'DefaultForm',
        NumCols: '3',
        contextName: this.transientItemID, // can be null initially; will be replaced after transient creation
        readOnly: false,
        context: this.transientItemID,
        localeReference: this.searchGroupsProps.localeReference
      },
      children: [
        {
          name: 'Fields',
          type: 'Region',
          children: this.searchFields
        }
      ]
    };

    // Create c11n env (Angular will render this via the SDK host component)
    this.searchFieldsC11nEnv.set(
      PCore.createPConnect({
        meta: searchFieldsViewConfig,
        options: {
          hasForm: true,
          contextName: this.transientItemID
        }
      })
    );

    this.cdRef.detectChanges();
  }

  getFilterData(): void {
    let changes = PCore.getFormUtils().getSubmitData(this.transientItemID, {
      isTransientContext: true,
      includeDisabledFields: true
    });

    if (Object.keys(this.cache.searchFields ?? {}).length > 0 && Object.keys(changes).length === 1) {
      changes = this.cache.searchFields;
    }

    const formValues = flattenObj(changes);

    if (
      !PCore.isDeepEqual(this.previousFormValues, formValues) &&
      PCore.getFormUtils().isFormValid(this.transientItemID) &&
      isValidInput(formValues)
    ) {
      if (this.isValidatorField) {
        // @ts-ignore
        PCore.getMessageManager().clearContextMessages({ context: transientItemID });
      }

      this.previousFormValues = formValues;
      // this.setShowRecords(true);

      PCore.getPubSubUtils().publish(PCore.getEvents().getTransientEvent().UPDATE_PROMOTED_FILTERS, {
        payload: formValues,
        showRecords: true,
        viewName: this.getPConnect.getCurrentView()
      });
    }

    this.state.activeGroupId = this.activeGroupId;
    this.state.searchFields = changes;
    this.state.selectedCategory = this.getPConnect.getCurrentView();
    const options = componentCachePersistUtils.getComponentStateOptions(this.getPConnect);
    componentCachePersistUtils.setComponentCache({
      cacheKey: this.searchSelectCacheKey,
      state: this.state,
      options
    });
  }

  resetFilterData(): void {
    PCore.getNavigationUtils().resetComponentCache(this.searchSelectCacheKey);
    const resetPayload = {
      transientItemID: this.transientItemID,
      data: initializeSearchFields(this.searchFields, this.getPConnect, this.referenceListClassID),
      options: { reset: true }
    };
    PCore.getContainerUtils().updateTransientData(resetPayload);
  }

  /** NEW: update existing transient data when active group changes */
  updateTransientDataForActiveGroup() {
    const filtersWithClassID = {
      ...this.initialSearchFields,
      classID: this.referenceListClassID
    };

    if (this.transientItemID) {
      // this mirrors the React: PCore.getContainerUtils().replaceTransientData(...)
      PCore.getContainerUtils().replaceTransientData({ transientItemID: this.transientItemID, data: filtersWithClassID });
    }
  }

  onActiveGroupChange(event: any) {
    this.activeGroupId = event.value;
    // update searchFields for the newly selected group (mirror how React recalculates)
    const activeGroupIndex = this.groups.findIndex(g => g.config.id === this.activeGroupId);
    const searchFieldsChildren = activeGroupIndex !== -1 ? this.rawGroupsConfig[activeGroupIndex]?.children || [] : [];
    this.searchFields = searchFieldsChildren.map(field => ({
      ...field,
      config: { ...field.config, isSearchField: true }
    }));

    // IMPORTANT: call replaceTransientData to update the transient with the new group's search fields
    this.updateTransientDataForActiveGroup();
  }

  private setupCacheReplayOnListViewReady(): void {
    if (Object.keys(this.cache?.searchFields ?? {}).length > 0) {
      const sub: any = PCore.getPubSubUtils().subscribe(
        listViewConstants.EVENTS.LIST_VIEW_READY,
        ({ viewName }: { viewName: string }) => {
          if (viewName === this.viewName && this.useCache) {
            this.getFilterData();
          }
        },
        `${this.searchSelectCacheKey}-listview-ready`
      );
      this.subs.push(sub);
    }
  }

  ngOnDestroy(): void {
    PCore.getPubSubUtils().unsubscribe(listViewConstants.EVENTS.LIST_VIEW_READY, `${this.searchSelectCacheKey}-listview-ready`);
    this.subs.forEach(s => s.unsubscribe());
  }
}
