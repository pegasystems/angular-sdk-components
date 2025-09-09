import { Component, OnInit, Input, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import componentCachePersistUtils from '../advanced-search/search-group/persist-utils';
import { getMappedKey } from '../advanced-search/search-group/persist-utils';
import { DataReferenceAdvancedSearchService } from './data-reference-advanced-search.service';
import { getFirstChildConfig } from '../data-reference/utils';

const SELECTION_MODE = { SINGLE: 'single', MULTI: 'multi' };

@Component({
  selector: 'app-data-reference',
  templateUrl: './data-reference.component.html',
  styleUrls: ['./data-reference.component.scss'],
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class DataReferenceComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  // Used with AngularPConnect
  angularPConnectData: AngularPConnectData = {};

  arFields$: any[] = [];
  referenceType = '';
  selectionMode = '';
  parameters;
  hideLabel = false;
  childrenToRender: any[] = [];
  dropDownDataSource = '';
  isDisplayModeEnabled = false;
  propsToUse: any = {};
  rawViewMetadata: any = {};
  viewName = '';
  firstChildMeta: any = {};
  canBeChangedInReviewMode = false;
  propName = '';
  firstChildPConnect;
  children;
  displaySingleRef: boolean;
  displayMultiRef: boolean;
  refList: any;
  isDDSourceDeferred: any;
  allowImplicitRefresh: any;
  displayAs: any;
  displayMode: any;
  showPromotedFilters: any;
  refFieldMetadata: any;
  contextClass: any;
  disableStartingFieldsForReference = false;
  selectionList: any;
  inline: any;
  searchSelectCacheKey: string;
  pyID: any;

  constructor(
    private angularPConnect: AngularPConnectService,
    private advancedSearchService: DataReferenceAdvancedSearchService
  ) {}

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    this.children = this.pConn$.getChildren();
    this.checkAndUpdate();
    if (
      this.rawViewMetadata.config?.parameters &&
      !this.isDDSourceDeferred &&
      ['Checkbox', 'Dropdown', 'RadioButtons'].includes(this.firstChildMeta?.type)
    ) {
      const { value, key, text } = this.firstChildMeta.config.datasource.fields;
      if (this.firstChildMeta.config.variant !== 'card' || this.firstChildMeta.config.variant === 'card') {
        (
          PCore.getDataApiUtils().getData(
            this.refList,
            {
              dataViewParameters: this.parameters
            } as any,
            ''
          ) as Promise<any>
        )
          .then(res => {
            if (res.data.data !== null) {
              const ddDataSource = this.firstChildMeta.config.datasource.filterDownloadedFields
                ? res.data.data
                : res.data.data
                    .map(listItem => ({
                      key: listItem[key.split(' .', 2)[1]],
                      text: listItem[text.split(' .', 2)[1]],
                      value: listItem[value.split(' .', 2)[1]]
                    }))
                    .filter(item => item.key);
              // Filtering out undefined entries that will break preview
              this.dropDownDataSource = ddDataSource;
              this.updateSelf();
            } else {
              const ddDataSource: any = [];
              this.dropDownDataSource = ddDataSource;
            }
          })
          .catch(err => {
            console.error(err?.stack);
            return Promise.resolve({
              data: { data: [] }
            });
          });
      }
    }
  }

  ngOnDestroy(): void {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
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

  localizedPlaceholderOption(placeholder) {
    const { GENERIC_BUNDLE_KEY } = PCore.getLocaleUtils?.() ?? {};
    const localizedDefaultPlaceholder = this.pConn$.getLocalizedValue('select_placeholder_default', 'CosmosFields', GENERIC_BUNDLE_KEY);
    // If we have a placeholder, push that option in the list of items
    if (placeholder === 'Select...' && localizedDefaultPlaceholder !== 'select_placeholder_default') {
      return localizedDefaultPlaceholder;
    }
    return this.pConn$.getLocalizedValue(placeholder);
  }

  updateSelf() {
    // Update properties based on configProps
    const theConfigProps = this.pConn$.getConfigProps();
    this.updatePropertiesFromProps(theConfigProps);
    this.rawViewMetadata = this.pConn$.getRawMetadata();
    this.viewName = this.rawViewMetadata.name;
    this.firstChildMeta = this.rawViewMetadata.children[0];
    this.refList = this.rawViewMetadata.config.referenceList;
    this.canBeChangedInReviewMode =
      theConfigProps.allowAndPersistChangesInReviewMode && (this.displayAs === 'autocomplete' || this.displayAs === 'dropdown');
    this.isDisplayModeEnabled = ['DISPLAY_ONLY', 'STACKED_LARGE_VAL'].includes(this.displayMode);
    const rawViewMetadata: any = this.pConn$.getRawMetadata();
    this.refFieldMetadata = this.pConn$.getFieldMetadata(rawViewMetadata.config?.authorContext);

    this.isDDSourceDeferred =
      (this.firstChildMeta?.type === 'Dropdown' && this.selectionMode === SELECTION_MODE.SINGLE && this.refFieldMetadata?.descriptors) ||
      this.firstChildMeta.config.deferDatasource;
    this.pyID = getMappedKey('pyID');
    const isInfinity = this.pyID === 'pyID';
    const { allowImplicitRefresh } = isInfinity
      ? // @ts-ignore
        PCore.getFieldDefaultUtils().fieldDefaults?.DataReference || {}
      : {
          allowImplicitRefresh: true
        };

    this.allowImplicitRefresh = allowImplicitRefresh;
    if (this.firstChildMeta?.type !== 'Region') {
      this.firstChildPConnect = this.pConn$.getChildren()[0].getPConnect;

      /* remove refresh When condition from those old view so that it will not be used for runtime */
      if (this.firstChildMeta.config?.readOnly) {
        delete this.firstChildMeta.config.readOnly;
      }
      if (this.firstChildMeta?.type === 'Dropdown') {
        this.firstChildMeta.config.datasource.source = this.rawViewMetadata.config?.parameters
          ? this.dropDownDataSource
          : '@DATASOURCE '.concat(this.refList).concat('.pxResults');
      } else if (this.firstChildMeta?.type === 'AutoComplete') {
        this.firstChildMeta.config.datasource = this.refList;

        /* Insert the parameters to the component only if present */
        if (this.rawViewMetadata.config?.parameters) {
          this.firstChildMeta.config.parameters = this.parameters;
        }
      }
      // set displayMode conditionally
      if (!this.canBeChangedInReviewMode) {
        this.firstChildMeta.config.displayMode = this.displayMode;
      }

      this.generateChildrenToRender();
    }
  }

  updatePropertiesFromProps(theConfigProps) {
    const label = theConfigProps.label;
    const showLabel = theConfigProps.showLabel;
    this.referenceType = theConfigProps.referenceType;
    this.selectionMode = theConfigProps.selectionMode;
    this.parameters = theConfigProps.parameters;
    this.hideLabel = theConfigProps.hideLabel;
    this.displayAs = theConfigProps.displayAs;
    this.displayMode = theConfigProps.displayMode;
    this.contextClass = theConfigProps.contextClass;
    this.showPromotedFilters = theConfigProps.showPromotedFilters;
    this.selectionList = theConfigProps.selectionList;
    this.inline = theConfigProps.inline;
    this.propsToUse = { label, showLabel, ...this.pConn$.getInheritedProps() };
    if (this.propsToUse.showLabel === false) {
      this.propsToUse.label = '';
    }
  }

  generateChildrenToRender() {
    const theRecreatedFirstChild = this.recreatedFirstChild();
    const viewsRegion = this.rawViewMetadata.children[1];
    if (viewsRegion?.name === 'Views' && viewsRegion.children.length) {
      this.childrenToRender = [theRecreatedFirstChild, ...this.children.slice(1)];
    } else {
      this.childrenToRender = [theRecreatedFirstChild];
    }
  }

  handleSelection(event) {
    const caseKey = this.pConn$.getCaseInfo().getKey();
    const refreshOptions: any = { autoDetectRefresh: true };

    if (this.pConn$.getRawMetadata()?.children?.length > 0 && this.pConn$.getRawMetadata()?.children[0].config?.value) {
      refreshOptions.propertyName = this.pConn$.getRawMetadata()?.children[0].config.value;
      refreshOptions.classID = (this.pConn$.getRawMetadata() as any).classID;
    }

    // AutoComplete sets value on event.id whereas Dropdown sets it on event.target.value if event.id is unset
    // When value is empty propValue will be undefined here and no value will be set for the reference
    const propValue = event?.id || event?.target?.value;
    const propName =
      this.firstChildMeta.type === 'SimpleTableSelect' && this.selectionMode === SELECTION_MODE.MULTI
        ? PCore.getAnnotationUtils().getPropertyName(this.firstChildMeta.config.selectionList)
        : PCore.getAnnotationUtils().getPropertyName(this.firstChildMeta.config.value);

    const hasAssociatedViewConfigured = this.rawViewMetadata.children[1].children?.length;

    if (this.pConn$.getContextName().includes('modal') || this.pConn$.getContextName().includes('workarea')) {
      if (hasAssociatedViewConfigured || this.allowImplicitRefresh) {
        const pageReference = this.pConn$.getPageReference();
        let pgRef: any = null;
        if (pageReference.startsWith('objectInfo')) {
          pgRef = pageReference.replace('objectInfo.content', '');
        } else {
          pgRef = pageReference.replace('caseInfo.content', '');
        }
        const viewName = this.rawViewMetadata.name;
        this.pConn$
          .getActionsApi()
          .refreshCaseView(caseKey, viewName, pgRef, refreshOptions)
          .catch(() => {});
      }
    } else if (propValue && this.canBeChangedInReviewMode && this.isDisplayModeEnabled) {
      PCore.getDataApiUtils()
        .getCaseEditLock(caseKey, '')
        .then(caseResponse => {
          const pageTokens = this.pConn$.getPageReference().replace('caseInfo.content', '').split('.');
          let curr = {};
          const commitData = curr;

          pageTokens.forEach(el => {
            if (el !== '') {
              curr[el] = {};
              curr = curr[el];
            }
          });

          // expecting format like {Customer: {pyID:"C-100"}}
          const propArr = propName.split('.');
          propArr.forEach((element, idx) => {
            if (idx + 1 === propArr.length) {
              curr[element] = propValue;
            } else {
              curr[element] = {};
              curr = curr[element];
            }
          });

          PCore.getCaseUtils()
            .updateCaseEditFieldsData(caseKey, { [caseKey]: commitData }, caseResponse.headers.etag, this.pConn$.getContextName())
            .then(response => {
              PCore.getContainerUtils().updateParentLastUpdateTime(this.pConn$.getContextName(), response.data.data.caseInfo.lastUpdateTime);
              PCore.getContainerUtils().updateRelatedContextEtag(this.pConn$.getContextName(), response.headers.etag);
            });
        });
    }
  }

  createNewRecord() {
    const startingFields: any = {};
    if (this.referenceType === 'Case' || this.firstChildMeta?.config?.referenceType === 'Case') {
      if (!this.disableStartingFieldsForReference) {
        startingFields.pyAddCaseContextPage = { pyID: this.pConn$.getCaseInfo().getKey()?.split(' ')?.pop() };
      }
      // @ts-ignore
      return this.pConn$.getActionsApi().createWork(contextClass, {
        openCaseViewAfterCreate: false,
        startingFields
      });
    }
    if (this.referenceType === 'Data' || this.firstChildMeta?.config?.referenceType === 'Data') {
      return getPConnect().getActionsApi().showDataObjectCreateView(this.contextClass);
    }
  }

  // Re-create first child with overridden props
  // Memoized child in order to stop unmount and remount of the child component when data reference
  // rerenders without any actual change
  recreatedFirstChild() {
    const { type } = this.firstChildMeta;

    if (this.firstChildMeta?.type === 'Region' && this.displayAs !== 'advancedSearch') {
      return;
    }

    if (
      (this.displayAs === 'readonly' || this.isDisplayModeEnabled) &&
      !this.canBeChangedInReviewMode &&
      this.selectionMode === SELECTION_MODE.SINGLE
    ) {
      this.displaySingleRef = true;
    }

    if ((['readonly', 'readonlyMulti', 'map'].includes(this.displayAs) || this.isDisplayModeEnabled) && this.selectionMode === SELECTION_MODE.MULTI) {
      this.displayMultiRef = true;
    }

    /* Editable variants */
    // Datasource w/ parameters cannot load the dropdown before the parameters
    if (type === 'Dropdown' && this.dropDownDataSource === null && !this.isDDSourceDeferred && this.rawViewMetadata.config?.parameters) {
      return null;
    }

    if (this.firstChildMeta.config?.readOnly) {
      delete this.firstChildMeta.config.readOnly;
    }

    // 2) Set datasource
    if (
      ['Dropdown', 'Checkbox', 'RadioButtons'].includes(this.firstChildMeta?.type) &&
      !this.firstChildMeta.config.deferDatasource &&
      this.firstChildMeta.config.datasource
    ) {
      this.firstChildMeta.config.datasource.source =
        (this.firstChildMeta.config.variant === 'card' && this.dropDownDataSource) ||
        (this.firstChildMeta.config.variant !== 'card' && this.rawViewMetadata.config?.parameters)
          ? this.dropDownDataSource
          : '@DATASOURCE '.concat(this.refList).concat('.pxResults');
    } else if (this.firstChildMeta?.type === 'AutoComplete') {
      this.firstChildMeta.config.datasource = this.refList;

      if (this.rawViewMetadata.config?.parameters) {
        this.firstChildMeta.config.parameters = this.parameters;
      }
    }

    // 3) Pass through configs
    if (this.firstChildMeta.config) {
      this.firstChildMeta.config.showPromotedFilters = this.showPromotedFilters;
      if (!this.canBeChangedInReviewMode) {
        this.firstChildMeta.config.displayMode = this.displayMode;
      }
    }

    // 4) Define field meta
    let fieldMetaData: any = null;
    if (this.isDDSourceDeferred && !this.firstChildMeta.config.deferDatasource) {
      fieldMetaData = {
        datasourceMetadata: this.refFieldMetadata
      };
      if (this.rawViewMetadata.config?.parameters) {
        fieldMetaData.datasourceMetadata.datasource.parameters = this.parameters;
      }
      fieldMetaData.datasourceMetadata.datasource.propertyForDisplayText = this.firstChildMeta?.config?.datasource?.fields?.text.startsWith('@P')
        ? this.firstChildMeta?.config?.datasource?.fields?.text?.substring(3)
        : this.firstChildMeta?.config?.datasource?.fields?.text;
      fieldMetaData.datasourceMetadata.datasource.propertyForValue = this.firstChildMeta?.config?.datasource?.fields?.value.startsWith('@P')
        ? this.firstChildMeta?.config?.datasource?.fields?.value?.substring(3)
        : this.firstChildMeta?.config?.datasource?.fields?.value;
      fieldMetaData.datasourceMetadata.datasource.name = this.rawViewMetadata.config?.referenceList;
    }
    // @ts-ignore
    const disableStartingFieldsForReference = PCore.getEnvironmentInfo().environmentInfoObject?.features?.form || {};
    // @ts-ignore
    let { isCreateNewReferenceEnabled = false } = PCore.getEnvironmentInfo().environmentInfoObject?.features?.form || {};

    if (isCreateNewReferenceEnabled) {
      // @ts-ignore
      isCreateNewReferenceEnabled = isCreationOfNewRecordAllowedForReference && PCore.getAccessPrivilege().hasCreateAccess(contextClass);
    }

    const additionalInfo = this.refFieldMetadata?.additionalInformation
      ? {
          content: this.refFieldMetadata.additionalInformation
        }
      : undefined;

    const dataReferenceConfigToChild = {
      selectionMode: this.selectionMode,
      additionalInfo,
      descriptors: this.selectionMode === SELECTION_MODE.SINGLE ? this.refFieldMetadata?.descriptors : null,
      datasourceMetadata: fieldMetaData?.datasourceMetadata,
      required: this.propsToUse.required,
      visibility: this.propsToUse.visibility,
      disabled: this.propsToUse.disabled,
      label: this.propsToUse.label,
      displayAs: this.displayAs,
      readOnly: false,
      ...(this.selectionMode === SELECTION_MODE.SINGLE && {
        referenceType: this.referenceType
      }),
      ...(this.selectionMode === SELECTION_MODE.SINGLE &&
        this.displayAs === 'advancedSearch' && {
          value: this.rawViewMetadata.config.value,
          contextPage: this.rawViewMetadata.config.contextPage
        }),
      ...(this.selectionMode === SELECTION_MODE.MULTI &&
        this.displayAs === 'advancedSearch' && {
          selectionList: this.selectionList,
          readonlyContextList: this.rawViewMetadata.config.readonlyContextList
        }),
      dataRelationshipContext: this.rawViewMetadata.config.contextClass && this.rawViewMetadata.config.name ? this.rawViewMetadata.config.name : null,
      hideLabel: this.hideLabel,
      onRecordChange: this.handleSelection,
      createNewRecord: isCreateNewReferenceEnabled ? this.createNewRecord : undefined,
      inline: this.inline
    };

    const searchSelectCacheKey = componentCachePersistUtils.getComponentStateKey(this.pConn$, this.rawViewMetadata.config?.name);

    const dataReferenceAdvancedSearchContext = {
      dataReferenceConfigToChild,
      isCreateNewReferenceEnabled,
      disableStartingFieldsForReference,
      pyID: this.pyID,
      searchSelectCacheKey
    };
    this.advancedSearchService.setConfig(dataReferenceAdvancedSearchContext);

    return this.firstChildPConnect().createComponent({
      type,
      config: {
        ...getFirstChildConfig({
          firstChildMeta: this.firstChildMeta,
          getPConnect: this.pConn$,
          rawViewMetadata: this.rawViewMetadata,
          contextClass: this.contextClass,
          dataReferenceConfigToChild,
          isCreateNewReferenceEnabled,
          disableStartingFieldsForReference,
          pyID: this.pyID
        })
      }
    });
  }
}
