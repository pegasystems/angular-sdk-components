import { Component, OnInit, Input, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { interval } from 'rxjs';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { prepareCaseSummaryData } from '../utils';

interface SelfServiceCaseViewProps {
  // If any, enter additional props that only exist on this component
  icon: string;
  subheader: string;
  header: string;
  showCaseLifecycle: any;
  showSummaryRegion: any;
  showUtilitiesRegion: any;
  showCaseActions: any;
  caseClass: any;
}

@Component({
  selector: 'app-self-service-case-view',
  templateUrl: './self-service-case-view.component.html',
  styleUrls: ['./self-service-case-view.component.scss'],
  providers: [Utils],
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatMenuModule, forwardRef(() => ComponentMapperComponent)]
})
export class SelfServiceCaseViewComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  // Used with AngularPConnect
  angularPConnectData: AngularPConnectData = {};
  configProps$: SelfServiceCaseViewProps;

  arChildren$: any[];

  heading$ = '';
  id$ = '';
  status$ = '';

  arAvailableActions$: any[] = [];
  arAvailabeProcesses$: any[] = [];

  caseSummaryPConn$: any;
  currentCaseID = '';
  editAction: boolean;
  bHasNewAttachments = false;
  localizedVal: any;
  localeCategory = 'CaseView';
  localeKey: any;
  showCaseLifecycle: boolean;
  showSummaryRegion: boolean;
  showUtilitiesRegion: boolean;
  showCaseActions: boolean;
  utilityRegion: any;
  primarySummaryFields: any;
  secondarySummaryFields: any;

  constructor(
    private angularPConnect: AngularPConnectService,
    private utils: Utils
  ) {}

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    this.checkAndUpdate();
    this.localizedVal = PCore.getLocaleUtils().getLocaleValue;
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
    // Should always check the bridge to see if the component should update itself (re-render)
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);

    // ONLY call updateSelf when the component should update
    //    AND removing the "gate" that was put there since shouldComponentUpdate
    //      should be the real "gate"
    if (bUpdateSelf) {
      // generally, don't want to refresh everything when data changes in caseView, it is usually the
      // case summary.  But check if the case ID changes, this means a different case and we should
      // update all.
      if (this.hasCaseIDChanged()) {
        this.fullUpdate();

        // update okToInitFlowContainer, because case view was drawn, flow container will need to be init
        // to match Nebula/Constellation
        sessionStorage.setItem('okToInitFlowContainer', 'true');
      } else {
        this.updateHeaderAndSummary();
      }
    }
  }

  hasCaseIDChanged(): boolean {
    if (this.currentCaseID !== this.pConn$.getDataObject().caseInfo.ID) {
      this.currentCaseID = this.pConn$.getDataObject().caseInfo.ID;
      return true;
    }
    return false;
  }

  updateHeaderAndSummary() {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as SelfServiceCaseViewProps;
    const hasNewAttachments = this.pConn$.getDataObject().caseInfo?.hasNewAttachments;

    if (hasNewAttachments !== this.bHasNewAttachments) {
      this.bHasNewAttachments = hasNewAttachments;
      if (this.bHasNewAttachments) {
        PCore.getPubSubUtils().publish(PCore.getEvents().getCaseEvent().CASE_ATTACHMENTS_UPDATED_FROM_CASEVIEW, true);
      }
    }

    const kids = this.pConn$.getChildren() as any[];
    for (const kid of kids) {
      const meta = kid.getPConnect().getRawMetadata();
      if (meta.type.toLowerCase() == 'region' && meta.name.toLowerCase() == 'summary') {
        this.caseSummaryPConn$ = kid.getPConnect().getChildren()[0].getPConnect();
      }
    }

    // have to put in a timeout, otherwise get an angular change event error
    const timer = interval(100).subscribe(() => {
      timer.unsubscribe();

      this.heading$ = PCore.getLocaleUtils().getLocaleValue(this.configProps$.header, '', this.localeKey);
      this.id$ = this.configProps$.subheader;
      this.status$ = this.pConn$.getValue('.pyStatusWork');
    });
  }

  fullUpdate() {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as SelfServiceCaseViewProps;
    this.localeKey = this.pConn$?.getCaseLocaleReference();
    this.updateHeaderAndSummary();

    this.arChildren$ = this.pConn$.getChildren() as any[];

    const caseInfo = this.pConn$.getDataObject().caseInfo;
    this.currentCaseID = caseInfo.ID;
    this.arAvailableActions$ = caseInfo?.availableActions ? caseInfo.availableActions : [];
    this.editAction = this.arAvailableActions$.find(action => action.ID === 'pyUpdateCaseDetails');
    this.arAvailabeProcesses$ = caseInfo?.availableProcesses ? caseInfo.availableProcesses : [];

    const { showCaseLifecycle = true, showSummaryRegion = true, showUtilitiesRegion = true, showCaseActions = true, caseClass } = this.configProps$;
    this.showCaseLifecycle = this.utils.getBooleanValue(showCaseLifecycle);
    this.showSummaryRegion = this.utils.getBooleanValue(showSummaryRegion);
    this.showUtilitiesRegion = this.utils.getBooleanValue(showUtilitiesRegion);
    this.showCaseActions = this.utils.getBooleanValue(showCaseActions);
    const isObjectType: boolean = (PCore.getCaseUtils() as any).isObjectCaseType(caseClass);
    this.utilityRegion = isObjectType ? this.filterUtilities(this.arChildren$[2]) : this.filterUtilities(this.arChildren$[4]);
    if (this.showSummaryRegion) {
      const { primarySummaryFields, secondarySummaryFields } = prepareCaseSummaryData(
        this.arChildren$[0],
        (config: any) => config?.availableInChannel?.selfService === true
      );
      this.primarySummaryFields = primarySummaryFields;
      this.secondarySummaryFields = secondarySummaryFields;
    }
  }

  filterUtilities(utils) {
    let utilsMeta;
    const pConnect = utils.getPConnect();
    utilsMeta = pConnect.getRawMetadata?.();
    if (!utilsMeta?.children?.length) return;
    utilsMeta = {
      ...utilsMeta,
      children: utilsMeta.children.filter((child: any) => child.config?.availableInChannel?.selfService === true)
    };
    return utilsMeta.children?.length ? pConnect.createComponent(utilsMeta) : undefined;
  }

  isUtilitiesRegionNotEmpty() {
    if (this.utilityRegion && this.utilityRegion.getPConnect()?.getChildren()?.length > 0) {
      return this.utilityRegion
        .getPConnect()
        .getChildren()
        .some((prop: { getPConnect: () => any }) => prop.getPConnect().getConfigProps().visibility !== false);
    }
    return false;
  }

  updateSelf() {
    this.fullUpdate();
  }

  _menuActionClick(data) {
    const actionsAPI = this.pConn$.getActionsApi();
    const openLocalAction = actionsAPI.openLocalAction.bind(actionsAPI);

    openLocalAction(data.ID, { ...data, containerName: 'modal', type: 'express' });
  }

  _menuProcessClick(data) {
    const actionsAPI = this.pConn$.getActionsApi();
    const openProcessAction = actionsAPI.openProcessAction.bind(actionsAPI);

    openProcessAction(data.ID, { ...data });
  }
}
