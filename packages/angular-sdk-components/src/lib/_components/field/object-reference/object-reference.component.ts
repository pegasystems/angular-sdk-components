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
  parameters: object;
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

  private updateSelf() {
    this.configProps = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as ObjectReferenceProps;
    this.rawViewMetadata = this.pConn$.getRawMetadata();
    const { displayMode, allowAndPersistChangesInReviewMode, targetObjectType, mode } = this.configProps;

    this.isDisplayModeEnabled = displayMode === 'DISPLAY_ONLY';
    const editableInReview = allowAndPersistChangesInReviewMode ?? false;
    const rawConfig = this.rawViewMetadata?.config as any;
    this.type = rawConfig?.componentType;

    this.canBeChangedInReviewMode = editableInReview && ['Autocomplete', 'Dropdown'].includes(this.type);

    const referenceType: string = targetObjectType === 'case' ? 'Case' : 'Data';

    if (this.type === 'SemanticLink' && !this.canBeChangedInReviewMode) {
      this.createSemanticLink(rawConfig, displayMode, referenceType);
    } else if (this.type !== 'SemanticLink' && !this.isDisplayModeEnabled) {
      this.createEditableComponent(rawConfig, mode, referenceType);
    }
  }

  private createSemanticLink(rawConfig: any, displayMode: string, referenceType: string) {
    const { hideLabel } = this.configProps;
    const dataRelationshipContext = rawConfig?.displayField ? getDataRelationshipContextFromKey(rawConfig.displayField) : null;

    const config = {
      ...rawConfig,
      primaryField: rawConfig.displayField,
      caseClass: rawConfig.targetObjectClass,
      text: rawConfig.displayField,
      caseID: rawConfig.value,
      contextPage: `@P .${dataRelationshipContext}`,
      resourceParams: { workID: rawConfig.value },
      resourcePayload: { caseClassName: rawConfig.targetObjectClass },
      displayMode,
      referenceType,
      hideLabel,
      dataRelationshipContext
    };

    const component = this.pConn$.createComponent({ type: 'SemanticLink', config }, '', 0, {});
    this.newPconn = component?.getPConnect();
  }

  private createEditableComponent(rawConfig: any, mode: string, referenceType: string) {
    const { parameters, showPromotedFilters, hideLabel, inline } = this.configProps;
    const propsToUse = { ...this.pConn$.getInheritedProps(), ...this.configProps };

    const config = { ...rawConfig };
    generateColumns(config, this.pConn$, referenceType);
    config.deferDatasource = true;
    config.listType = 'datapage';
    if (['Dropdown', 'AutoComplete'].includes(this.type) && !config.placeholder) {
      config.placeholder = '@L Select...';
    }
    config.showPromotedFilters = showPromotedFilters;
    if (!this.canBeChangedInReviewMode) {
      config.displayMode = this.configProps.displayMode;
    }

    const refFieldMetadata = this.pConn$.getFieldMetadata(this.rawViewMetadata?.config?.value?.split('.', 2)[1] ?? '');

    const componentConfig = {
      ...config,
      descriptors: mode === 'single' ? refFieldMetadata?.descriptors : null,
      datasourceMetadata: this.getDatasourceMetadata(config, parameters),
      required: propsToUse.required,
      visibility: propsToUse.visibility,
      disabled: propsToUse.disabled,
      label: propsToUse.label,
      parameters: config.parameters,
      readOnly: false,
      localeReference: config.localeReference,
      ...(mode === 'single' ? { referenceType } : {}),
      contextClass: config.targetObjectClass,
      primaryField: config?.displayField,
      dataRelationshipContext: config?.displayField ? getDataRelationshipContextFromKey(config.displayField) : null,
      hideLabel,
      inline
    };

    const component = this.pConn$.createComponent({ type: this.type, config: componentConfig }, '', 0, {});
    this.newComponentName = component?.getPConnect().getComponentName();
    this.newPconn = component?.getPConnect();
    if (this.rawViewMetadata?.config) {
      this.rawViewMetadata.config = { ...config };
    }
  }

  private getDatasourceMetadata(config: any, parameters: object) {
    const getProp = (prop: string) => (prop?.startsWith('@P') ? prop.substring(3) : prop);
    return {
      datasource: {
        name: config?.referenceList ?? '',
        parameters: config?.parameters ? parameters : {},
        propertyForDisplayText: getProp(config?.datasource?.fields?.text),
        propertyForValue: getProp(config?.datasource?.fields?.value)
      }
    };
  }
}
