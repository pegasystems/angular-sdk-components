import { Component, OnInit, Input, forwardRef, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { publicConstants } from '@pega/pcore-pconnect-typedefs/constants';
import { ReferenceComponent } from '../../infra/reference/reference.component';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';

/**
 * WARNING:  It is not expected that this file should be modified.  It is part of infrastructure code that works with
 * Redux and creation/update of Redux containers and PConnect.  Modifying this code could have undesireable results and
 * is totally at your own risk.
 */

@Component({
  selector: 'app-defer-load',
  templateUrl: './defer-load.component.html',
  styleUrls: ['./defer-load.component.scss'],
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class DeferLoadComponent implements OnInit, OnDestroy, OnChanges {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$;
  @Input() name;

  childComponentPConnect: typeof PConnect;
  bShowDefer$ = false;

  angularPConnectData: AngularPConnectData = {};
  constants: typeof publicConstants;
  currentLoadedAssignment = '';
  isContainerPreview: boolean;
  loadViewCaseID: any;
  resourceType: any;
  deferLoadId: any;
  containerName: any;
  CASE: any;
  PAGE: any;
  DATA: any;
  lastUpdateCaseTime;
  constructor(private angularPConnect: AngularPConnectService) {
    this.constants = PCore.getConstants();
  }

  ngOnInit(): void {
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    // The below call is causing an error while creating/opening a case, hence commenting it out
    this.updateSelf();
  }

  ngOnDestroy(): void {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  onStateChange() {
    // Should always check the bridge to see if the component should
    // update itself (re-render)
    const theRequestedAssignment = this.pConn$.getValue(PCore.getConstants().CASE_INFO.ASSIGNMENT_LABEL);
    const lastUpdateCaseTime = this.pConn$.getValue('caseInfo.lastUpdateTime');
    if (theRequestedAssignment !== this.currentLoadedAssignment || (lastUpdateCaseTime && lastUpdateCaseTime !== this.lastUpdateCaseTime)) {
      this.currentLoadedAssignment = theRequestedAssignment;
      this.lastUpdateCaseTime = lastUpdateCaseTime;
      this.updateSelf();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!Object.values(changes).every(val => val.firstChange === true)) {
      this.updateSelf();
    }
  }

  updateSelf() {
    this.loadViewCaseID = this.pConn$.getValue(this.constants.PZINSKEY) || this.pConn$.getValue(this.constants.CASE_INFO.CASE_INFO_ID);
    let containerItemData;
    const targetName = this.pConn$.getTarget();
    if (targetName) {
      this.containerName = PCore.getContainerUtils().getActiveContainerItemName(targetName);
      containerItemData = PCore.getContainerUtils().getContainerItemData(targetName, this.containerName);
    }
    const { CASE, PAGE, DATA } = this.constants.RESOURCE_TYPES;
    this.CASE = CASE;
    this.PAGE = PAGE;
    this.DATA = DATA;

    const { resourceType = this.CASE } = containerItemData || { resourceType: this.loadViewCaseID ? this.CASE : this.PAGE };
    this.resourceType = resourceType;
    this.isContainerPreview = /preview_[0-9]*/g.test(this.pConn$.getContextName());

    const theConfigProps = this.pConn$.getConfigProps();
    this.deferLoadId = theConfigProps.deferLoadId;
    this.name = this.name || theConfigProps.name;

    this.loadActiveTab();
  }

  getViewOptions = () => ({
    viewContext: this.resourceType,
    pageClass: this.loadViewCaseID ? '' : this.pConn$.getDataObject()?.pyPortal?.classID,
    container: this.isContainerPreview ? 'preview' : undefined,
    containerName: this.isContainerPreview ? 'preview' : undefined,
    updateData: this.isContainerPreview
  });

  onResponse(data) {
    if (this.deferLoadId) {
      PCore.getDeferLoadManager().start(
        this.name,
        this.pConn$.getCaseInfo().getKey(),
        this.pConn$.getPageReference().replace('caseInfo.content', ''),
        this.pConn$.getContextName(),
        this.deferLoadId
      );
    }

    if (data && !(data.type && data.type === 'error')) {
      const config = {
        meta: data,
        options: {
          context: this.pConn$.getContextName(),
          pageReference: this.pConn$.getPageReference()
        }
      };
      const configObject = PCore.createPConnect(config);
      configObject.getPConnect().setInheritedProp('displayMode', 'DISPLAY_ONLY');

      this.childComponentPConnect = ReferenceComponent.normalizePConn(configObject.getPConnect());

      if (this.deferLoadId) {
        PCore.getDeferLoadManager().stop(this.deferLoadId, this.pConn$.getContextName());
      }
    }
    // this.cdRef.detectChanges();
  }

  loadActiveTab() {
    if (this.resourceType === this.DATA) {
      // Rendering defer loaded tabs in data context
      if (this.containerName) {
        const dataContext = PCore.getStoreValue('.dataContext', 'dataInfo', this.containerName);
        const dataContextParameters = PCore.getStoreValue('.dataContextParameters', 'dataInfo', this.containerName);

        this.pConn$
          .getActionsApi()
          .showData(this.name, dataContext, dataContextParameters, {
            skipSemanticUrl: true,
            // @ts-ignore - Object literal may only specify known properties, and 'isDeferLoaded' does not exist in type '{ containerName: string; skipSemanticUrl: boolean; }'
            isDeferLoaded: true
          })
          .then(data => {
            this.onResponse(data);
          });
      } else {
        console.error('Cannot load the defer loaded view without container information');
      }
    } else if (this.resourceType === this.PAGE) {
      // Rendering defer loaded tabs in case/ page context
      this.pConn$
        .getActionsApi()
        .loadView(encodeURI(this.loadViewCaseID), this.name, this.getViewOptions())
        .then(data => {
          this.onResponse(data);
        });
    } else {
      this.pConn$
        .getActionsApi()
        .refreshCaseView(encodeURI(this.loadViewCaseID), this.name, '')
        .then((data: any) => {
          this.onResponse(data.root);
        });
    }
  }
}
