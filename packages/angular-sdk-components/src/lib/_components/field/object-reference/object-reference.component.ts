import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, forwardRef, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ComponentMetadataConfig } from '@pega/pcore-pconnect-typedefs/interpreter/types';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { generateColumns, getDataRelationshipContextFromKey } from '../../../_helpers/objectReference-utils';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface ObjectReferenceProps extends PConnFieldProps {
  showPromotedFilters: boolean;
  inline: boolean;
  parameters: Object;
  mode: string;
  targetObjectType: any;
  allowAndPersistChangesInReviewMode: boolean;
}

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
  value: { [key: string]: any };
  readOnly: boolean;
  isForm: boolean;
  type: string;
  isDisplayModeEnabled: boolean;
  canBeChangedInReviewMode: boolean;
  newComponentName: string;
  newPconn: typeof PConnect;
  rawViewMetadata: ComponentMetadataConfig | undefined;

  constructor(private angularPConnect: AngularPConnectService) {}

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
    this.configProps = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as ObjectReferenceProps;
    const displayMode = this.configProps.displayMode;
    const editableInReview = this.configProps.allowAndPersistChangesInReviewMode ?? false;
    const targetObjectType = this.configProps.targetObjectType;
    const mode = this.configProps.mode;
    const parameters = this.configProps.parameters;
    const hideLabel = this.configProps.hideLabel;
    const inline = this.configProps.inline;
    const showPromotedFilters = this.configProps.showPromotedFilters;
    const referenceType: string = targetObjectType === 'case' ? 'Case' : 'Data';
    this.rawViewMetadata = this.pConn$.getRawMetadata();
    const refFieldMetadata = this.pConn$.getFieldMetadata(this.rawViewMetadata?.config?.value?.split('.', 2)[1] ?? '');

    // Destructured properties
    const propsToUse = { ...this.pConn$.getInheritedProps(), ...this.configProps };

    // Computed variables
    this.isDisplayModeEnabled = displayMode === 'DISPLAY_ONLY';
    this.canBeChangedInReviewMode = editableInReview && ['Autocomplete', 'Dropdown'].includes((this.rawViewMetadata?.config as any)?.componentType);
    // componentType is not defined in ComponentMetadataConfig type so using any
    this.type = (this.rawViewMetadata?.config as any)?.componentType;

    if (this.type === 'SemanticLink' && !this.canBeChangedInReviewMode) {
      const config: any = {
        ...this.rawViewMetadata?.config,
        primaryField: (this.rawViewMetadata?.config as any).displayField
      };
      config.caseClass = (this.rawViewMetadata?.config as any).targetObjectClass;
      config.text = config.primaryField;
      config.caseID = config.value;
      config.contextPage = `@P .${
        (this.rawViewMetadata?.config as any)?.displayField
          ? getDataRelationshipContextFromKey((this.rawViewMetadata?.config as any).displayField)
          : null
      }`;
      config.resourceParams = {
        workID: config.value
      };
      config.resourcePayload = {
        caseClassName: config.caseClass
      };

      const component = this.pConn$.createComponent(
        {
          type: 'SemanticLink',
          config: {
            ...config,
            displayMode,
            referenceType,
            hideLabel,
            dataRelationshipContext: (this.rawViewMetadata?.config as any)?.displayField
              ? getDataRelationshipContextFromKey((this.rawViewMetadata?.config as any).displayField)
              : null
          }
        },
        '',
        0,
        {}
      );
      this.newPconn = component?.getPConnect();
    }

    if (this.type !== 'SemanticLink' && !this.isDisplayModeEnabled) {
      // 1) Set datasource
      const config: any = { ...this.rawViewMetadata?.config };
      generateColumns(config, this.pConn$, referenceType);
      config.deferDatasource = true;
      config.listType = 'datapage';
      if (['Dropdown', 'AutoComplete'].includes(this.type) && !config.placeholder) {
        config.placeholder = '@L Select...';
      }

      // 2) Pass through configs
      config.showPromotedFilters = showPromotedFilters;

      if (!this.canBeChangedInReviewMode) {
        config.displayMode = displayMode;
      }

      // 3) Define field meta

      const fieldMetaData = {
        datasourceMetadata: {
          datasource: {
            parameters: {},
            propertyForDisplayText: false,
            propertyForValue: false,
            name: ''
          }
        }
      };
      if (config?.parameters) {
        fieldMetaData.datasourceMetadata.datasource.parameters = parameters;
      }
      fieldMetaData.datasourceMetadata.datasource.propertyForDisplayText = config?.datasource?.fields?.text?.startsWith('@P')
        ? config?.datasource?.fields?.text?.substring(3)
        : config?.datasource?.fields?.text;
      fieldMetaData.datasourceMetadata.datasource.propertyForValue = config?.datasource?.fields?.value?.startsWith('@P')
        ? config?.datasource?.fields?.value?.substring(3)
        : config?.datasource?.fields?.value;
      fieldMetaData.datasourceMetadata.datasource.name = config?.referenceList ?? '';

      const component = this.pConn$.createComponent(
        {
          type: this.type,
          config: {
            ...config,
            descriptors: mode === 'single' ? refFieldMetadata?.descriptors : null,
            datasourceMetadata: fieldMetaData?.datasourceMetadata,
            required: propsToUse.required,
            visibility: propsToUse.visibility,
            disabled: propsToUse.disabled,
            label: propsToUse.label,
            parameters: config.parameters,
            readOnly: false,
            localeReference: config.localeReference,
            ...(mode === 'single' ? { referenceType } : ''),
            contextClass: config.targetObjectClass,
            primaryField: config?.displayField,
            dataRelationshipContext: config?.displayField ? getDataRelationshipContextFromKey(config.displayField) : null,
            hideLabel,
            inline
          }
        },
        '',
        0,
        {}
      );
      this.newComponentName = component?.getPConnect().getComponentName();
      this.newPconn = component?.getPConnect();
      if (this.rawViewMetadata?.config) {
        this.rawViewMetadata.config = config ? { ...config } : this.rawViewMetadata.config;
      }
    }
  }

  onRecordChange(value) {
    const caseKey = this.pConn$.getCaseInfo().getKey() ?? '';
    const refreshOptions = { autoDetectRefresh: true, propertyName: '' };
    refreshOptions.propertyName = this.rawViewMetadata?.config?.value ?? '';

    if (!this.canBeChangedInReviewMode || !this.pConn$.getValue('__currentPageTabViewName')) {
      const pgRef = this.pConn$.getPageReference().replace('caseInfo.content', '') ?? '';
      const viewName = this.rawViewMetadata?.name;
      if (viewName && viewName.length > 0) {
        getPConnect().getActionsApi().refreshCaseView(caseKey, viewName, pgRef, refreshOptions);
      }
    }

    const propValue = value;
    const propName =
      this.rawViewMetadata?.type === 'SimpleTableSelect' && this.configProps.mode === 'multi'
        ? PCore.getAnnotationUtils().getPropertyName(this.rawViewMetadata?.config?.selectionList ?? '')
        : PCore.getAnnotationUtils().getPropertyName(this.rawViewMetadata?.config?.value ?? '');

    if (propValue && this.canBeChangedInReviewMode && this.isDisplayModeEnabled) {
      PCore.getCaseUtils()
        .getCaseEditLock(caseKey, '')
        .then(caseResponse => {
          const pageTokens = this.pConn$.getPageReference().replace('caseInfo.content', '').split('.');
          let curr = {};
          const commitData = curr;

          pageTokens?.forEach(el => {
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
            .updateCaseEditFieldsData(caseKey, { [caseKey]: commitData }, caseResponse.headers.etag, this.pConn$?.getContextName() ?? '')
            .then(response => {
              PCore.getContainerUtils().updateParentLastUpdateTime(this.pConn$.getContextName() ?? '', response.data.data.caseInfo.lastUpdateTime);
              PCore.getContainerUtils().updateRelatedContextEtag(this.pConn$.getContextName() ?? '', response.headers.etag);
            });
        });
    }
  }
}
