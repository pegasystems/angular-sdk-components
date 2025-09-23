import { Component, OnInit, Input, forwardRef, OnDestroy, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { ReferenceComponent } from '../../infra/reference/reference.component';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { Utils } from '../../../_helpers/utils';

interface CaseSummaryProps {
  // If any, enter additional props that only exist on this component
  status?: string;
  showStatus?: boolean;
  template?: string;
  readOnly?: boolean;
}

@Component({
  selector: 'app-case-summary',
  templateUrl: './case-summary.component.html',
  styleUrls: ['./case-summary.component.scss'],
  imports: [forwardRef(() => ComponentMapperComponent)]
})
export class CaseSummaryComponent implements OnInit, OnDestroy, OnChanges {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  angularPConnectData: AngularPConnectData = {};
  configProps$: CaseSummaryProps;

  arChildren$: any[];

  status$?: string;
  bShowStatus$?: boolean;
  primaryFields$: any[] = [];
  secondaryFields$: any[] = [];

  constructor(
    private angularPConnect: AngularPConnectService,
    private utils: Utils
  ) {}

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);

    this.initComponent();
  }

  ngOnDestroy(): void {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  initComponent() {
    // dereference the View in case the incoming pConn$ is a 'reference'
    this.pConn$ = ReferenceComponent.normalizePConn(this.pConn$);

    // Then, continue on with other initialization

    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as CaseSummaryProps;
    this.arChildren$ = this.pConn$.getChildren();

    this.generatePrimaryAndSecondaryFields();

    this.status$ = this.configProps$.status;
    this.bShowStatus$ = this.configProps$.showStatus;
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
    this.generatePrimaryAndSecondaryFields();
  }

  ngOnChanges() {
    this.initComponent();
  }

  generatePrimaryAndSecondaryFields() {
    this.primaryFields$ = [];
    this.secondaryFields$ = [];

    for (const oField of this.arChildren$[0].getPConnect().getChildren()) {
      const kid = oField.getPConnect();
      this.primaryFields$.push(kid.resolveConfigProps(kid.getRawMetadata()));
    }

    const secondarySummaryFields = this.prepareCaseSummaryData(this.arChildren$[1].getPConnect());
    const secondaryChildren = this.arChildren$[1].getPConnect().getChildren();
    secondaryChildren.forEach((oField, index) => {
      const kid = oField.getPConnect();
      const displayLabel = secondarySummaryFields[index].value.getPConnect().getConfigProps().label;
      this.secondaryFields$.push({ ...kid.resolveConfigProps(kid.getRawMetadata()), kid, displayLabel });
    });
  }

  prepareCaseSummaryData(summaryFieldChildren) {
    const convertChildrenToSummaryData = kid => {
      return kid?.map((childItem, index) => {
        const childMeta = childItem.getPConnect().meta;
        const caseSummaryComponentObject = this.utils.prepareComponentInCaseSummary(childMeta, childItem.getPConnect);
        caseSummaryComponentObject.id = index + 1;
        return caseSummaryComponentObject;
      });
    };
    return summaryFieldChildren ? convertChildrenToSummaryData(summaryFieldChildren?.getChildren()) : undefined;
  }
}
