import { Component, OnInit, Input, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { getMappedKey } from '../advanced-search/search-group/persist-utils';
import { componentCachePersistUtils } from '../advanced-search/search-group/persist-utils';
import { getFirstChildConfig } from '../data-reference/utils';
import { DataReferenceAdvancedSearchService } from './data-reference-advanced-search.service';

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
  displayAs: any;
  isDDSourceDeferred: any;
  showPromotedFilters: any;
  displayMode: any;
  refFieldMetadata: any;
  contextClass: any;
  selectionList: any;
  inline: any;
  isCreationOfNewRecordAllowedForReference: any;
  showAdvancedSearch: boolean;
  pyID: any;
  allowImplicitRefresh: any;
  displayChild = false;
  dataRelationshipContext: any;

  constructor(
    private angularPConnect: AngularPConnectService,
    private advancedSearchService: DataReferenceAdvancedSearchService
  ) {}

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    this.children = this.pConn$.getChildren();
    this.updateSelf();

    if (
      this.rawViewMetadata.config?.parameters &&
      !this.isDDSourceDeferred &&
      ['Checkbox', 'Dropdown', 'RadioButtons'].includes(this.firstChildMeta?.type)
    ) {
      const { value, key, text } = this.firstChildMeta.config.datasource.fields;

      if (this.firstChildMeta.config.variant !== 'card' || this.firstChildMeta.config.variant === 'card') {
        PCore.getDataApiUtils()
          .getData(this.refList, {
            dataViewParameters: this.parameters
          })
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
                    .filter(item => item.key); // Filtering out undefined entries
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

  // Callback passed when subscribing to store change
  onStateChange() {
    // Should always check the bridge to see if the component should
    // update itself (re-render)
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);

    // ONLY call updateSelf when the component should update
    if (bUpdateSelf) {
      this.updateSelf();
    }
  }

  updateSelf() {
    // Update properties based on configProps
    const theConfigProps = this.pConn$.getConfigProps();
    this.updatePropertiesFromProps(theConfigProps);

    const { displayAs, displayMode } = theConfigProps;
    this.rawViewMetadata = this.pConn$.getRawMetadata();
    this.viewName = this.rawViewMetadata.name;
    this.firstChildMeta = this.rawViewMetadata.children[0];
    this.refList = this.rawViewMetadata.config.referenceList;
    this.dataRelationshipContext =
      this.rawViewMetadata.config.contextClass && this.rawViewMetadata.config.name ? this.rawViewMetadata.config.name : null;
    this.canBeChangedInReviewMode = theConfigProps.allowAndPersistChangesInReviewMode && ['autocomplete', 'dropdown'].includes(displayAs);
    this.isDisplayModeEnabled = ['DISPLAY_ONLY', 'STACKED_LARGE_VAL'].includes(displayMode);
    this.refFieldMetadata = this.pConn$.getFieldMetadata(this.rawViewMetadata?.config?.authorContext);
    this.pyID = getMappedKey('pyID');
    // @ts-ignore
    const { allowImplicitRefresh } = PCore.getFieldDefaultUtils().fieldDefaults?.DataReference || {};

    this.allowImplicitRefresh = allowImplicitRefresh;
    this.isDDSourceDeferred =
      (this.firstChildMeta?.type === 'Dropdown' && this.selectionMode === SELECTION_MODE.SINGLE && this.refFieldMetadata?.descriptors) ||
      this.firstChildMeta.config.deferDatasource;

    if (this.firstChildMeta?.type === 'Region') {
      return;
    }

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
      this.firstChildMeta.config.displayMode = displayMode;
    }
    if (this.firstChildMeta.type === 'SimpleTableSelect' && this.selectionMode === SELECTION_MODE.MULTI) {
      this.propName = PCore.getAnnotationUtils().getPropertyName(this.firstChildMeta.config.selectionList);
    } else {
      this.propName = PCore.getAnnotationUtils().getPropertyName(this.firstChildMeta.config.value);
    }

    this.generateChildrenToRender();
    this.displayChild = !(this.displaySingleRef || this.displayMultiRef);
  }

  updatePropertiesFromProps(theConfigProps) {
    const label = theConfigProps.label;
    const showLabel = theConfigProps.showLabel;
    this.referenceType = theConfigProps.referenceType;
    this.selectionMode = theConfigProps.selectionMode;
    this.parameters = theConfigProps.parameters;
    this.hideLabel = theConfigProps.hideLabel;
    this.displayAs = theConfigProps.displayAs;
    this.showPromotedFilters = theConfigProps.showPromotedFilters;
    this.displayMode = theConfigProps.displayMode;
    this.propsToUse = { label, showLabel, ...this.pConn$.getInheritedProps() };
    this.contextClass = theConfigProps.contextClass;
    this.selectionList = theConfigProps.selectionList;
    this.inline = theConfigProps.inline;
    this.isCreationOfNewRecordAllowedForReference = theConfigProps.isCreationOfNewRecordAllowedForReference;
    if (this.propsToUse.showLabel === false) {
      this.propsToUse.label = '';
    }
  }

  generateChildrenToRender() {
    const theRecreatedFirstChild = this.recreatedFirstChild();
    if (this.firstChildMeta?.type !== 'Region') {
      const viewsRegion = this.rawViewMetadata.children[1];

      if (viewsRegion?.name === 'Views' && viewsRegion.children.length) {
        viewsRegion.children.map(child => {
          child.config.isEmbeddedInDataReference = true;
          return child;
        });
        this.childrenToRender = [theRecreatedFirstChild, ...this.children.slice(1)];
      } else {
        this.childrenToRender = [theRecreatedFirstChild];
      }
    } else if (this.displayAs === 'advancedSearch') {
      this.childrenToRender = [theRecreatedFirstChild];
    }

    // Render
    if (this.childrenToRender.length === 1) {
      return this.childrenToRender[0] ?? null;
    }
  }

  handleSelection(event) {
    const caseKey = this.pConn$.getCaseInfo().getKey();
    const refreshOptions: any = { autoDetectRefresh: true, propertyName: '' };

    if ((this.pConn$?.getRawMetadata()?.children as Array<any>)?.length > 0 && this.pConn$?.getRawMetadata()?.children?.[0].config?.value) {
      refreshOptions.propertyName = this.pConn$?.getRawMetadata()?.children?.[0].config.value;
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
      PCore.getCaseUtils()
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

  recreatedFirstChild() {
    if (this.firstChildMeta?.type === 'Region' && this.displayAs !== 'advancedSearch') {
      return;
    }
    const { type } = this.firstChildMeta;
    this.firstChildPConnect = this.pConn$.getChildren()[0].getPConnect;

    this.setReadOnlyDisplayFlags();

    if (type === 'Dropdown' && this.dropDownDataSource === null && !this.isDDSourceDeferred && this.rawViewMetadata.config?.parameters) {
      return null;
    }

    this.prepareFirstChildMeta();

    const dataReferenceConfigToChild = this.buildDataReferenceConfig();
    const { disableStartingFieldsForReference = false } = PCore.getEnvironmentInfo().environmentInfoObject?.features?.form || ({} as any);

    if (this.displayAs === 'advancedSearch') {
      this.showAdvancedSearch = true;
      const searchSelectCacheKey = componentCachePersistUtils.getComponentStateKey(this.pConn$, this.rawViewMetadata.config.name);
      this.advancedSearchService.setConfig({
        dataReferenceConfigToChild,
        isCreateNewReferenceEnabled: !!dataReferenceConfigToChild.createNewRecord,
        disableStartingFieldsForReference,
        pyID: this.pyID,
        searchSelectCacheKey
      });
      return;
    }

    return this.firstChildPConnect().createComponent({
      type,
      config: {
        ...getFirstChildConfig({
          firstChildMeta: this.firstChildMeta,
          getPConnect: this.pConn$,
          rawViewMetadata: this.rawViewMetadata,
          contextClass: this.contextClass,
          dataReferenceConfigToChild,
          isCreateNewReferenceEnabled: !!dataReferenceConfigToChild.createNewRecord,
          disableStartingFieldsForReference,
          pyID: this.pyID
        })
      }
    });
  }

  private setReadOnlyDisplayFlags() {
    const isSingleMode = this.selectionMode === SELECTION_MODE.SINGLE;
    const isMultiMode = this.selectionMode === SELECTION_MODE.MULTI;

    if (isSingleMode && (this.displayAs === 'readonly' || this.isDisplayModeEnabled) && !this.canBeChangedInReviewMode) {
      this.displaySingleRef = true;
    }

    if (isMultiMode && (['readonly', 'readonlyMulti', 'map'].includes(this.displayAs) || this.isDisplayModeEnabled)) {
      this.displayMultiRef = true;
    }
  }

  private prepareFirstChildMeta() {
    // Cleanup
    if (this.firstChildMeta.config?.readOnly) {
      delete this.firstChildMeta.config.readOnly;
    }

    // Set datasource
    this.setChildDatasource();

    // Pass through configs
    if (this.firstChildMeta.config) {
      this.firstChildMeta.config.showPromotedFilters = this.showPromotedFilters;
      if (!this.canBeChangedInReviewMode) {
        this.firstChildMeta.config.displayMode = this.displayMode;
      }
    }
  }

  private setChildDatasource() {
    const { type, config } = this.firstChildMeta;

    if (['Dropdown', 'Checkbox', 'RadioButtons'].includes(type) && !config.deferDatasource && config.datasource) {
      const isCardVariant = config.variant === 'card';
      const hasParameters = this.rawViewMetadata.config?.parameters;
      // @ts-ignore
      const isDeferDataPageCallEnabled = isCardVariant && hasParameters && !this.firstChildPConnect()?.getSharedDataPageForReferenceList();

      const useDropDownDataSource = (isCardVariant && (this.dropDownDataSource || isDeferDataPageCallEnabled)) || (!isCardVariant && hasParameters);

      config.datasource.source = useDropDownDataSource ? this.dropDownDataSource : `@DATASOURCE ${this.refList}.pxResults`;
    } else if (type === 'AutoComplete') {
      config.datasource = this.refList;
      if (this.rawViewMetadata.config?.parameters) {
        config.parameters = this.parameters;
      }
    }
  }

  private buildDataReferenceConfig() {
    const fieldMetaData = this.buildFieldMetaData();
    const isCreateNewReferenceEnabled = this.isCreateNewRecordEnabled();

    const config: any = {
      selectionMode: this.selectionMode,
      additionalInfo: this.refFieldMetadata?.additionalInformation ? { content: this.refFieldMetadata.additionalInformation } : undefined,
      descriptors: this.selectionMode === SELECTION_MODE.SINGLE ? this.refFieldMetadata?.descriptors : null,
      datasourceMetadata: fieldMetaData?.datasourceMetadata,
      required: this.propsToUse.required,
      visibility: this.propsToUse.visibility,
      disabled: this.propsToUse.disabled,
      label: this.propsToUse.label,
      displayAs: this.displayAs,
      readOnly: false,
      dataRelationshipContext: this.dataRelationshipContext,
      hideLabel: this.hideLabel,
      onRecordChange: this.handleSelection.bind(this),
      createNewRecord: isCreateNewReferenceEnabled ? this.getCreateNewRecordFn() : undefined,
      inline: this.inline
    };

    if (this.selectionMode === SELECTION_MODE.SINGLE) {
      config.referenceType = this.referenceType;
      if (this.displayAs === 'advancedSearch') {
        config.value = this.rawViewMetadata.config.value;
        config.contextPage = this.rawViewMetadata.config.contextPage;
      }
    } else if (this.displayAs === 'advancedSearch') {
      config.selectionList = this.selectionList;
      config.readonlyContextList = this.rawViewMetadata.config.readonlyContextList;
    }

    return config;
  }

  private buildFieldMetaData() {
    if (!this.isDDSourceDeferred || this.firstChildMeta.config.deferDatasource) {
      return null;
    }

    const { text, value } = this.firstChildMeta?.config?.datasource?.fields || {};
    const getProp = (prop: string) => (prop?.startsWith('@P') ? prop.substring(3) : prop);

    const fieldMetaData = {
      datasourceMetadata: {
        ...this.refFieldMetadata,
        datasource: {
          name: this.rawViewMetadata.config?.referenceList,
          propertyForDisplayText: getProp(text),
          propertyForValue: getProp(value)
        }
      }
    };

    if (this.rawViewMetadata.config?.parameters) {
      fieldMetaData.datasourceMetadata.datasource['parameters'] = this.parameters;
    }

    return fieldMetaData;
  }

  private isCreateNewRecordEnabled() {
    const { features } = (PCore.getEnvironmentInfo().environmentInfoObject || {}) as any;
    const isEnvLP = features?.form;
    const isCreateNewRefEnabledInAuthoring = this.isCreationOfNewRecordAllowedForReference ?? isEnvLP?.isCreateNewReferenceEnabled;
    const isCaseRef = this.referenceType === 'Case' || this.firstChildMeta?.config?.referenceType === 'Case';
    const hasAccess = PCore.getAccessPrivilege().hasCreateAccess(this.contextClass);
    const isCreateNewRefEnabledForUser = isEnvLP ? isEnvLP.isCreateNewReferenceEnabled && hasAccess : isCaseRef;

    return isCreateNewRefEnabledInAuthoring && isCreateNewRefEnabledForUser;
  }

  private getCreateNewRecordFn() {
    const { disableStartingFieldsForReference = false } = PCore.getEnvironmentInfo().environmentInfoObject?.features?.form || ({} as any);
    const isCaseRef = this.referenceType === 'Case' || this.firstChildMeta?.config?.referenceType === 'Case';

    return () => {
      if (isCaseRef) {
        const startingFields: any = {};
        if (!disableStartingFieldsForReference) {
          startingFields.pyAddCaseContextPage = { pyID: this.pConn$.getCaseInfo().getKey()?.split(' ')?.pop() };
        }
        return this.pConn$.getActionsApi().createWork(this.contextClass, {
          openCaseViewAfterCreate: false,
          startingFields
        });
      }
      // Assumes Data reference type otherwise
      return getPConnect().getActionsApi().showDataObjectCreateView(this.contextClass);
    };
  }
}
