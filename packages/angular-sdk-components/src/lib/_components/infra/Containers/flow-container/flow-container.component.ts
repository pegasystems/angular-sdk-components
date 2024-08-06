import { Component, OnInit, Input, ChangeDetectorRef, NgZone, forwardRef, OnDestroy, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { publicConstants } from '@pega/pcore-pconnect-typedefs/constants';
import { ProgressSpinnerService } from '../../../../_messages/progress-spinner.service';
import { ReferenceComponent } from '../../reference/reference.component';
import { Utils } from '../../../../_helpers/utils';
import { getToDoAssignments, showBanner } from './helpers';
import { ComponentMapperComponent } from '../../../../_bridge/component-mapper/component-mapper.component';
import { FlowContainerBaseComponent } from '../base-components/flow-container-base.component';

/**
 * WARNING:  It is not expected that this file should be modified.  It is part of infrastructure code that works with
 * Redux and creation/update of Redux containers and PConnect.  Modifying this code could have undesireable results and
 * is totally at your own risk.
 */

interface FlowContainerProps {
  // If any, enter additional props that only exist on this component
  children?: any[];
  name?: string;
  routingInfo?: any;
  pageMessages: any[];
}

@Component({
  selector: 'app-flow-container',
  templateUrl: './flow-container.component.html',
  styleUrls: ['./flow-container.component.scss'],
  providers: [Utils],
  standalone: true,
  imports: [CommonModule, MatCardModule, forwardRef(() => ComponentMapperComponent)]
})
export class FlowContainerComponent extends FlowContainerBaseComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;

  pCoreConstants: typeof publicConstants;
  configProps$: FlowContainerProps;

  formGroup$: FormGroup;
  arChildren$: any[];
  itemKey$ = '';
  containerName$: string;
  buildName$: string;

  // todo
  todo_showTodo$ = false;
  todo_caseInfoID$: string;
  todo_showTodoList$ = false;
  todo_datasource$: any;
  todo_headerText$ = 'To do';
  todo_type$: string;
  todo_context$: string;
  todo_pConn$: typeof PConnect;

  bHasCancel = false;

  // messages
  caseMessages$: string;
  bHasCaseMessages$ = false;
  checkSvg$: string;
  TODO: any;
  bShowConfirm = false;
  bShowBanner: boolean;
  confirm_pconn: any;
  localizedVal: any;
  localeCategory = 'Messages';
  localeReference: any;
  banners: any[];
  // itemKey: string = "";   // JA - this is what Nebula/Constellation uses to pass to finishAssignment, navigateToStep

  pConnectOfActiveContainerItem;

  constructor(
    injector: Injector,
    private cdRef: ChangeDetectorRef,
    private psService: ProgressSpinnerService,
    private fb: FormBuilder,
    private ngZone: NgZone,
    private utils: Utils
  ) {
    super(injector);
    // create the formGroup
    this.formGroup$ = this.fb.group({ hideRequired: false });
  }

  ngOnInit() {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);

    this.localizedVal = PCore.getLocaleUtils().getLocaleValue;
    const caseInfo = this.pConn$.getCaseInfo();
    this.localeReference = `${caseInfo?.getClassName()}!CASE!${caseInfo.getName()}`.toUpperCase();

    // Then, continue on with other initialization

    // get the PCore constants
    this.pCoreConstants = PCore.getConstants();
    const { TODO } = this.pCoreConstants;
    this.TODO = TODO;
    // with init, force children to be loaded of global pConn
    this.initComponent(true);

    this.initContainer();

    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL,
      () => {
        this.handleCancel();
      },
      'cancelAssignment'
    );

    PCore.getPubSubUtils().subscribe(
      'cancelPressed',
      () => {
        this.handleCancelPressed();
      },
      'cancelPressed'
    );
  }

  ngOnDestroy() {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }

    PCore.getPubSubUtils().unsubscribe(PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL, 'cancelAssignment');

    PCore.getPubSubUtils().unsubscribe('cancelPressed', 'cancelPressed');
  }

  handleCancel() {
    // cancel happened, so ok to initialize the flow container
    sessionStorage.setItem('okToInitFlowContainer', 'true');
  }

  handleCancelPressed() {
    this.bHasCancel = true;
  }

  // Callback passed when subscribing to store change
  onStateChange() {
    this.checkAndUpdate();
  }

  checkAndUpdate() {
    // Should always check the bridge to see if the component should update itself (re-render)
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);

    const pConn = this.pConnectOfActiveContainerItem || this.pConn$;
    const caseViewModeFromProps = this.angularPConnect.getComponentProp(this, 'caseViewMode');
    const caseViewModeFromRedux = pConn.getValue('context_data.caseViewMode', '');

    // ONLY call updateSelf when the component should update
    //    AND removing the "gate" that was put there since shouldComponentUpdate
    //      should be the real "gate"
    if (bUpdateSelf || caseViewModeFromProps !== caseViewModeFromRedux) {
      // don't want to redraw the flow container when there are page messages, because
      // the redraw causes us to loose the errors on the elements
      const completeProps = this.angularPConnect.getCurrentCompleteProps(this) as FlowContainerProps;
      if (!completeProps.pageMessages || completeProps.pageMessages.length == 0) {
        // with a cancel, need to timeout so todo will update correctly
        if (this.bHasCancel) {
          this.bHasCancel = false;
          setTimeout(() => {
            this.updateSelf();
          }, 500);
        } else {
          this.updateSelf();
        }
      } else {
        this.showPageMessages(completeProps);
      }
    }
  }

  showPageMessages(completeProps: FlowContainerProps) {
    this.ngZone.run(() => {
      const pageMessages = completeProps.pageMessages;
      this.banners = [{ messages: pageMessages?.map(msg => this.localizedVal(msg.message, 'Messages')), variant: 'urgent' }];
    });
  }

  getTodoVisibilty() {
    const caseViewMode = this.pConn$.getValue('context_data.caseViewMode');
    if (caseViewMode && caseViewMode === 'review') {
      const kid = this.pConn$.getChildren()[0];
      const todoKid = kid.getPConnect().getChildren()[0];

      this.todo_pConn$ = todoKid.getPConnect();

      return true;
    }

    return !(caseViewMode && caseViewMode === 'perform');
  }

  initContainer() {
    const containerMgr: any = this.pConn$.getContainerManager();
    const baseContext = this.pConn$.getContextName();
    const containerName = this.pConn$.getContainerName();
    const containerType = 'single';

    const flowContainerTarget = `${baseContext}/${containerName}`;
    const isContainerItemAvailable = PCore.getContainerUtils().getActiveContainerItemName(flowContainerTarget);

    // clear out since we are initializing
    sessionStorage.setItem('okToInitFlowContainer', 'false');

    if (!isContainerItemAvailable) {
      containerMgr.initializeContainers({
        type: containerType
      });

      /* remove commented out code when update React/WC
       *** instead of getting values here to pass to addContainerItem, we call the function below "addContainerItem"
       *** which comes from flow container helpers in Nebula
       */
      // containerMgr.addContainerItem({
      //   semanticURL: "",
      //   key: this.pConn$.getValue("key"),
      //   flowName: this.pConn$.getValue("flowName"),
      //   caseViewMode: "perform",
      //   data: this.pConn$.getDataObject(baseContext),
      //   containerType
      // });

      this.addContainerItem(this.pConn$);
    }
  }

  initComponent(bLoadChildren: boolean) {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as FlowContainerProps;
    this.showPageMessages(this.configProps$);

    // when true, update arChildren from pConn, otherwise, arChilren will be updated in updateSelf()
    if (bLoadChildren) {
      this.arChildren$ = this.pConn$.getChildren() as any[];
    }

    // const oData = this.pConn$.getDataObject();

    // const activeActionLabel: string = '';
    // const { getPConnect } = this.arChildren$[0].getPConnect();

    this.todo_showTodo$ = this.getTodoVisibilty();

    // create pointers to functions
    // const containerMgr = this.pConn$.getContainerManager();
    // const actionsAPI = this.pConn$.getActionsApi();
    const baseContext = this.pConn$.getContextName();
    const acName = this.pConn$.getContainerName();

    if (this.itemKey$ === '') {
      this.itemKey$ = baseContext.concat('/').concat(acName);
    }

    this.pConn$.isBoundToState();

    // inside
    // get fist kid, get the name and display
    // pass first kid to a view container, which will disperse it to a view which will use one column, two column, etc.
    const oWorkItem = this.arChildren$[0].getPConnect();
    // const oWorkMeta = oWorkItem.getRawMetadata();
    const oWorkData = oWorkItem.getDataObject();

    // this.containerName$ = oWorkMeta["name"];
    if (bLoadChildren && oWorkData) {
      this.containerName$ = this.localizedVal(this.getActiveViewLabel() || oWorkData.caseInfo.assignments[0].name, undefined, this.localeReference);
    }

    // turn off spinner
    this.psService.sendMessage(false);
  }

  hasAssignments() {
    let hasAssignments = false;
    const assignmentsList: any[] = this.pConn$.getValue(this.pCoreConstants.CASE_INFO.D_CASE_ASSIGNMENTS_RESULTS);
    // const thisOperator = PCore.getEnvironmentInfo().getOperatorIdentifier();
    // 8.7 includes assignments in Assignments List that may be assigned to
    //  a different operator. So, see if there are any assignments for
    //  the current operator
    const isEmbedded = window.location.href.includes('embedded');
    let bAssignmentsForThisOperator = false;

    if (isEmbedded) {
      const thisOperator = PCore.getEnvironmentInfo().getOperatorIdentifier();
      for (const assignment of assignmentsList) {
        if (assignment.assigneeInfo.ID === thisOperator) {
          bAssignmentsForThisOperator = true;
        }
      }
    } else {
      bAssignmentsForThisOperator = true;
    }

    // Bail if there is no assignmentsList
    if (!assignmentsList) {
      return hasAssignments;
    }

    const hasChildCaseAssignments = this.hasChildCaseAssignments();

    if (bAssignmentsForThisOperator || hasChildCaseAssignments || this.isCaseWideLocalAction()) {
      hasAssignments = true;
    }

    return hasAssignments;
  }

  isCaseWideLocalAction() {
    const actionID = this.pConn$.getValue(this.pCoreConstants.CASE_INFO.ACTIVE_ACTION_ID);
    const caseActions = this.pConn$.getValue(this.pCoreConstants.CASE_INFO.AVAILABLEACTIONS) as any[];
    let bCaseWideAction = false;
    if (caseActions && actionID) {
      const actionObj = caseActions.find(caseAction => caseAction.ID === actionID);
      if (actionObj) {
        bCaseWideAction = actionObj.type === 'Case';
      }
    }
    return bCaseWideAction;
  }

  hasChildCaseAssignments() {
    const childCases = this.pConn$.getValue(this.pCoreConstants.CASE_INFO.CHILD_ASSIGNMENTS);

    return childCases && childCases.length > 0;
  }

  getActiveViewLabel() {
    let activeActionLabel = '';

    const { CASE_INFO: CASE_CONSTS } = PCore.getConstants();

    const caseActions = this.pConn$.getValue(CASE_CONSTS.CASE_INFO_ACTIONS) as any[];
    const activeActionID = this.pConn$.getValue(CASE_CONSTS.ACTIVE_ACTION_ID);
    const activeAction = caseActions?.find(action => action.ID === activeActionID);
    if (activeAction) {
      activeActionLabel = activeAction.name;
    }
    return activeActionLabel;
  }

  findCurrentIndicies(arStepperSteps: any[], arIndicies: number[], depth: number): number[] {
    let count = 0;
    arStepperSteps.forEach(step => {
      if (step.visited_status == 'current') {
        arIndicies[depth] = count;

        // add in
        step.step_status = '';
      } else if (step.visited_status == 'success') {
        count++;
        step.step_status = 'completed';
      } else {
        count++;
        step.step_status = '';
      }

      if (step.steps) {
        arIndicies = this.findCurrentIndicies(step.steps, arIndicies, depth + 1);
      }
    });

    return arIndicies;
  }

  // Called when bridge shouldComponentUpdate indicates that this component
  // should update itself (re-render)
  updateSelf() {
    // for now
    // const { getPConnect } = this.arChildren$[0].getPConnect();
    const localPConn = this.arChildren$[0].getPConnect();

    this.pConnectOfActiveContainerItem = this.getPConnectOfActiveContainerItem(this.pConn$) || this.pConn$;

    const caseViewMode = this.pConnectOfActiveContainerItem.getValue('context_data.caseViewMode');
    this.bShowBanner = showBanner(this.pConn$);

    if (caseViewMode && caseViewMode == 'review') {
      this.loadReviewPage(localPConn);

      // in Nebula/Constellation, when cancel is called, somehow the constructor for flowContainer is called which
      // does init/add of containers.  This mimics that
      if (sessionStorage.getItem('okToInitFlowContainer') == 'true') {
        this.initContainer();
      }
    } else if (caseViewMode && caseViewMode === 'perform') {
      // perform
      this.todo_showTodo$ = false;

      // this is different than Angular SDK, as we need to initContainer if root container reloaded
      if (sessionStorage.getItem('okToInitFlowContainer') == 'true') {
        this.initContainer();
      }
    }

    // if have caseMessage show message and end
    this.showCaseMessages();

    this.updateFlowContainerChildren();
  }

  loadReviewPage(localPConn) {
    const { CASE_INFO: CASE_CONSTS } = PCore.getConstants();

    setTimeout(() => {
      this.ngZone.run(() => {
        /*
          *** renove this commmented out code when React/WC is updated
          *** this code is replace with the call to "getToDoAssigments" function below

          const assignmentsList = localPConn.getValue(
            CASE_CONSTS.D_CASE_ASSIGNMENTS_RESULTS
          );
                  // add status
          const status = localPConn.getValue("caseInfo.status");

          let localAssignment = JSON.parse(JSON.stringify(assignmentsList[0]));
          localAssignment.status = status;
          let locaAssignmentsList: Array<any> = [];
          locaAssignmentsList.push(localAssignment);

          const caseActions = localPConn.getValue(CASE_CONSTS.CASE_INFO_ACTIONS);
          */

        const todoAssignments = getToDoAssignments(this.pConn$);

        if (todoAssignments && todoAssignments.length > 0) {
          this.todo_caseInfoID$ = this.pConn$.getValue(CASE_CONSTS.CASE_INFO_ID);
          this.todo_datasource$ = { source: todoAssignments };
        }

        /* remove this commented out code when update React/WC */
        // let kid = this.pConn$.getChildren()[0];

        // kid.getPConnect() can be a Reference component. So normalize it just in case
        //        let todoKid = ReferenceComponent.normalizePConn(kid.getPConnect()).getChildren()[0];

        //        this.todo_pConn$ = todoKid.getPConnect();

        /* code change here to note for React/WC  */
        // todo now needs pConn to open the work item on click "go"
        this.todo_pConn$ = this.pConn$;

        // still needs the context of the original work item
        this.todo_context$ = localPConn.getContextName();

        this.todo_showTodo$ = true;

        this.psService.sendMessage(false);
      });
    });
  }

  showCaseMessages() {
    this.caseMessages$ = this.localizedVal(this.pConn$.getValue('caseMessages'), this.localeCategory);
    if (this.caseMessages$ || !this.hasAssignments()) {
      this.bHasCaseMessages$ = true;
      this.bShowConfirm = true;
      this.checkSvg$ = this.utils.getImageSrc('check', this.utils.getSDKStaticContentUrl());
      // Temp fix for 8.7 change: confirmationNote no longer coming through in caseMessages$.
      // So, if we get here and caseMessages$ is empty, use default value in DX API response
      if (!this.caseMessages$) {
        this.caseMessages$ = this.localizedVal('Thank you! The next step in this case has been routed appropriately.', this.localeCategory);
      }

      // publish this "assignmentFinished" for mashup, need to get approved as a standard
      PCore.getPubSubUtils().publish('assignmentFinished');

      this.psService.sendMessage(false);
    } else {
      this.bHasCaseMessages$ = false;
      this.bShowConfirm = false;
    }
  }

  updateFlowContainerChildren() {
    // routingInfo was added as component prop in populateAdditionalProps
    const routingInfo = this.angularPConnect.getComponentProp(this, 'routingInfo');

    let loadingInfo: any;
    try {
      // @ts-ignore - Property 'getLoadingStatus' is private and only accessible within class 'C11nEnv'
      loadingInfo = this.pConn$.getLoadingStatus();
    } catch (ex) {
      /* empty */
    }

    // this check in routingInfo, mimic Nebula/Constellation (React) to check and get the internals of the
    // flowContainer and force updates to pConnect/redux
    if (routingInfo && loadingInfo !== undefined) {
      const currentOrder = routingInfo.accessedOrder;
      const currentItems = routingInfo.items;
      const type = routingInfo.type;
      if (currentOrder && currentItems) {
        // JA - making more similar to Nebula/Constellation
        const key = currentOrder[currentOrder.length - 1];

        // save off itemKey to be used for finishAssignment, etc.
        // timeout and detectChanges to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          if (key && key != '') {
            this.itemKey$ = key;
            this.cdRef.detectChanges();
          }
        });

        // eslint-disable-next-line sonarjs/no-collapsible-if
        if (currentOrder.length > 0) {
          if (currentItems[key] && currentItems[key].view && type === 'single' && Object.keys(currentItems[key].view).length > 0) {
            // when we get here, it it because the flow action data has changed
            // from the server, and need to add to pConnect and update children

            this.addPConnectAndUpdateChildren(currentItems[key], key);
          }
        }
      }
    }
  }

  addPConnectAndUpdateChildren(currentItem, key) {
    const localPConn = this.arChildren$[0].getPConnect();

    const rootView = currentItem.view;
    const { context, name: ViewName } = rootView.config;
    const config: any = { meta: rootView };

    // Don't go ahead if View doesn't exist
    if (!ViewName) {
      return;
    }

    this.todo_context$ = currentItem.context;

    config.options = {
      context: currentItem.context,
      pageReference: context || localPConn.getPageReference(),
      hasForm: true,
      isFlowContainer: true,
      containerName: localPConn.getContainerName(),
      containerItemName: key,
      parentPageReference: localPConn.getPageReference()
    };

    const configObject = PCore.createPConnect(config);
    this.confirm_pconn = configObject.getPConnect();
    // 8.7 - config might be a Reference component so, need to normalize it to get
    //  the View if it is a Reference component. And need to pass in the getPConnect
    //  to have normalize do a c11Env createComponent (that makes sure options.hasForm
    //  is passed along to all the component's children)
    const normalizedConfigObject = ReferenceComponent.normalizePConn(configObject.getPConnect());
    // We want the children to be the PConnect itself, not the result of calling getPConnect(),
    //  So need to get the PConnect of the normalized component we just created...
    const normalizedConfigObjectAsPConnect = normalizedConfigObject.getComponent();

    // makes sure Angular tracks these changes
    this.ngZone.run(() => {
      this.buildName$ = this.getBuildName();
      // what comes back now in configObject is the children of the flowContainer

      this.arChildren$ = [];
      this.arChildren$.push(normalizedConfigObjectAsPConnect);

      this.psService.sendMessage(false);

      const oWorkItem = configObject.getPConnect();
      const oWorkData: any = oWorkItem.getDataObject();

      this.containerName$ = this.localizedVal(this.getActiveViewLabel() || oWorkData.caseInfo.assignments?.[0].name, undefined, this.localeReference);
    });
  }

  getBuildName(): string {
    // let { getPConnect, name } = this.pConn$.props;
    const context = this.pConn$.getContextName();
    let viewContainerName = this.pConn$.getContainerName();

    if (!viewContainerName) viewContainerName = '';
    return `${context.toUpperCase()}/${viewContainerName.toUpperCase()}`;
  }

  formValid(): boolean {
    this.touchAll();
    return this.formGroup$.valid;
  }

  touchAll(): void {
    Object.values(this.formGroup$.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  // eslint-disable-next-line sonarjs/no-identical-functions
  topViewRefresh(): void {
    Object.values(this.formGroup$.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  // helpers - copyied from flow container helpers.js

  addContainerItem(pConnect) {
    // copied from flow container helper.js
    const containerManager = pConnect.getContainerManager();
    const contextName = pConnect.getContextName(); // here we will get parent context name, as flow container is child of view container
    const caseViewMode = pConnect.getValue('context_data.caseViewMode');

    let key;
    let flowName;

    if (caseViewMode !== 'review') {
      const target = contextName.substring(0, contextName.lastIndexOf('_'));
      const activeContainerItemID = PCore.getContainerUtils().getActiveContainerItemName(target);
      const containerItemData = PCore.getContainerUtils().getContainerItemData(target, activeContainerItemID);

      if (containerItemData) {
        ({ key, flowName } = containerItemData);
      }
    }

    containerManager.addContainerItem({
      semanticURL: '',
      key,
      flowName,
      caseViewMode: 'perform',
      resourceType: 'ASSIGNMENT',
      data: pConnect.getDataObject(contextName)
    });
  }
  // helpers end
}
