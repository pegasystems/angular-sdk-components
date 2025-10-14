import { Component, OnInit, Input, Output, EventEmitter, NgZone, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import isEqual from 'fast-deep-equal';
import { AngularPConnectData, AngularPConnectService } from '../../../../_bridge/angular-pconnect';
import { ProgressSpinnerService } from '../../../../_messages/progress-spinner.service';
import { ComponentMapperComponent } from '../../../../_bridge/component-mapper/component-mapper.component';
import { getBanners } from '../../../../_helpers/case-utils';
import { ReferenceComponent } from '../../reference/reference.component';

/**
 * WARNING:  It is not expected that this file should be modified.  It is part of infrastructure code that works with
 * Redux and creation/update of Redux containers and PConnect.  Modifying this code could have undesireable results and
 * is totally at your own risk.
 */

@Component({
  selector: 'app-modal-view-container',
  templateUrl: './modal-view-container.component.html',
  styleUrls: ['./modal-view-container.component.scss'],
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class ModalViewContainerComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;

  // for when non modal
  @Output() modalVisibleChange = new EventEmitter<boolean>();

  // Used with AngularPConnect
  angularPConnectData: AngularPConnectData = {};

  arChildren$: any[];
  stateProps$: object;
  banners: any;
  templateName$: string;
  buildName$: string;
  context$: string;
  title$ = '';
  bShowModal$ = false;
  itemKey$: string;
  formGroup$: FormGroup;
  oCaseInfo: object = {};

  // for causing a change on assignment
  updateToken$ = 0;

  routingInfoRef: any = {};

  // created object is now a View with a Template
  //  Use its PConnect to render the CaseView; DON'T replace this.pConn$
  createdViewPConn$: any;

  bSubscribed = false;
  cancelPConn$?: typeof PConnect;
  bShowCancelAlert$ = false;
  bAlertState: boolean;
  localizedVal: Function;
  localeCategory = 'Data Object';
  isMultiRecord = false;
  actionsDialog = false;

  constructor(
    private angularPConnect: AngularPConnectService,
    private ngZone: NgZone,
    private psService: ProgressSpinnerService,
    private fb: FormBuilder
  ) {
    // create the formGroup
    this.formGroup$ = fb.group({ hideRequired: false });
  }

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);

    const baseContext = this.pConn$.getContextName();
    const acName = this.pConn$.getContainerName();

    // for now, in general this should be overridden by updateSelf(), and not be blank
    if (this.itemKey$ === '') {
      this.itemKey$ = baseContext.concat('/').concat(acName);
    }

    const containerMgr = this.pConn$.getContainerManager();

    containerMgr.initializeContainers({
      type: 'multiple'
    });

    // const { CONTAINER_TYPE, PUB_SUB_EVENTS } = PCore.getConstants();

    this.angularPConnect.shouldComponentUpdate(this);
    this.localizedVal = PCore.getLocaleUtils().getLocaleValue;
  }

  ngOnDestroy(): void {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }

    const { PUB_SUB_EVENTS } = PCore.getConstants();

    PCore.getPubSubUtils().unsubscribe(
      PUB_SUB_EVENTS.EVENT_SHOW_CANCEL_ALERT,
      PUB_SUB_EVENTS.EVENT_SHOW_CANCEL_ALERT /* Should be same unique string passed during subscription */
    );
    this.bSubscribed = false;
  }

  // Callback passed when subscribing to store change
  onStateChange() {
    // Should always check the bridge to see if the component should
    // update itself (re-render)
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);

    // ONLY call updateSelf when the component should update
    if (bUpdateSelf) {
      this.updateSelf();
    } else if (this.bShowModal$) {
      // right now onlu get one updated when initial diaplay.  So, once modal is up
      // let fall through and do a check with "compareCaseInfoIsDifferent" until fixed
      // this.updateSelf();
    }
  }

  // updateSelf
  updateSelf(): void {
    // routingInfo was added as component prop in populateAdditionalProps
    const routingInfo = this.angularPConnect.getComponentProp(this, 'routingInfo');
    this.routingInfoRef.current = routingInfo;

    let loadingInfo;
    try {
      // @ts-ignore - Property 'getLoadingStatus' is private and only accessible within class 'C11nEnv'
      loadingInfo = this.pConn$.getLoadingStatus();
    } catch (ex) {
      console.log(ex);
    }
    // const configProps = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());
    this.stateProps$ = this.pConn$.getStateProps();
    this.banners = this.getBanners();

    if (!loadingInfo) {
      // turn off spinner
      // this.psService.sendMessage(false);
    }

    if (routingInfo && !loadingInfo /* && this.bUpdate */) {
      const currentOrder = routingInfo.accessedOrder;

      if (undefined == currentOrder) {
        return;
      }

      const currentItems = routingInfo.items;

      const { key, latestItem } = this.getKeyAndLatestItem(routingInfo);

      if (currentOrder.length > 0) {
        if (currentItems[key] && currentItems[key].view && Object.keys(currentItems[key].view).length > 0) {
          const currentItem = currentItems[key];
          const rootView = currentItem.view;
          const { context } = rootView.config;
          const config: any = { meta: rootView };
          config.options = {
            context: currentItem.context,
            hasForm: true,
            pageReference: context || this.pConn$.getPageReference()
          };

          if (!this.bSubscribed) {
            this.bSubscribed = true;
            const { PUB_SUB_EVENTS } = PCore.getConstants();
            PCore.getPubSubUtils().subscribe(
              PUB_SUB_EVENTS.EVENT_SHOW_CANCEL_ALERT,
              payload => {
                this.showAlert(payload);
              },
              PUB_SUB_EVENTS.EVENT_SHOW_CANCEL_ALERT
            );
          }

          // let configObject = PCore.createPConnect(config);

          // THIS is where the ViewContainer creates a View
          // The config has meta.config.type = "view"
          this.createView(routingInfo, currentItem, latestItem, key);
        }
      } else {
        this.hideModal();
      }
    }
  }

  createView(routingInfo, currentItem, latestItem, key) {
    const configObject = this.getConfigObject(currentItem, null, false);
    const newComp = configObject?.getPConnect();
    // const newCompName = newComp.getComponentName();
    const caseInfo = newComp && newComp.getDataObject() && newComp.getDataObject().caseInfo ? newComp.getDataObject().caseInfo : null;
    // The metadata for pyDetails changed such that the "template": "CaseView"
    //  is no longer a child of the created View but is in the created View's
    //  config. So, we DON'T want to replace this.pConn$ since the created
    //  component is a View (and not a ViewContainer). We now look for the
    //  "template" type directly in the created component (newComp) and NOT
    //  as a child of the newly created component.
    // console.log(`---> ModalViewContainer created new ${newCompName}`);

    // Use the newly created component (View) info but DO NOT replace
    //  this ModalViewContainer's pConn$, etc.
    //  Note that we're now using the newly created View's PConnect in the
    //  ViewContainer HTML template to guide what's rendered similar to what
    //  the Nebula/Constellation return of React.Fragment does

    // right now need to check caseInfo for changes, to trigger redraw, not getting
    // changes from angularPconnect except for first draw
    if (newComp && caseInfo && this.compareCaseInfoIsDifferent(caseInfo)) {
      this.psService.sendMessage(false);

      this.ngZone.run(() => {
        this.createdViewPConn$ = newComp;
        const newConfigProps = newComp.getConfigProps();
        this.templateName$ = 'template' in newConfigProps ? (newConfigProps.template as string) : '';

        const { actionName } = latestItem;
        const theNewCaseInfo = newComp.getCaseInfo();
        // const caseName = theNewCaseInfo.getName();
        const ID = theNewCaseInfo.getBusinessID() || theNewCaseInfo.getID();

        const caseTypeName = theNewCaseInfo.getCaseTypeName();
        const isDataObject = routingInfo.items[latestItem.context].resourceType === PCore.getConstants().RESOURCE_TYPES.DATA;
        const dataObjectAction = routingInfo.items[latestItem.context].resourceStatus;
        this.isMultiRecord = routingInfo.items[latestItem.context].isMultiRecordData;
        this.context$ = latestItem.context;
        this.title$ =
          isDataObject || this.isMultiRecord
            ? this.getModalHeading(dataObjectAction)
            : this.determineModalHeaderByAction(
                actionName,
                caseTypeName,
                ID,
                `${theNewCaseInfo?.getClassName()}!CASE!${theNewCaseInfo.getName()}`.toUpperCase()
              );

        const bIsRefComponent = this.checkIfRefComponent(newComp);

        if (bIsRefComponent) {
          const newPConn = ReferenceComponent.normalizePConn(newComp);
          this.arChildren$ = ReferenceComponent.normalizePConnArray(newPConn.getChildren());
        } else {
          // update children with new view's children
          this.arChildren$ = newComp.getChildren();
        }

        this.bShowModal$ = true;

        // for when non modal
        this.modalVisibleChange.emit(this.bShowModal$);

        // save off itemKey to be used for finishAssignment, etc.
        this.itemKey$ = key;

        // cause a change for assignment
        this.updateToken$ = new Date().getTime();
      });
    }
  }

  hideModal() {
    if (this.bShowModal$) {
      // other code in Nebula/Constellation not needed currently, but if so later,
      // should put here
    }

    this.ngZone.run(() => {
      this.bShowModal$ = false;

      // for when non modal
      this.modalVisibleChange.emit(this.bShowModal$);

      this.oCaseInfo = {};
    });
  }

  getConfigObject(item, pConnect, isReverseCoexistence = false) {
    let config;
    if (isReverseCoexistence) {
      config = {
        options: {
          pageReference: pConnect?.getPageReference(),
          hasForm: true,
          containerName: pConnect?.getContainerName() || PCore.getConstants().MODAL
        }
      };
      return PCore.createPConnect(config);
    }
    if (item) {
      const { context, view, isBulkAction } = item;
      const target = PCore.getContainerUtils().getTargetFromContainerItemID(context);
      config = {
        meta: view,
        options: {
          context,
          pageReference: view.config.context || pConnect.getPageReference(),
          hasForm: true,
          ...(isBulkAction && { isBulkAction }),
          containerName: pConnect?.getContainerName() || PCore.getConstants().MODAL,
          target
        }
      };
      return PCore.createPConnect(config);
    }
    return null;
  }

  checkIfRefComponent(thePConn: any): boolean {
    let bReturn = false;
    if (thePConn && thePConn.getComponentName() == 'reference') {
      bReturn = true;
    }

    return bReturn;
  }

  onAlertState(bData: boolean) {
    this.bAlertState = bData;
    this.bShowCancelAlert$ = false;
    if (this.bAlertState) {
      this.hideModal();
    }
  }

  showAlert(payload) {
    const { latestItem } = this.getKeyAndLatestItem(this.routingInfoRef.current);
    const { isModalAction } = payload;

    /*
      If we are in create stage full page mode, created a new case and trying to click on cancel button
      it will show two alert dialogs which is not expected. Hence isModalAction flag to avoid that.
    */
    if (latestItem && isModalAction && !this.actionsDialog) {
      const configObject = this.getConfigObject(latestItem, this.pConn$);
      this.ngZone.run(() => {
        this.cancelPConn$ = configObject?.getPConnect();
        this.bShowCancelAlert$ = true;
      });
    }
  }

  hasContainerItems(routingInfo) {
    if (routingInfo) {
      const { accessedOrder, items } = routingInfo;
      return accessedOrder && accessedOrder.length > 0 && items;
    }
    return false;
  }

  getKeyAndLatestItem(routinginfo) {
    if (this.hasContainerItems(routinginfo)) {
      const { accessedOrder, items } = routinginfo;
      const key = accessedOrder[accessedOrder.length - 1];
      const latestItem = items[key];
      return { key, latestItem };
    }
    return {};
  }

  compareCaseInfoIsDifferent(oCurrentCaseInfo: object): boolean {
    let bRet = false;

    // fast-deep-equal version
    if (isEqual !== undefined) {
      bRet = !isEqual(this.oCaseInfo, oCurrentCaseInfo);
    } else {
      const sCurrnentCaseInfo = JSON.stringify(oCurrentCaseInfo);
      const sOldCaseInfo = JSON.stringify(this.oCaseInfo);
      // stringify compare version
      if (sCurrnentCaseInfo != sOldCaseInfo) {
        bRet = true;
      }
    }

    // if different, save off new case info
    if (bRet) {
      this.oCaseInfo = JSON.parse(JSON.stringify(oCurrentCaseInfo));
    }

    return bRet;
  }

  getBanners() {
    return getBanners({ target: this.itemKey$, ...this.stateProps$ });
  }

  getModalHeading(dataObjectAction) {
    return dataObjectAction === PCore.getConstants().RESOURCE_STATUS.CREATE
      ? this.localizedVal('Add Record', this.localeCategory)
      : this.localizedVal('Edit Record', this.localeCategory);
  }

  determineModalHeaderByAction(actionName, caseTypeName, ID, caseLocaleRef) {
    if (actionName) {
      return this.localizedVal(actionName, this.localeCategory);
    }
    return `${this.localizedVal('Create', this.localeCategory)} ${this.localizedVal(caseTypeName, undefined, caseLocaleRef)} (${ID})`;
  }

  closeActionsDialog = () => {
    this.actionsDialog = true;
    // this.ngZone.run(() => {
    this.bShowModal$ = false;

    // for when non modal
    this.modalVisibleChange.emit(this.bShowModal$);

    this.oCaseInfo = {};
    // });
  };
}
