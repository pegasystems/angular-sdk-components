import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, forwardRef, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ComponentMetadataConfig } from '@pega/pcore-pconnect-typedefs/interpreter/types';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import {
  SELECTION_MODE,
  SIMPLE_TABLE_MANUAL_READONLY,
  generateColumns,
  addCompositeKeysToConfig,
  getDataRelationshipContextFromKey,
  generateDetailsDisplay,
  createNewRecord,
  getAdditionalInfo,
  camelCase
} from '../../../_helpers/objectReference-utils';
import { componentCachePersistUtils, getMappedKey } from '../../template/advanced-search/search-group/persist-utils';
import { DataReferenceAdvancedSearchService } from '../../../_services/data-reference-advanced-search.service';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface ObjectReferenceProps extends PConnFieldProps {
  showPromotedFilters: boolean;
  inline: boolean;
  parameters: object;
  mode: string;
  targetObjectType: any;
  allowAndPersistChangesInReviewMode: boolean;
  allowCreatingRecords?: boolean;
  linkReference?: boolean;
  matchPosition?: string;
  additionalFields?: any;
}

/**
 * Rendering modes for the template
 */
type RenderMode =
  | 'singleReferenceReadonly'
  | 'multiReferenceReadonly'
  | 'semanticLink'
  | 'searchAndSelect'
  | 'dynamicComponent';

