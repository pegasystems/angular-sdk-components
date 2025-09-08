import { Component, OnInit, Input, forwardRef, SimpleChanges, OnDestroy, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';
import { getAllFields } from '../../template/utils';
import { ReferenceComponent } from '../reference/reference.component';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

const NO_HEADER_TEMPLATES = ['SubTabs', 'SimpleTable', 'Confirmation', 'DynamicTabs', 'DetailsSubTabs'];
const DETAILS_TEMPLATES = [
  'Details',
  'DetailsFields',
  'DetailsOneColumn',
  'DetailsSubTabs',
  'DetailsThreeColumn',
  'DetailsTwoColumn',
  'NarrowWideDetails',
  'WideNarrowDetails'
];

function isDetailsTemplate(template) {
  return DETAILS_TEMPLATES.includes(template);
}

/**
 * WARNING:  It is not expected that this file should be modified.  It is part of infrastructure code that works with
 * Redux and creation/update of Redux containers and PConnect.  Modifying this code could have undesireable results and
 * is totally at your own risk.
 */

/**
 *
 * @param pConnn - PConnect Object
 * @returns visibility expression result if exists, otherwise true
 */
function evaluateVisibility(pConnn) {
  let bVisibility = true;
  const sVisibility = pConnn.meta.config.visibility;
  if (sVisibility && sVisibility.length) {
    // e.g. "@E .EmbeddedData_SelectedTestName == 'Readonly' && .EmbeddedData_SelectedSubCategory == 'Mode'"
    const aVisibility = sVisibility.split('&&');
    // e.g. ["EmbeddedData_SelectedTestName": "Readonly", "EmbeddedData_SelectedSubCategory": "Mode"]
    const context = pConnn.getContextName();
    // Reading values from the Store to evaluate the visibility expressions
    const storeData = PCore.getStore().getState()?.data[context].caseInfo.content;

    const initialVal = {};
    const oProperties = aVisibility.reduce((properties, property) => {
      const keyStartIndex = property.indexOf('.');
      const keyEndIndex = property.indexOf('=') - 1;
      const valueStartIndex = property.indexOf("'");
      const valueEndIndex = property.lastIndexOf("'") - 1;
      return {
        ...properties,
        [property.substr(keyStartIndex + 1, keyEndIndex - keyStartIndex - 1)]: property.substr(valueStartIndex + 1, valueEndIndex - valueStartIndex)
      };
    }, initialVal);

    const propertyKeys = Object.keys(oProperties);
    const propertyValues = Object.values(oProperties);

    for (let propertyIndex = 0; propertyIndex < propertyKeys.length; propertyIndex++) {
      if (storeData[propertyKeys[propertyIndex]] !== propertyValues[propertyIndex]) {
        bVisibility = false;
      }
    }
  }
  return bVisibility;
}

interface ViewProps {
  // If any, enter additional props that only exist on this component
  template?: string;
  label?: string;
  showLabel: boolean;
  title?: string;
  visibility?: boolean;
}

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class ViewComponent implements OnInit, OnDestroy, OnChanges {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;
  @Input() displayOnlyFA$: boolean;
  // @Input() updateToken$: number;

  angularPConnectData: AngularPConnectData = {};

  noHeaderTemplates = NO_HEADER_TEMPLATES;

  configProps$: ViewProps;
  inheritedProps$: any;
  arChildren$: any[];
  templateName$: string;
  title$ = '';
  label$ = '';
  showLabel$ = false;
  visibility$ = true;

  constructor(
    private angularPConnect: AngularPConnectService,
    private utils: Utils
  ) {}

  ngOnInit() {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);

    this.checkAndUpdate();
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

  ngOnChanges(changes: SimpleChanges) {
    const { pConn$ } = changes;

    if (pConn$.previousValue && pConn$.previousValue !== pConn$.currentValue) {
      this.checkAndUpdate();
    }
  }

  updateSelf() {
    if (this.angularPConnect.getComponentID(this) === undefined) {
      return;
    }

    // debugger;

    // normalize this.pConn$ in case it contains a 'reference'
    this.pConn$ = ReferenceComponent.normalizePConn(this.pConn$);

    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as ViewProps;
    this.inheritedProps$ = this.pConn$.getInheritedProps();

    // NOTE: this.configProps$.visibility'] is used in view.component.ts such that
    //  the View will only be rendered when this.configProps$.visibility'] is false.
    //  It WILL render if true or undefined.

    this.templateName$ = this.configProps$.template || '';
    this.title$ = this.configProps$.title || '';
    this.label$ = this.configProps$.label || '';
    this.showLabel$ = this.configProps$.showLabel || isDetailsTemplate(this.templateName$) || this.showLabel$;
    // label & showLabel within inheritedProps takes precedence over configProps
    this.label$ = this.inheritedProps$.label || this.label$;
    this.showLabel$ = this.inheritedProps$.showLabel || this.showLabel$;
    // children may have a 'reference' so normalize the children array
    this.arChildren$ = ReferenceComponent.normalizePConnArray(this.pConn$.getChildren());
    // console.log(' view this.arChildren$', this.arChildren$);
    this.visibility$ = this.configProps$.visibility ?? this.visibility$;

    /**
     * In instances where there is context, like with "shippingAddress," the pageReference becomes "caseInfo.content.shippingAddress."
     * This leads to problems in the getProperty API, as it incorrectly assesses the visibility condition by looking in the wrong location
     * in the Store for the property values. Reference component should be able to handle such scenarios(as done in SDK-R) since it has the
     * expected pageReference values, the View component currently cannot handle this.
     * The resolution lies in transferring this responsibility to the Reference component, eliminating the need for this code when Reference
     * component is able to handle it.
     */
    if (!this.configProps$.visibility && this.pConn$.getPageReference().length > 'caseInfo.content'.length) {
      this.visibility$ = evaluateVisibility(this.pConn$);
    }

    // was:  this.arChildren$ = this.pConn$.getChildren() as Array<any>;

    // debug
    // let  kidList: string = "";
    // for (let i in this.arChildren$) {
    //   kidList = kidList.concat(this.arChildren$[i].getPConnect().getComponentName()).concat(",");
    // }
    // console.log("-->view update: " + this.angularPConnect.getComponentID(this) + ", template: " + this.templateName$ + ", kids: " + kidList);
  }

  // JA - adapting additionalProps from Nebula/Constellation version which uses static methods
  //    on the component classes stored in PComponents (that Angular doesn't have)...
  additionalProps(state: any, getPConnect: any) {
    let propObj = {};

    // We already have the template name in this.templateName$
    if (this.templateName$ !== '') {
      let allFields = {};

      // These uses are adapted from Nebula/Constellation CaseSummary.additionalProps
      switch (this.templateName$) {
        case 'CaseSummary':
          allFields = getAllFields(getPConnect);
          // eslint-disable-next-line no-case-declarations
          const unresFields = {
            primaryFields: allFields[0],
            secondaryFields: allFields[1]
          };
          propObj = getPConnect.resolveConfigProps(unresFields);
          break;

        case 'Details':
          allFields = getAllFields(getPConnect);
          propObj = { fields: allFields[0] };
          break;
        default:
          break;
      }
    }

    return propObj;
  }

  ngOnDestroy(): void {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }
}
