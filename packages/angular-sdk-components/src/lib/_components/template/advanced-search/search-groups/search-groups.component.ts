import { Component, Input, OnInit, OnDestroy, forwardRef } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import componentCachePersistUtils from '../search-group/persist-utils';
import { AngularPConnectService, AngularPConnectData } from '../../../../_bridge/angular-pconnect';
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
export class SearchGroupsComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;
  @Input() searchGroupsProps;

  // For interaction with AngularPConnect
  angularPConnectData: AngularPConnectData = {};
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
  searchFieldsC11nEnv: any;
  referenceFieldName: any;
  viewName: any;
  subs: Subscription[] = [];
  localizedVal = PCore.getLocaleUtils().getLocaleValue;
  setShowRecords: any;
  groups: any;
  state: any = {};
  rawGroupsConfig: any;
  constructor(private angularPConnect: AngularPConnectService) {}

  ngOnInit(): void {
    // this.updateSelf();
    // this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    // this.checkAndUpdate();
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());
    console.log('searchGroupsProps', this.searchGroupsProps);
    const { getPConnect, editableField, localeReference, setShowRecords, searchSelectCacheKey, cache } = this.searchGroupsProps;
    this.cache = cache;
    this.getPConnect = getPConnect;
    console.log('this.getPConnect', this.getPConnect);
    this.setShowRecords = setShowRecords;
    this.searchSelectCacheKey = searchSelectCacheKey;
    this.referenceFieldName = editableField.replaceAll('.', '_');

    const { searchGroups: groups, referenceList } = getPConnect.getConfigProps();
    this.groups = groups;
    const { useCache, initialActiveGroupId } = getCacheInfo(cache, groups);
    this.useCache = useCache;
    this.viewName = getPConnect.getCurrentView();
    this.activeGroupId = initialActiveGroupId;
    this.rawGroupsConfig = getPConnect.getRawConfigProps().searchGroups;
    const activeGroupIndex = groups.findIndex(group => group.config.id === this.activeGroupId);
    const { children: searchFieldsChildren = [] } = activeGroupIndex !== -1 ? this.rawGroupsConfig[activeGroupIndex] : {};
    this.searchFields = searchFieldsChildren.map(field => ({
      ...field,
      config: { ...field.config, isSearchField: true }
    }));
    this.isValidatorField = this.searchFields.some(field => field.config.validator);
    const { classID } = PCore.getMetadataUtils().getDataPageMetadata(referenceList) as any;
    this.referenceListClassID = classID;
    this.initializeTransientData();
    this.setupCacheReplayOnListViewReady();
    // this.computeSearchFieldsForActiveGroup();
    // this.mountTransientItemWithInitialData();
    // this.setupCacheReplayOnListViewReady();
  }

  onStateChange() {
    this.checkAndUpdate();
  }

  checkAndUpdate() {
    // Should always check the bridge to see if the component should
    // update itself (re-render)
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);

    // ONLY call updateSelf when the component should update
    if (bUpdateSelf) {
      this.updateSelf();
    }
  }

  // updateSelf
  updateSelf(): void {
    // this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());
    // console.log('searchGroupsProps', this.searchGroupsProps);
    // const { getPConnect, editableField, localeReference, setShowRecords, searchSelectCacheKey, cache } = this.searchGroupsProps;
    // this.cache = cache;
    // this.getPConnect = getPConnect;
    // this.setShowRecords = setShowRecords;
    // this.searchSelectCacheKey = searchSelectCacheKey;
    // this.referenceFieldName = editableField.replaceAll('.', '_');
    // const { searchGroups: groups, referenceList } = getPConnect.getConfigProps();
    // this.groups = groups;
    // const { useCache, initialActiveGroupId } = getCacheInfo(cache, groups);
    // this.useCache = useCache;
    // this.viewName = getPConnect.getCurrentView();
    // this.activeGroupId = initialActiveGroupId;
    // const rawGroupsConfig = getPConnect.getRawConfigProps().searchGroups;
    // const activeGroupIndex = groups.findIndex(group => group.config.id === this.activeGroupId);
    // const { children: searchFieldsChildren = [] } = activeGroupIndex !== -1 ? rawGroupsConfig[activeGroupIndex] : {};
    // this.searchFields = searchFieldsChildren.map(field => ({
    //   ...field,
    //   config: { ...field.config, isSearchField: true }
    // }));
    // this.isValidatorField = this.searchFields.some(field => field.config.validator);
    // const { classID } = PCore.getMetadataUtils().getDataPageMetadata(referenceList) as any;
    // this.referenceListClassID = classID;
    // this.computeSearchFieldsForActiveGroup();
    // this.mountTransientItemWithInitialData();
    // this.setupCacheReplayOnListViewReady();
  }

  private computeSearchFieldsForActiveGroup(): void {
    // const rawGroupsConfig = this.getPConnect().getRawConfigProps().searchGroups;
    // const activeGroupIndex = this.groups.findIndex(g => g.config.id === this.activeGroupId);
    // const { children: searchFieldsChildren = [] } =
    //   activeGroupIndex !== -1 ? rawGroupsConfig[activeGroupIndex] : {};

    // this.searchFields = (searchFieldsChildren || []).map((field: any) => ({
    //   ...field,
    //   config: { ...field.config, isSearchField: true }
    // }));

    // this.isValidatorField = this.searchFields.some(f => f.config.validator);

    const initialSearchFields = initializeSearchFields(
      this.searchFields,
      this.getPConnect,
      this.referenceListClassID,
      this.useCache && this.cache.activeGroupId === this.activeGroupId ? this.cache.searchFields : {}
    );

    // Build the PCore view config (same as React)
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
    this.searchFieldsC11nEnv = PCore.createPConnect({
      meta: searchFieldsViewConfig,
      options: {
        hasForm: true,
        contextName: this.transientItemID
      }
    });
    console.log('searchFieldsC11nEnv', this.searchFieldsC11nEnv);
    // If transient already exists (e.g., after active group change), push new defaults
    if (this.transientItemID) {
      const filtersWithClassID = { ...initialSearchFields, classID: this.referenceListClassID };
      PCore.getContainerUtils().replaceTransientData({
        transientItemID: this.transientItemID,
        data: filtersWithClassID
      });
    }

    // this.cdr.markForCheck();
  }

  private mountTransientItemWithInitialData(): void {
    const initialSearchFields = initializeSearchFields(
      this.searchFields,
      this.getPConnect,
      this.referenceListClassID,
      this.useCache && this.cache.activeGroupId === this.activeGroupId ? this.cache.searchFields : {}
    );

    const filtersWithClassID = {
      ...initialSearchFields,
      classID: this.referenceListClassID
    };

    const transientId = this.getPConnect.getContainerManager().addTransientItem({
      id: `${this.referenceFieldName}-${this.viewName}`,
      data: filtersWithClassID
    });

    this.transientItemID = transientId;

    // Update searchFieldsC11nEnv with the now-known transient context
    if (this.searchFieldsC11nEnv?.setContextName) {
      this.searchFieldsC11nEnv.setContextName(this.transientItemID);
    }

    // this.cdr.markForCheck();
  }

  initializeTransientData() {
    const filtersWithClassID = {
      ...this.getInitialSearchFields(),
      classID: this.referenceListClassID
    };

    const viewName = this.getPConnect.getCurrentView();
    const transientId = this.getPConnect
      .getContainerManager()
      .addTransientItem({ id: `${this.referenceFieldName}-${viewName}`, data: filtersWithClassID });

    this.transientItemID = transientId;

    // Build the PCore view config (same as React)
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
    this.searchFieldsC11nEnv = PCore.createPConnect({
      meta: searchFieldsViewConfig,
      options: {
        hasForm: true,
        contextName: this.transientItemID
      }
    });
  }

  getInitialSearchFields() {
    const restoreValues = this.useCache && this.cache?.activeGroupId === this.activeGroupId ? this.cache.searchFields : {};
    return initializeSearchFields(this.searchFields, this.getPConnect, this.referenceListClassID, restoreValues);
  }

  /** NEW: update existing transient data when active group changes */
  updateTransientDataForActiveGroup() {
    const filtersWithClassID = {
      ...this.getInitialSearchFields(),
      classID: this.referenceListClassID
    };

    if (this.transientItemID) {
      // this mirrors the React: PCore.getContainerUtils().replaceTransientData(...)
      PCore.getContainerUtils().replaceTransientData({ transientItemID: this.transientItemID, data: filtersWithClassID });
    } else {
      // fallback: if no transient exists, add one (safe guard)
      const id = this.getPConnect().getCurrentView();
      const transientId = this.getPConnect()
        .getContainerManager()
        .addTransientItem({ id: `${this.referenceFieldName}-${id}`, data: filtersWithClassID });
      this.transientItemID = transientId;
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

  flattenObj(obj: any): any {
    const result: any = {};
    Object.keys(obj).forEach(key => {
      if (!['context_data', 'pageInstructions'].includes(key)) {
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          const temp = this.flattenObj(obj[key]);
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

  // onActiveGroupChange(newGroupId: string): void {
  //   this.activeGroupId = newGroupId;
  //   // Recompute fields and reset transient data for the new group
  //   // this.computeSearchFieldsForActiveGroup();
  // }

  getFilterData(): void {
    let changes = PCore.getFormUtils().getSubmitData(this.transientItemID, {
      isTransientContext: true,
      includeDisabledFields: true
    });

    if (Object.keys(this.cache.searchFields ?? {}).length > 0 && Object.keys(changes).length === 1) {
      changes = this.cache.searchFields;
    }

    const formValues = this.flattenObj(changes);

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
      this.setShowRecords(true);

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
