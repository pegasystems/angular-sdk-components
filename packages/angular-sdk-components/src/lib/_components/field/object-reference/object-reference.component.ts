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

  updateSelf() {
    this.configProps = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as ObjectReferenceProps;
    const {
      displayMode,
      allowAndPersistChangesInReviewMode: editableInReview = false,
      targetObjectType,
      mode,
      parameters,
      hideLabel,
      inline,
      showPromotedFilters
    } = this.configProps;

    const referenceType: string = targetObjectType === 'case' ? 'Case' : 'Data';
    this.rawViewMetadata = this.pConn$.getRawMetadata();
    const refFieldMetadata = this.pConn$.getFieldMetadata(this.rawViewMetadata?.config?.value?.split('.', 2)[1] ?? '');
    const propsToUse = { ...this.pConn$.getInheritedProps(), ...this.configProps };

    this.isDisplayModeEnabled = displayMode === 'DISPLAY_ONLY';
    this.type = this.getComponentType();
    this.canBeChangedInReviewMode = editableInReview && ['Autocomplete', 'Dropdown'].includes(this.type);

    if (this.type === 'SemanticLink' && !this.canBeChangedInReviewMode) {
      const config: any = {
        ...this.rawViewMetadata?.config,
        primaryField: (this.rawViewMetadata?.config as any).displayField,
        caseClass: (this.rawViewMetadata?.config as any).targetObjectClass,
        text: (this.rawViewMetadata?.config as any).displayField,
        caseID: (this.rawViewMetadata?.config as any).value,
        contextPage: `@P .${(this.rawViewMetadata?.config as any).displayField ? getDataRelationshipContextFromKey((this.rawViewMetadata?.config as any).displayField) : null}`,
        resourceParams: { workID: (this.rawViewMetadata?.config as any).value },
        resourcePayload: { caseClassName: (this.rawViewMetadata?.config as any).targetObjectClass }
      };
      this.createSemanticLinkPConnect(config, displayMode ?? '', referenceType, hideLabel);
      return;
    }

    if (this.type !== 'SemanticLink' && !this.isDisplayModeEnabled) {
      const config: any = { ...this.rawViewMetadata?.config };
      generateColumns(config, this.pConn$, referenceType);
      config.deferDatasource = true;
      config.listType = 'datapage';
      if (['Dropdown', 'AutoComplete'].includes(this.type) && !config.placeholder) {
        config.placeholder = '@L Select...';
      }
      config.showPromotedFilters = showPromotedFilters;
      if (!this.canBeChangedInReviewMode) {
        config.displayMode = displayMode;
      }
      config.parameters = parameters;

      this.createOtherComponentPConnect(config, propsToUse, mode, refFieldMetadata, referenceType, hideLabel, inline);
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

  private getComponentType(): string {
    // componentType is not defined in ComponentMetadataConfig type so using any
    return (this.rawViewMetadata?.config as any)?.componentType;
  }

  private createSemanticLinkPConnect(config: any, displayMode: string, referenceType: string, hideLabel: boolean) {
    const semanticLinkConfig = {
      ...config,
      displayMode,
      referenceType,
      hideLabel,
      dataRelationshipContext: config.displayField ? getDataRelationshipContextFromKey(config.displayField) : null
    };

    const component = this.pConn$.createComponent({ type: 'SemanticLink', config: semanticLinkConfig }, '', 0, {});
    this.newPconn = component?.getPConnect();
  }

  private createOtherComponentPConnect(
    config: any,
    propsToUse: any,
    mode: string,
    refFieldMetadata: any,
    referenceType: string,
    hideLabel: boolean,
    inline: boolean
  ) {
    const fieldMetaData = {
      datasourceMetadata: {
        datasource: {
          parameters: config.parameters ?? {},
          propertyForDisplayText: config.datasource?.fields?.text?.substring(3) ?? config.datasource?.fields?.text,
          propertyForValue: config.datasource?.fields?.value?.substring(3) ?? config.datasource?.fields?.value,
          name: config.referenceList ?? ''
        }
      }
    };

    const componentConfig = {
      ...config,
      descriptors: mode === 'single' ? refFieldMetadata?.descriptors : null,
      datasourceMetadata: fieldMetaData.datasourceMetadata,
      required: propsToUse.required,
      visibility: propsToUse.visibility,
      disabled: propsToUse.disabled,
      label: propsToUse.label,
      readOnly: false,
      ...(mode === 'single' && { referenceType }),
      contextClass: config.targetObjectClass,
      primaryField: config.displayField,
      dataRelationshipContext: config.displayField ? getDataRelationshipContextFromKey(config.displayField) : null,
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
}
