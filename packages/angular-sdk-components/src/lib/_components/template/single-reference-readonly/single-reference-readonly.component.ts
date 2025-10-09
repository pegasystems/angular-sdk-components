import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { getDataRelationshipContextFromKey } from '../../../_helpers/objectReference-utils';

@Component({
  selector: 'app-single-reference-readonly',
  templateUrl: './single-reference-readonly.component.html',
  styleUrls: ['./single-reference-readonly.component.scss'],
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class SingleReferenceReadonlyComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;
  @Input() dataRelationshipContext?: any;

  angularPConnectData: AngularPConnectData = {};
  configProps: any;
  component: any;
  label: string;
  newPconn: typeof PConnect;

  constructor(private angularPConnect: AngularPConnectService) {}

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    this.checkAndUpdate();
  }

  ngOnDestroy(): void {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  // Callback passed when subscribing to store change
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

  updateSelf() {
    this.configProps = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());
    const rawViewMetadata = this.pConn$.getRawMetadata();
    const propsToUse = { ...this.pConn$.getInheritedProps(), ...this.configProps };
    const type = (rawViewMetadata?.config as any)?.componentType;
    const displayMode = this.configProps.displayMode;
    const targetObjectType = this.configProps.targetObjectType;
    const referenceType = targetObjectType === 'case' ? 'Case' : 'Data';
    const hideLabel = this.configProps.hideLabel;
    // const additionalFields = this.configProps.additionalFields;
    const displayAs = this.configProps.displayAs ?? 'readonly';
    const dataRelationshipContext = (rawViewMetadata?.config as any)?.displayField
      ? getDataRelationshipContextFromKey((rawViewMetadata?.config as any)?.displayField)
      : this.dataRelationshipContext;
    this.label = propsToUse.label;

    const editableComponents = ['AutoComplete', 'SimpleTableSelect', 'Dropdown', 'RadioButtons'];
    const config: any = {
      ...rawViewMetadata?.config,
      primaryField: (rawViewMetadata?.config as any)?.displayField
    };

    const activeViewRuleClass = (rawViewMetadata?.config as any)?.targetObjectClass;
    if (editableComponents.includes(type)) {
      config.caseClass = activeViewRuleClass;
      config.text = config.primaryField;
      config.caseID = config.value;
      config.contextPage = `@P .${dataRelationshipContext}`;
      config.resourceParams = {
        workID: displayAs === 'table' ? (config as any)?.selectionKey : config.value
      };
      config.resourcePayload = {
        caseClassName: activeViewRuleClass
      };
    }

    this.component = this.pConn$.createComponent(
      {
        type: 'SemanticLink',
        config: {
          ...config,
          displayMode,
          referenceType,
          hideLabel,
          dataRelationshipContext
        }
      },
      '',
      0,
      {}
    );
    this.newPconn = this.component.getPConnect();
  }
}