@Component({
  selector: 'app-object-reference',
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)],
  templateUrl: './object-reference.component.html',
  styleUrl: './object-reference.component.scss'
})
export class ObjectReferenceComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  angularPConnectData: AngularPConnectData = {};
  configProps: ObjectReferenceProps;
  readOnly: boolean;
  type: string;
  isDisplayModeEnabled: boolean;
  canBeChangedInReviewMode: boolean;
  newComponentName: string;
  newPconn: typeof PConnect;
  rawViewMetadata: ComponentMetadataConfig | undefined;

  // Rendering mode
  renderMode: RenderMode = 'dynamicComponent';

  // Whether the dynamic component supports @Output() onRecordChange binding
  useOutputEvents = false;

  // Visibility flag — prevents rendering when platform sets visibility to false
  bVisible$ = true;

  // For SearchAndSelect
  searchSelectCacheKey: string;

  // For parameterized CheckboxGroup datasource
  parameterizedDataSource: any[] = [];

  constructor(
    private angularPConnect: AngularPConnectService,
    private dataRefAdvancedSearchService: DataReferenceAdvancedSearchService
  ) {}

  ngOnInit() {
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    this.checkAndUpdate();
  }

  onStateChange() {
    this.checkAndUpdate();
  }

  ngOnDestroy() {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  checkAndUpdate() {
    const shouldUpdate = this.angularPConnect.shouldComponentUpdate(this);
    if (shouldUpdate) {
      this.updateSelf();
    }
  }

  updateSelf() {
    this.useOutputEvents = false;
    this.configProps = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as ObjectReferenceProps;

    // Check visibility — if false, hide the entire component
    const { visibility = true } = this.configProps;
    this.bVisible$ = visibility !== false;
    const {
      allowAndPersistChangesInReviewMode: editableInReview = false,
      allowCreatingRecords,
      targetObjectType,
      mode = '',
      parameters,
      hideLabel = false,
      inline = false,
      showPromotedFilters = false,
      linkReference,
      matchPosition = 'contains',
      additionalFields
    } = this.configProps;

    let displayMode = this.configProps.displayMode;

    const referenceType: string = targetObjectType?.toLowerCase() === 'case' ? 'Case' : 'Data';
    this.rawViewMetadata = this.pConn$.getRawMetadata();
    const rawConfig = this.rawViewMetadata?.config as any;

    const refFieldMetadata = this.pConn$.getFieldMetadata(
      rawConfig?.mode === SELECTION_MODE.SINGLE
        ? rawConfig?.value?.split('.', 2)[1]
        : rawConfig?.pagelistValue?.substring(4)
    );

    const propsToUse: any = { ...this.pConn$.getInheritedProps(), ...this.configProps };
    if (!propsToUse.label) {
      propsToUse.label = this.configProps.label;
    }

    const { allowImplicitRefresh } = (PCore as any).getFieldDefaultUtils().fieldDefaults.DataReference || {};

    // Combobox → Multiselect/AutoComplete conversion
    if (rawConfig?.componentType === 'Combobox') {
      if (mode === SELECTION_MODE.MULTI) {
        rawConfig.componentType = 'Multiselect';
      } else {
        rawConfig.componentType = 'AutoComplete';
      }
    }

    // Load parameterized data for CheckboxGroup
    if (rawConfig?.parameters && ['CheckboxGroup'].includes(rawConfig.componentType)) {
      this.loadParameterizedDataSource(rawConfig, parameters);
    }

    // Handle readOnly prop
    if (displayMode !== 'DISPLAY_ONLY' && this.configProps.readOnly) {
      if (rawConfig?.componentType === 'Multiselect') {
        rawConfig.componentType = 'SemanticLink';
      } else if (mode === 'readonly-single') {
        displayMode = this.configProps.displayMode;
      } else {
        displayMode = 'DISPLAY_ONLY';
      }
    }

    // Computed variables
    this.isDisplayModeEnabled = displayMode === 'DISPLAY_ONLY';
    this.type = rawConfig?.componentType;
    this.canBeChangedInReviewMode = editableInReview && ['AutoComplete', 'Dropdown'].includes(this.type);

    // Read-only variants (readOnly or SemanticLink)
    if ((this.configProps.readOnly || this.type === 'SemanticLink') && !this.canBeChangedInReviewMode) {
      if (mode !== 'readonly-multi') {
        this.buildSingleReferenceReadonly(rawConfig, displayMode, referenceType, hideLabel, linkReference, propsToUse, additionalFields);
        this.renderMode = 'singleReferenceReadonly';
      } else {
        this.buildMultiReferenceReadonly(rawConfig, referenceType, propsToUse, displayMode, hideLabel, linkReference);
        this.renderMode = 'multiReferenceReadonly';
      }
      return;
    }

    // Display-only mode (readonly)
    if (this.isDisplayModeEnabled && !this.canBeChangedInReviewMode) {
      this.buildSingleReferenceReadonly(rawConfig, displayMode, referenceType, hideLabel, linkReference, propsToUse, additionalFields);
      this.renderMode = 'singleReferenceReadonly';
      return;
    }

    // Cards type
    if (this.type === 'Cards') {
      this.buildCardsChild(rawConfig);
      this.renderMode = 'dynamicComponent';
      return;
    }

    // Map type
    if (this.type === 'Map') {
      this.buildMapChild(rawConfig, targetObjectType, propsToUse);
      this.renderMode = 'dynamicComponent';
      return;
    }

    // CheckboxGroup type
    if (this.type === 'CheckboxGroup') {
      this.buildCheckboxGroupChild(rawConfig, mode, refFieldMetadata, propsToUse, hideLabel);
      this.renderMode = 'dynamicComponent';
      return;
    }

    // Table / SimpleTable type
    if (this.type === 'Table' || this.type === 'SimpleTable') {
      this.buildTableChild(this.type, rawConfig, mode, referenceType, propsToUse);
      this.renderMode = 'dynamicComponent';
      return;
    }

    // Common setup for remaining types (Dropdown, AutoComplete, SearchAndSelect, Multiselect)
    generateColumns(rawConfig, this.pConn$, referenceType);
    addCompositeKeysToConfig(rawConfig, this.pConn$);
    rawConfig.deferDatasource = true;
    rawConfig.listType = 'datapage';
    if (['Dropdown', 'AutoComplete'].includes(this.type) && !rawConfig.placeholder) {
      rawConfig.placeholder = '@L Select...';
    }
    rawConfig.showPromotedFilters = showPromotedFilters;
    if (!this.canBeChangedInReviewMode) {
      rawConfig.displayMode = displayMode;
    }

    // Build field metadata
    const fieldMetaData = this.buildFieldMetaData(rawConfig, parameters);

    const { disableStartingFieldsForReference = false } = (PCore as any).getEnvironmentInfo().environmentInfoObject?.features?.form || {};
    const contextClass = rawConfig.targetObjectClass;
    const formFeaturesAvailable = (PCore as any).getEnvironmentInfo().environmentInfoObject?.features?.form;
    const createAuthoringEnabled = allowCreatingRecords ?? formFeaturesAvailable?.isCreateNewReferenceEnabled;
    const userHasCreateAccess = formFeaturesAvailable
      ? formFeaturesAvailable.isCreateNewReferenceEnabled && PCore.getAccessPrivilege().hasCreateAccess(contextClass)
      : PCore.getAccessPrivilege().hasCreateAccess(contextClass);
    const isCreateNewReferenceEnabled = createAuthoringEnabled && userHasCreateAccess;

    // SearchAndSelect type
    if (this.type === 'SearchAndSelect') {
      this.buildSearchAndSelectChild(
        rawConfig,
        refFieldMetadata,
        propsToUse,
        referenceType,
        hideLabel,
        inline,
        matchPosition,
        isCreateNewReferenceEnabled,
        disableStartingFieldsForReference
      );
      this.renderMode = 'searchAndSelect';
      return;
    }

    // Multiselect type
    if (this.type === 'Multiselect') {
      this.buildMultiselectChild(
        rawConfig,
        mode,
        refFieldMetadata,
        fieldMetaData,
        propsToUse,
        referenceType,
        hideLabel,
        inline,
        isCreateNewReferenceEnabled,
        disableStartingFieldsForReference,
        contextClass
      );
      this.renderMode = 'dynamicComponent';
      return;
    }

    // Default: Dropdown, AutoComplete, etc.
    this.buildDefaultChild(
      rawConfig,
      mode,
      refFieldMetadata,
      fieldMetaData,
      propsToUse,
      referenceType,
      hideLabel,
      inline,
      isCreateNewReferenceEnabled,
      disableStartingFieldsForReference,
      contextClass,
      linkReference
    );
    this.renderMode = 'dynamicComponent';
  }

  onRecordChange = (event) => {
    const pConn = this.pConn$;
    const caseKey = pConn.getCaseInfo().getKey() ?? '';
    const refreshOptions: any = { autoDetectRefresh: true, propertyName: '' };
    refreshOptions.propertyName = (this.rawViewMetadata?.config as any)?.value ?? '';

    const { allowImplicitRefresh } = (PCore as any).getFieldDefaultUtils().fieldDefaults.DataReference || {};

    if (!this.canBeChangedInReviewMode || !pConn.getValue('__currentPageTabViewName') || allowImplicitRefresh) {
      const pgRef = pConn.getPageReference().replace('caseInfo.content', '') ?? '';
      const viewName = this.rawViewMetadata?.name;
      if (viewName && viewName.length > 0) {
        pConn.getActionsApi().refreshCaseView(caseKey, viewName, pgRef, refreshOptions);
      }
    }

    const propValue = event?.id || event?.target?.value || event;
    const propName =
      this.rawViewMetadata?.type === 'SimpleTableSelect' && this.configProps.mode === SELECTION_MODE.MULTI
        ? PCore.getAnnotationUtils().getPropertyName((this.rawViewMetadata?.config as any)?.selectionList ?? '')
        : PCore.getAnnotationUtils().getPropertyName((this.rawViewMetadata?.config as any)?.value ?? '');

    if (propValue && this.canBeChangedInReviewMode && this.isDisplayModeEnabled) {
      PCore.getCaseUtils()
        .getCaseEditLock(caseKey, '')
        .then(caseResponse => {
          const pageTokens = pConn.getPageReference().replace('caseInfo.content', '').split('.');
          let curr: any = {};
          const commitData = curr;

          pageTokens?.forEach(el => {
            if (el !== '') {
              curr[el] = {};
              curr = curr[el];
            }
          });

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
            .updateCaseEditFieldsData(caseKey, { [caseKey]: commitData }, caseResponse.headers.etag, pConn.getContextName() ?? '')
            .then(response => {
              PCore.getContainerUtils().updateParentLastUpdateTime(pConn.getContextName() ?? '', (response.data as any).data.caseInfo.lastUpdateTime);
              PCore.getContainerUtils().updateRelatedContextEtag(pConn.getContextName() ?? '', response.headers.etag);
            });
        });
    }
  };

  private loadParameterizedDataSource(rawConfig: any, parameters: any) {
    const { value, key, text } = {
      key: `@P ${rawConfig.selectionKey}`,
      text: `@P ${rawConfig.displayField}`,
      value: `@P ${rawConfig.selectionKey}`
    };
    const refList = rawConfig.referenceList;
    (PCore as any)
      .getDataApiUtils()
      .getData(refList, { dataViewParameters: parameters })
      .then((res: any) => {
        if (res.data.data !== null) {
          this.parameterizedDataSource = res.data.data
            .map((listItem: any) => ({
              key: listItem[key.split(' .', 2)[1]],
              text: listItem[text.split(' .', 2)[1]],
              value: listItem[value.split(' .', 2)[1]]
            }))
            .filter((item: any) => item.key);
        } else {
          this.parameterizedDataSource = [];
        }
      })
      .catch(() => {
        this.parameterizedDataSource = [];
      });
  }

  private buildFieldMetaData(rawConfig: any, parameters: any) {
    const fieldMetaData: any = {
      datasourceMetadata: { datasource: { parameters: {} } }
    };
    if (rawConfig.parameters) {
      fieldMetaData.datasourceMetadata.datasource.parameters = parameters;
    }
    fieldMetaData.datasourceMetadata.datasource.propertyForDisplayText = rawConfig.datasource?.fields?.text?.startsWith('@P')
      ? rawConfig.datasource.fields.text.substring(3)
      : rawConfig.datasource?.fields?.text;
    fieldMetaData.datasourceMetadata.datasource.propertyForValue = rawConfig.datasource?.fields?.value?.startsWith('@P')
      ? rawConfig.datasource.fields.value.substring(3)
      : rawConfig.datasource?.fields?.value;
    fieldMetaData.datasourceMetadata.datasource.name = rawConfig.referenceList;
    return fieldMetaData;
  }

  private buildSingleReferenceReadonly(rawConfig: any, displayMode: string | undefined, referenceType: string, hideLabel: boolean, linkReference: any, propsToUse: any, additionalFields: any) {
    // SingleReferenceReadonly is rendered via component-mapper with pConn$ which internally resolves config
    // Setting properties needed by the child component on config
    rawConfig.primaryField = rawConfig.displayField;
    rawConfig.text = rawConfig.displayField;
    rawConfig.caseClass = rawConfig.targetObjectClass;
    rawConfig.caseID = rawConfig.value;
    rawConfig.contextPage = `@P .${rawConfig.displayField ? getDataRelationshipContextFromKey(rawConfig.displayField) : null}`;
    this.renderMode = 'singleReferenceReadonly';
  }

  private buildMultiReferenceReadonly(rawConfig: any, referenceType: string, propsToUse: any, displayMode: string | undefined, hideLabel: boolean, linkReference: any) {
    this.renderMode = 'multiReferenceReadonly';
  }

  private buildCardsChild(rawConfig: any) {
    const selectionMode = rawConfig.mode;
    const datasourceKeyField =
      rawConfig.selectionKey ||
      (rawConfig.isCalculated ? '.pzInsKey' : `.${rawConfig.value.trim().split('.').pop()?.trim()}`);

    const componentMeta = {
      type: selectionMode === 'single' ? 'RadioButtons' : 'Checkbox',
      config: {
        ...rawConfig,
        label: rawConfig.label,
        value: selectionMode === 'single' ? rawConfig.value : undefined,
        referenceList: rawConfig.referenceList,
        contextClass: rawConfig.targetObjectClass,
        referenceType: rawConfig.targetObjectType === 'case' ? 'Case' : 'Data',
        readonlyContextList: selectionMode.includes('multi') ? rawConfig.pagelistValue : undefined,
        ...(selectionMode.includes('multi')
          ? {
              selectionList: rawConfig.pagelistValue.substring(3),
              selectionKey: rawConfig.selectionKey || (rawConfig.isCalculated ? '.pzInsKey' : undefined)
            }
          : { selectionList: rawConfig.contextPage?.substring(3) }),
        selectionMode: selectionMode.includes('multi') ? 'multi' : undefined,
        displayMode: rawConfig.isCalculated ? 'DISPLAY_ONLY' : undefined,
        renderMode: !rawConfig.isCalculated && rawConfig.mode === 'readonly-multi' ? 'ReadOnly' : undefined,
        variant: 'card',
        inlineDisplay: rawConfig.inlineDisplay ?? true,
        hideFieldLabels: rawConfig.hideFieldLabels,
        presets: [
          {
            children: [
              {
                children: rawConfig.secondaryFields,
                name: 'AdditionalDetails',
                type: 'Region'
              }
            ],
            config: {},
            id: 'P_',
            label: '',
            name: 'presets',
            template: 'Cards'
          }
        ],
        datasource: {
          fields: {
            key: `@P ${datasourceKeyField}`,
            text:
              typeof rawConfig.displayField === 'string' && rawConfig.displayField.trim()
                ? `@P .${rawConfig.displayField.trim().split('.').pop()?.trim()}`
                : `@P ${datasourceKeyField}`,
            value: `@P ${datasourceKeyField}`
          },
          filterDownloadedFields: true,
          source: `@DATASOURCE ${rawConfig.referenceList}.pxResults`
        },
        displayAs: 'cards',
        hideLabel: rawConfig.hideLabel,
        imagePosition: rawConfig.imagePosition,
        image: rawConfig.image,
        imageSize: rawConfig.imageSize,
        showImageDescription: rawConfig.showImageDescription,
        imageDescription: rawConfig.imageDescription,
        required: rawConfig.required,
        readOnly: !!rawConfig.isCalculated,
        disabled: rawConfig.disabled,
        labelOption: rawConfig.labelOption,
        primaryField: rawConfig.displayField || datasourceKeyField,
        dataRelationshipContext: rawConfig.displayField
          ? getDataRelationshipContextFromKey(rawConfig.displayField)
          : null
      }
    };

    const component = this.pConn$.createComponent(componentMeta as any, '', 0, {});
    this.newComponentName = component?.getPConnect().getComponentName();
    this.newPconn = component?.getPConnect();
  }

  private buildMapChild(rawConfig: any, targetObjectType: any, propsToUse: any) {
    const displayField = getDataRelationshipContextFromKey(rawConfig.displayField);
    const displayFieldMetadata = this.pConn$.getFieldMetadata(displayField);

    const componentMeta = {
      type: 'MapView',
      config: {
        contextClass: rawConfig.targetObjectClass,
        displayAs: 'map',
        hideLabel: false,
        label: rawConfig.label,
        referenceType: targetObjectType?.toLowerCase() === 'case' ? 'Case' : 'Data',
        localeReference: rawConfig.localeReference,
        classId: SIMPLE_TABLE_MANUAL_READONLY,
        detailsDisplay: generateDetailsDisplay({
          isCaseType: targetObjectType?.toLowerCase() === 'case',
          fieldForDisplay: displayField,
          fieldNameForKey: rawConfig.selectionKey,
          displayFieldMetadata
        }),
        presets: [
          {
            children: [
              {
                children: [],
                name: 'Columns',
                type: 'Region'
              },
              {
                children: rawConfig.secondaryFields,
                name: 'AdditionalDetails',
                type: 'Region'
              }
            ],
            config: {},
            id: 'P_',
            label: '',
            name: 'presets',
            locationDetails: rawConfig.locationDetails,
            template: 'Map'
          }
        ],
        readonlyContextList: rawConfig.pagelistValue,
        referenceList: rawConfig.pagelistValue,
        renderMode: 'ReadOnly',
        selectionMode: 'multi',
        required: rawConfig.required,
        readOnly: false,
        disabled: rawConfig.disabled,
        visibility: rawConfig.visibility
      }
    };

    const component = this.pConn$.createComponent(componentMeta as any, '', 0, {});
    this.newComponentName = component?.getPConnect().getComponentName();
    this.newPconn = component?.getPConnect();
  }

  private buildCheckboxGroupChild(rawConfig: any, mode: string, refFieldMetadata: any, propsToUse: any, hideLabel: boolean) {
    const displayField = rawConfig.displayField;
    const primaryField = displayField?.startsWith('@P') ? displayField?.substring(3) : displayField;
    const readOnly = !(mode === 'multi' || mode === 'single');
    const pageListValueFromConfig = rawConfig.pagelistValue;
    const selectionList = pageListValueFromConfig?.startsWith('@P') ? pageListValueFromConfig?.substring(3) : pageListValueFromConfig;

    const component = this.pConn$.createComponent(
      {
        type: 'Checkbox',
        config: {
          ...rawConfig,
          contextClass: rawConfig.targetObjectClass,
          datasource: {
            fields: {
              key: `@P ${rawConfig.selectionKey}`,
              text: `@P ${rawConfig.displayField}`,
              value: `@P ${rawConfig.selectionKey}`
            },
            source: !rawConfig.parameters ? `@DATASOURCE ${rawConfig.referenceList}.pxResults` : this.parameterizedDataSource
          },
          descriptors: mode === SELECTION_MODE.SINGLE ? refFieldMetadata?.descriptors : null,
          displayAs: 'checkboxgroup',
          hideLabel,
          inline: rawConfig.inline ?? false,
          label: propsToUse.label,
          primaryField,
          readOnly,
          readonlyContextList: pageListValueFromConfig,
          referenceType: rawConfig.targetObjectType,
          selectionKey: rawConfig.selectionKey,
          selectionList,
          selectionMode: mode,
          disabled: propsToUse.disabled,
          required: propsToUse.required,
          visibility: propsToUse.visibility,
          additionalInfo: refFieldMetadata?.additionalInformation
            ? { content: refFieldMetadata.additionalInformation }
            : undefined
        }
      } as any,
      '',
      0,
      {}
    );
    this.newComponentName = component?.getPConnect().getComponentName();
    this.newPconn = component?.getPConnect();
  }

  private buildTableChild(type: string, rawConfig: any, mode: string, referenceType: string, propsToUse: any) {
    const presets = [
      {
        children: [{ children: rawConfig.columns, name: 'Columns', type: 'Region' }],
        config: { filterExpression: rawConfig.filterExpression },
        id: 'P_',
        label: '',
        name: 'presets',
        template: 'Table'
      }
    ];
    const tableDisplayAs = camelCase(type);

    let componentConfig: any;

    if (mode === 'readonly-multi') {
      componentConfig = {
        type: 'SimpleTableSelect',
        config: {
          contextClass: rawConfig.targetObjectClass,
          defaultRowHeight: rawConfig.defaultRowHeight,
          displayAs: tableDisplayAs,
          hideLabel: false,
          label: propsToUse.label,
          localeReference: rawConfig.localeReference,
          presets,
          readOnly: true,
          readonlyContextList: rawConfig.pagelistValue,
          referenceList: rawConfig.pagelistValue,
          referenceType,
          renderMode: 'ReadOnly',
          rowHeader: rawConfig.rowHeader,
          selectionMode: 'multi',
          required: propsToUse.required,
          visibility: propsToUse.visibility,
          disabled: propsToUse.disabled,
          toggleFieldVisibility: rawConfig.toggleFieldVisibility
        }
      };
    } else if (mode === 'single' || mode === 'multi') {
      const contextPageFromConfig = mode === 'single' ? rawConfig.contextPage : rawConfig.pagelistValue;
      const contextPageValue = contextPageFromConfig?.startsWith('@P') ? contextPageFromConfig?.substring(3) : contextPageFromConfig;

      componentConfig = {
        type: 'SimpleTableSelect',
        config: {
          ...(mode === 'single' ? { selectionKey: rawConfig.value, value: rawConfig.value } : {}),
          dataRelationshipContext: contextPageValue,
          defaultRowHeight: rawConfig.defaultRowHeight,
          displayAs: tableDisplayAs,
          hideLabel: false,
          inline: false,
          label: propsToUse.label,
          localeReference: rawConfig.localeReference,
          presets,
          readOnly: false,
          referenceList: rawConfig.referenceList,
          referenceType,
          rowHeader: rawConfig.rowHeader,
          parameters: rawConfig.parameters,
          selectionList: contextPageValue,
          selectionMode: mode,
          showPromotedFilters: false,
          required: propsToUse.required,
          visibility: propsToUse.visibility,
          disabled: propsToUse.disabled,
          toggleFieldVisibility: rawConfig.toggleFieldVisibility
        }
      };
    }

    if (componentConfig) {
      const component = this.pConn$.createComponent(componentConfig, '', 0, {});
      this.newComponentName = component?.getPConnect().getComponentName();
      this.newPconn = component?.getPConnect();
    }
  }

  private buildSearchAndSelectChild(
    rawConfig: any,
    refFieldMetadata: any,
    propsToUse: any,
    referenceType: string,
    hideLabel: boolean,
    inline: boolean,
    matchPosition: string,
    isCreateNewReferenceEnabled: boolean,
    disableStartingFieldsForReference: boolean
  ) {
    const selectionMode = rawConfig.mode;
    const firstChildMeta = structuredClone((this.rawViewMetadata as any)?.children?.[0]);
    const pyID = getMappedKey('pyID');
    const additionalInfo = refFieldMetadata?.additionalInformation ? { content: refFieldMetadata.additionalInformation } : undefined;
    const pageListValueFromConfig = rawConfig.pagelistValue;
    const selectionList = pageListValueFromConfig?.startsWith('@P') ? pageListValueFromConfig?.substring(3) : pageListValueFromConfig;
    const contextPageFromConfig = rawConfig.contextPage;
    const unannotatedContextPageFromConfig = contextPageFromConfig?.startsWith('@P') ? contextPageFromConfig?.substring(3) : contextPageFromConfig;
    const name = (selectionList ?? unannotatedContextPageFromConfig)?.replace(/^\./, '');

    const dataReferenceConfigToChild: any = {
      selectionMode,
      additionalInfo,
      descriptors: selectionMode === SELECTION_MODE.SINGLE ? refFieldMetadata?.descriptors : null,
      required: propsToUse.required,
      visibility: propsToUse.visibility,
      disabled: propsToUse.disabled,
      label: propsToUse.label,
      displayAs: 'advancedSearch',
      readOnly: false,
      matchPosition,
      ...(selectionMode === SELECTION_MODE.SINGLE && { referenceType }),
      ...(selectionMode === SELECTION_MODE.SINGLE && {
        value: rawConfig.value,
        contextPage: contextPageFromConfig
      }),
      ...(selectionMode === SELECTION_MODE.MULTI && {
        selectionList,
        readonlyContextList: pageListValueFromConfig,
        referenceType: referenceType || firstChildMeta?.config?.referenceType
      }),
      dataRelationshipContext: rawConfig.targetObjectClass && name ? name : null,
      hideLabel,
      onRecordChange: this.onRecordChange,
      getAdditionalInfo: getAdditionalInfo.bind(this, this.pConn$, rawConfig?.authorContext),
      createNewRecord: isCreateNewReferenceEnabled ? createNewRecord : undefined,
      inline
    };

    this.searchSelectCacheKey = componentCachePersistUtils.getComponentStateKey(this.pConn$, name);

    // Set advanced search context via service
    this.dataRefAdvancedSearchService.setConfig({
      dataReferenceConfigToChild,
      isCreateNewReferenceEnabled,
      disableStartingFieldsForReference,
      pyID,
      searchSelectKey: this.searchSelectCacheKey
    });
  }

  private buildMultiselectChild(
    rawConfig: any,
    mode: string,
    refFieldMetadata: any,
    fieldMetaData: any,
    propsToUse: any,
    referenceType: string,
    hideLabel: boolean,
    inline: boolean,
    isCreateNewReferenceEnabled: boolean,
    disableStartingFieldsForReference: boolean,
    contextClass: string
  ) {
    const component = this.pConn$.createComponent(
      {
        type: 'Multiselect',
        config: {
          ...rawConfig,
          descriptors: refFieldMetadata?.descriptors,
          datasourceMetadata: fieldMetaData?.datasourceMetadata,
          selectionList: rawConfig.pagelistValue?.substring(3),
          readonlyContextList: rawConfig.pagelistValue,
          selectionKey: rawConfig.selectionKey,
          selectionMode: SELECTION_MODE.MULTI,
          required: propsToUse.required,
          visibility: propsToUse.visibility,
          disabled: propsToUse.disabled,
          label: propsToUse.label,
          parameters: rawConfig.parameters,
          readOnly: false,
          localeReference: rawConfig.localeReference,
          ...(mode === SELECTION_MODE.MULTI ? { referenceType } : {}),
          contextClass: rawConfig.targetObjectClass,
          primaryField: rawConfig.displayField?.startsWith('@P')
            ? rawConfig.displayField.slice(3)
            : rawConfig.displayField,
          dataRelationshipContext: rawConfig.pagelistValue?.substring(4),
          hideLabel: hideLabel ?? false,
          onRecordChange: this.onRecordChange,
          createNewRecord: isCreateNewReferenceEnabled
            ? () => createNewRecord({
                referenceType: rawConfig.targetObjectType === 'case' ? 'Case' : 'Data',
                pConn: this.pConn$,
                getPConnect: () => this.pConn$,
                disableStartingFieldsForReference,
                startingFields: {},
                contextClass
              })
            : undefined,
          inline,
          columnsFormatter: rawConfig.secondaryFields,
          additionalInfo: refFieldMetadata?.additionalInformation
            ? { content: refFieldMetadata.additionalInformation }
            : undefined
        }
      } as any,
      '',
      0,
      {}
    );
    this.newComponentName = component?.getPConnect().getComponentName();
    this.newPconn = component?.getPConnect();
  }

  private buildDefaultChild(
    rawConfig: any,
    mode: string,
    refFieldMetadata: any,
    fieldMetaData: any,
    propsToUse: any,
    referenceType: string,
    hideLabel: boolean,
    inline: boolean,
    isCreateNewReferenceEnabled: boolean,
    disableStartingFieldsForReference: boolean,
    contextClass: string,
    linkReference: any
  ) {
    this.useOutputEvents = true;
    const component = this.pConn$.createComponent(
      {
        type: this.type,
        config: {
          ...rawConfig,
          descriptors: mode === SELECTION_MODE.SINGLE ? refFieldMetadata?.descriptors : null,
          datasourceMetadata: fieldMetaData?.datasourceMetadata,
          required: propsToUse.required,
          visibility: propsToUse.visibility,
          disabled: propsToUse.disabled,
          label: propsToUse.label,
          parameters: rawConfig.parameters,
          readOnly: false,
          localeReference: rawConfig.localeReference,
          ...(mode === SELECTION_MODE.SINGLE ? { referenceType } : {}),
          contextClass: rawConfig.targetObjectClass,
          primaryField: rawConfig.displayField,
          dataRelationshipContext: rawConfig.displayField ? getDataRelationshipContextFromKey(rawConfig.displayField) : null,
          hideLabel,
          onRecordChange: this.onRecordChange,
          createNewRecord: isCreateNewReferenceEnabled
            ? () => createNewRecord({
                referenceType: rawConfig.targetObjectType === 'case' ? 'Case' : 'Data',
                pConn: this.pConn$,
                getPConnect: () => this.pConn$,
                disableStartingFieldsForReference,
                startingFields: {},
                contextClass
              })
            : undefined,
          inline,
          columnsFormatter: rawConfig.secondaryFields,
          getAdditionalInfo: getAdditionalInfo.bind(this, this.pConn$, rawConfig.displayField),
          linkReference: this.type === 'AutoComplete' ? linkReference : undefined
        }
      } as any,
      '',
      0,
      {}
    );
    this.newComponentName = component?.getPConnect().getComponentName();
    this.newPconn = component?.getPConnect();
  }
}
