import { Component, OnInit, Input, ChangeDetectorRef, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { interval } from 'rxjs';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

interface CaseViewProps {
  // If any, enter additional props that only exist on this component
  icon: string;
  subheader: string;
  header: string;
}

@Component({
  selector: 'app-case-view',
  templateUrl: './case-view.component.html',
  styleUrls: ['./case-view.component.scss'],
  providers: [Utils],
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatMenuModule, forwardRef(() => ComponentMapperComponent)]
})
export class CaseViewComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;
  @Input() displayOnlyFA$: boolean;

  // Used with AngularPConnect
  angularPConnectData: AngularPConnectData = {};
  configProps$: CaseViewProps;

  arChildren$: any[];

  heading$ = '';
  id$ = '';
  status$ = '';
  caseTabs$: any[] = [];
  svgCase$: string;
  tabData$: any;

  mainTabs: any;
  mainTabData: any;

  arAvailableActions$: any[] = [];
  arAvailabeProcesses$: any[] = [];

  caseSummaryPConn$: any;
  currentCaseID = '';
  editAction: boolean;
  bHasNewAttachments = false;
  localizedVal: any;
  localeCategory = 'CaseView';
  localeKey: string;

  constructor(
    private cdRef: ChangeDetectorRef,
    private angularPConnect: AngularPConnectService,
    private utils: Utils
  ) {}

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);

    // this.updateSelf();
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
    // @ts-ignore - parameter “contextName” for getDataObject method should be optional
    if (this.currentCaseID !== this.pConn$.getDataObject().caseInfo.ID) {
      // @ts-ignore - parameter “contextName” for getDataObject method should be optional
      this.currentCaseID = this.pConn$.getDataObject().caseInfo.ID;
      return true;
    }
    return false;
  }

  updateHeaderAndSummary() {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as CaseViewProps;
    // @ts-ignore - parameter “contextName” for getDataObject method should be optional
    const hasNewAttachments = this.pConn$.getDataObject().caseInfo?.hasNewAttachments;

    if (hasNewAttachments !== this.bHasNewAttachments) {
      this.bHasNewAttachments = hasNewAttachments;
      if (this.bHasNewAttachments) {
        // @ts-ignore - Argument of type 'boolean' is not assignable to parameter of type 'object'
        PCore.getPubSubUtils().publish((PCore.getEvents().getCaseEvent() as any).CASE_ATTACHMENTS_UPDATED_FROM_CASEVIEW, true);
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
      // @ts-ignore - second parameter pageReference for getValue method should be optional
      this.status$ = this.pConn$.getValue('.pyStatusWork');
    });
  }

  fullUpdate() {
    this.caseTabs$ = [];
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as CaseViewProps;
    // let caseTypeID = this.configProps$.ruleClass;
    // let caseTypeName = this.configProps$.header;
    // this.localeKey = `${caseTypeID}!CASE!${caseTypeName}`.toUpperCase();
    this.localeKey = `${this.pConn$.getCaseInfo().getClassName()}!CASE!${this.pConn$.getCaseInfo().getName()}`.toUpperCase();
    this.updateHeaderAndSummary();

    this.arChildren$ = this.pConn$.getChildren() as any[];

    // @ts-ignore - parameter “contextName” for getDataObject method should be optional
    const caseInfo = this.pConn$.getDataObject().caseInfo;
    this.currentCaseID = caseInfo.ID;
    this.arAvailableActions$ = caseInfo?.availableActions ? caseInfo.availableActions : [];
    this.editAction = this.arAvailableActions$.find((action) => action.ID === 'pyUpdateCaseDetails');
    this.arAvailabeProcesses$ = caseInfo?.availableProcesses ? caseInfo.availableProcesses : [];

    this.svgCase$ = this.utils.getImageSrc(this.configProps$.icon, this.utils.getSDKStaticContentUrl());

    // this.utils.consoleKidDump(this.pConn$);

    if (!this.displayOnlyFA$) {
      for (const kid of this.arChildren$) {
        const kidPConn = kid.getPConnect();
        if (kidPConn.getRawMetadata().name == 'Tabs') {
          this.mainTabs = kid;
          this.mainTabData = this.mainTabs.getPConnect().getChildren();
        }
      }

      this.mainTabs
        .getPConnect()
        .getChildren()
        ?.forEach((child, i) => {
          const config = child.getPConnect().resolveConfigProps(child.getPConnect().getRawMetadata()).config;
          let { label } = config;
          const { inheritedProps, visibility } = config;
          // For some tabs, "label" property is not avaialable in theTabCompConfig, so will get them from inheritedProps
          if (!label) {
            inheritedProps.forEach((inheritedProp: any) => {
              if (inheritedProp.prop === 'label') {
                label = inheritedProp.value;
              }
            });
          }
          // We'll display the tabs when either visibility property doesn't exist or is true(if exists)
          if (visibility === undefined || visibility === true) {
            this.caseTabs$.push({ name: label, id: i });
            // To make first visible tab display at the beginning
            if (!this.tabData$) {
              this.tabData$ = { type: 'DeferLoad', config: child.getPConnect().getRawMetadata().config };
            }
          }
        });
    }
  }

  updateSelf() {
    this.fullUpdate();
  }

  onTabClick(tab: any) {
    this.tabData$ = this.mainTabData[tab].getPConnect().getRawMetadata();
    this.cdRef.detectChanges();
  }

  _editClick() {
    const editAction = this.arAvailableActions$.find((action) => action.ID === 'pyUpdateCaseDetails');
    const actionsAPI = this.pConn$.getActionsApi();
    const openLocalAction = actionsAPI.openLocalAction.bind(actionsAPI);

    openLocalAction(editAction.ID, { ...editAction });
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
