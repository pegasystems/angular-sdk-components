import { ChangeDetectorRef, Component, OnInit, Input, Output, EventEmitter, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AngularPConnectData, AngularPConnectService } from '../../../../_bridge/angular-pconnect';
import { ProgressSpinnerService } from '../../../../_messages/progress-spinner.service';
import { ComponentMapperComponent } from '../../../../_bridge/component-mapper/component-mapper.component';
import { getBanners } from '../../../../_helpers/case-utils';

/**
 * WARNING: This file is part of the infrastructure component responsible for working with Redux and managing the creation and update of Redux containers and PConnect.
 * You may override Material components within this component if needed, but do not modify any container-related logic. Changing this logic can lead to unexpected behavior.
 */

// One entry per open modal — supports stacking (e.g. "Create new" opened from within another modal)
interface ModalEntry {
  key: string;
  title: string;
  createdViewPConn$: any;
  arChildren$: any[];
  isMultiRecordData: boolean;
  isDataObjectModal: boolean;
  dataRecordKeys: string;
  dataObjectActionID: string;
  dataObjectAction: string;
  dataObjectClassId: string;
  context: string;
  updateToken: number;
}

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

  stateProps$: object;
  formGroup$: FormGroup;

  routingInfoRef: any = {};

  // Stack of open modals — supports one modal opening another (e.g. "Create new" from within a modal).
  // Keyed the same as PCore's routingInfo.items so open/update/close can be derived from accessedOrder.
  modalStack: ModalEntry[] = [];
  private modalCollection: Record<string, object> = {};

  bSubscribed = false;
  cancelPConn$?: typeof PConnect;
  cancelHideDelete$: boolean;
  cancelIsDataObject$: boolean;
  cancelSkipReleaseLockRequest$: any;
  bShowCancelAlert$ = false;
  bAlertState: boolean;
  localizedVal: Function;
  localeCategory = 'Data Object';
  actionsDialog = false;

  constructor(
    private angularPConnect: AngularPConnectService,
    private cdRef: ChangeDetectorRef,
    private psService: ProgressSpinnerService,
    private fb: FormBuilder
  ) {
    // create the formGroup
    this.formGroup$ = fb.group({ hideRequired: false });
  }

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);

    const containerMgr = this.pConn$.getContainerManager();

    containerMgr.initializeContainers({
      type: 'multiple'
    });

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
    if (this.angularPConnect.shouldComponentUpdate(this)) {
      this.updateSelf();
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
    this.stateProps$ = this.pConn$.getStateProps();

    if (!routingInfo || loadingInfo) {
      return;
    }

    const { accessedOrder, type } = routingInfo;

    if (undefined == accessedOrder) {
      return;
    }

    const { MULTIPLE } = PCore.getConstants().CONTAINER_TYPE;
    const { key, latestItem } = this.getKeyAndLatestItem(routingInfo);

    if (latestItem && type === MULTIPLE && (this.isOpenModalAction(accessedOrder) || this.isUpdateModalAction(accessedOrder))) {
      const currentItem = routingInfo.items[key];
      if (currentItem?.view && Object.keys(currentItem.view).length > 0) {
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

        this.upsertModal(routingInfo, latestItem, key, accessedOrder);
      }
    } else if (this.isCloseModalAction(accessedOrder)) {
      this.handleModalClose(accessedOrder);
    }
  }

  // Builds/refreshes one modal-stack entry and pushes or updates it in-place
  upsertModal(routingInfo, latestItem, key, accessedOrder) {
    const entry = this.buildModalEntry(routingInfo, latestItem, key);

    if (this.isUpdateModalAction(accessedOrder)) {
      this.modalStack = this.modalStack.map(modal => (modal.key === key ? entry : modal));
    } else if (this.isOpenModalAction(accessedOrder)) {
      this.handleModalOpen(key);
      this.modalStack = [...this.modalStack, entry];
    }

    this.psService.sendMessage(false);
    this.modalVisibleChange.emit(this.modalStack.length > 0);
    this.cdRef.markForCheck();
  }

  buildModalEntry(routingInfo, latestItem, key): ModalEntry {
    const configObject = this.getConfigObject(latestItem, null, false);
    // latestItem is only reached once its view metadata is populated (see updateSelf), so the
    // created component is always present here — same assumption the old single-modal code made.
    const newComp = configObject!.getPConnect();

    const { actionName } = latestItem;
    const theCaseInfo = newComp.getCaseInfo();
    const ID = theCaseInfo.getBusinessID() || theCaseInfo.getID();
    const caseTypeName = theCaseInfo.getCaseTypeName();

    const isDataObject = routingInfo.items[latestItem.context].resourceType === PCore.getConstants().RESOURCE_TYPES.DATA;
    const dataObjectAction = routingInfo.items[latestItem.context].resourceStatus;
    const isMultiRecordData = routingInfo.items[latestItem.context].isMultiRecordData;

    const title = this.getHeadingValue(
      latestItem,
      isMultiRecordData,
      isDataObject,
      actionName,
      dataObjectAction,
      caseTypeName,
      ID,
      newComp?.getCaseLocaleReference()
    );

    const bIsRefComponent = this.checkIfRefComponent(newComp);
    const arChildren$ = bIsRefComponent ? [newComp.getComponent()] : newComp.getChildren();

    return {
      key,
      title,
      createdViewPConn$: newComp,
      arChildren$,
      isMultiRecordData,
      isDataObjectModal: isDataObject && !isMultiRecordData,
      dataRecordKeys: latestItem.key || '',
      dataObjectActionID: routingInfo.items[latestItem.context].actionID || '',
      dataObjectAction: dataObjectAction || '',
      dataObjectClassId: newComp.getValue('.classID') || '',
      context: latestItem.context,
      updateToken: new Date().getTime()
    };
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
      // Discard confirmed — matches react-sdk: drop the whole stack rather than just the top entry
      this.modalCollection = {};
      this.modalStack = [];
      this.modalVisibleChange.emit(false);
      this.cdRef.markForCheck();
    }
  }

  showAlert(payload) {
    const { latestItem } = this.getKeyAndLatestItem(this.routingInfoRef.current);
    const { isModalAction, hideDelete, isDataObject, skipReleaseLockRequest } = payload;

    /*
      If we are in create stage full page mode, created a new case and trying to click on cancel button
      it will show two alert dialogs which is not expected. Hence isModalAction flag to avoid that.
    */
    if (latestItem && isModalAction && !this.actionsDialog) {
      const configObject = this.getConfigObject(latestItem, this.pConn$);
      this.cancelPConn$ = configObject?.getPConnect();
      this.cancelHideDelete$ = hideDelete;
      this.cancelIsDataObject$ = isDataObject;
      this.cancelSkipReleaseLockRequest$ = skipReleaseLockRequest;
      this.bShowCancelAlert$ = true;
      this.cdRef.markForCheck();
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

  // Open/update/close are derived purely from how the count of known modals compares to
  // routingInfo.accessedOrder — mirrors react-sdk's modal-stack fix so that closing one modal
  // (removing one entry from accessedOrder) can never be mistaken for closing all of them.
  isOpenModalAction(accessedOrder: string[]): boolean {
    return Object.keys(this.modalCollection).length < accessedOrder.length;
  }

  isUpdateModalAction(accessedOrder: string[]): boolean {
    return Object.keys(this.modalCollection).length === accessedOrder.length;
  }

  isCloseModalAction(accessedOrder: string[]): boolean {
    return Object.keys(this.modalCollection).length > accessedOrder.length;
  }

  handleModalOpen(key: string) {
    this.modalCollection = { ...this.modalCollection, [key]: {} };
  }

  handleModalClose(accessedOrder: string[]) {
    const closedModalKey = Object.keys(this.modalCollection).find(modalKey => !accessedOrder.includes(modalKey));

    if (closedModalKey) {
      const updatedModalCollection = { ...this.modalCollection };
      delete updatedModalCollection[closedModalKey];
      this.modalCollection = updatedModalCollection;

      this.modalStack = this.modalStack.filter(modal => modal.key !== closedModalKey);
      this.modalVisibleChange.emit(this.modalStack.length > 0);
      this.cdRef.markForCheck();
    }
  }

  // AssignmentComponent renders its own validation banner via BannerService; this covers server-side errors (e.g. httpMessages) that arrive at the container instead
  getBanners(itemKey: string) {
    return getBanners({ target: itemKey, ...this.stateProps$, httpMessages: this.angularPConnectData.httpMessages });
  }

  getModalHeading(dataObjectAction, actionName) {
    switch (dataObjectAction) {
      case PCore.getConstants().RESOURCE_STATUS.CREATE:
        return this.localizedVal('Add Record', this.localeCategory);
      case PCore.getConstants().RESOURCE_STATUS.OPEN_FLOW_ACTION:
        return this.localizedVal(actionName, this.localeCategory);
      default:
        return this.localizedVal('Edit Record', this.localeCategory);
    }
  }

  getHeadingValue(latestItem, isMultiRecordData, isDataObject, actionName, dataObjectAction, caseTypeName, ID, caseLocaleRef) {
    if (isMultiRecordData) {
      return latestItem.heading;
    }
    if (isDataObject) {
      if (actionName) {
        return this.localizedVal(actionName, this.localeCategory);
      }
      return this.getModalHeading(dataObjectAction, actionName);
    }
    return this.determineModalHeaderByAction(actionName, caseTypeName, ID, caseLocaleRef);
  }

  determineModalHeaderByAction(actionName, caseTypeName, ID, caseLocaleRef) {
    if (actionName) {
      return this.localizedVal(actionName, this.localeCategory);
    }
    return `${this.localizedVal('Create', this.localeCategory)} ${this.localizedVal(caseTypeName, undefined, caseLocaleRef)} (${ID})`;
  }

  // Closes one modal by key (bound per-instance in the template), or the topmost when omitted
  closeActionsDialog = (modalKey?: string) => {
    this.actionsDialog = true;

    this.modalStack = modalKey ? this.modalStack.filter(modal => modal.key !== modalKey) : this.modalStack.slice(0, -1);

    this.modalVisibleChange.emit(this.modalStack.length > 0);
    this.cdRef.markForCheck();
  };

  // Binds closeActionsDialog to a specific modal's key so closing one stacked modal never affects the others
  closeModalFor(modalKey: string) {
    return () => this.closeActionsDialog(modalKey);
  }

  trackByModalKey(index: number, modal: ModalEntry) {
    return modal.key;
  }
}
