import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReferenceComponent } from '../../infra/reference/reference.component';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

/**
 * WARNING:  It is not expected that this file should be modified.  It is part of infrastructure code that works with
 * Redux and creation/update of Redux containers and PConnect.  Modifying this code could have undesireable results and
 * is totally at your own risk.
 */

@Component({
  selector: 'app-defer-load',
  templateUrl: './defer-load.component.html',
  styleUrls: ['./defer-load.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class DeferLoadComponent implements OnInit {
  @Input() pConn$: any;
  @Input() loadData$: any;
  @Input() name;

  PCore$: any;

  componentName$: string;
  loadedPConn$: any;
  bShowDefer$: boolean = false;

  angularPConnectData: any = {};
  constants: any;
  currentLoadedAssignment = '';
  isContainerPreview: boolean;
  loadViewCaseID: any;
  resourceType: any;
  deferLoadId: any;
  containerName: any;
  CASE: any;
  PAGE: any;
  DATA: any;
  constructor() {}

  ngOnInit(): void {
    if (!this.PCore$) {
      this.PCore$ = window.PCore;
    }
    this.getData();
    this.loadActiveTab();
  }

  getData() {
    const theRequestedAssignment = this.pConn$.getValue(this.PCore$.getConstants().CASE_INFO.ASSIGNMENT_LABEL);
    if (theRequestedAssignment !== this.currentLoadedAssignment) {
      // console.log(`DeferLoad: currentLoadedAssignment about to change from ${currentLoadedAssignment} to ${theRequestedAssignment}`);
      this.currentLoadedAssignment = theRequestedAssignment;
    }
    this.constants = this.PCore$.getConstants();
    const { CASE, PAGE, DATA } = this.constants.RESOURCE_TYPES;
    this.CASE = CASE;
    this.PAGE = PAGE;
    this.DATA = DATA;
    this.loadViewCaseID = this.pConn$.getValue(this.constants.PZINSKEY) || this.pConn$.getValue(this.constants.CASE_INFO.CASE_INFO_ID);
    let containerItemData;
    const targetName = this.pConn$.getTarget();
    if (targetName) {
      this.containerName = this.PCore$.getContainerUtils().getActiveContainerItemName(targetName);
      containerItemData = this.PCore$.getContainerUtils().getContainerItemData(targetName, this.containerName);
    }
    const { resourceType = CASE } = containerItemData || { resourceType: this.loadViewCaseID ? CASE : PAGE };
    this.resourceType = resourceType;
    this.isContainerPreview = /preview_[0-9]*/g.test(this.pConn$.getContextName());
    const theConfigProps = this.pConn$.getConfigProps();
    this.deferLoadId = theConfigProps.deferLoadId;
    this.name = this.name || theConfigProps.name;
  }

  ngOnChanges() {
    if (!this.PCore$) {
      this.PCore$ = window.PCore;
    }

    this.loadActiveTab();
  }

  getViewOptions = () => ({
    viewContext: this.resourceType,
    pageClass: this.loadViewCaseID ? '' : this.pConn$.getDataObject().pyPortal.classID,
    container: this.isContainerPreview ? 'preview' : null,
    containerName: this.isContainerPreview ? 'preview' : null,
    updateData: this.isContainerPreview
  });

  onResponse(data) {
    if (this.deferLoadId) {
      this.PCore$.getDeferLoadManager().start(
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
      const configObject = this.PCore$.createPConnect(config);
      configObject.getPConnect().setInheritedProp('displayMode', 'LABELS_LEFT');
      this.loadedPConn$ = ReferenceComponent.normalizePConn(configObject.getPConnect());
      this.componentName$ = this.loadedPConn$.getComponentName();
      if (this.deferLoadId) {
        this.PCore$.getDeferLoadManager().stop(this.deferLoadId, this.pConn$.getContextName());
      }
    }
  }

  loadActiveTab() {
    if (this.resourceType === this.DATA) {
      // Rendering defer loaded tabs in data context
      if (this.containerName) {
        const dataContext = this.PCore$.getStoreValue('.dataContext', 'dataInfo', this.containerName);
        const dataContextParameters = this.PCore$.getStoreValue('.dataContextParameters', 'dataInfo', this.containerName);

        this.pConn$
          .getActionsApi()
          .showData(this.name, dataContext, dataContextParameters, {
            skipSemanticUrl: true,
            isDeferLoaded: true
          })
          .then((data) => {
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
        .then((data) => {
          this.onResponse(data);
        });
    } else {
      this.pConn$
        .getActionsApi()
        .refreshCaseView(encodeURI(this.loadViewCaseID), this.name)
        .then((data) => {
          this.onResponse(data.root);
        });
    }
  }
}
