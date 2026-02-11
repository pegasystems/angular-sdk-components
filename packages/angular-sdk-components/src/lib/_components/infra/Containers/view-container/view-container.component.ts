import { Component, OnInit, Input, NgZone, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { AngularPConnectData, AngularPConnectService } from '../../../../_bridge/angular-pconnect';
import { ProgressSpinnerService } from '../../../../_messages/progress-spinner.service';
import { ReferenceComponent } from '../../reference/reference.component';
import { ComponentMapperComponent } from '../../../../_bridge/component-mapper/component-mapper.component';
import { configureBrowserBookmark } from './helper';

/**
 * WARNING:  It is not expected that this file should be modified.  It is part of infrastructure code that works with
 * Redux and creation/update of Redux containers and PConnect.  Modifying this code could have undesireable results and
 * is totally at your own risk.
 */

interface ViewContainerProps {
  // If any, enter additional props that only exist on this component
  mode?: string;
  name?: string;
  limit?: number;
  template?: string;
  title?: string;
  routingInfo: object;
  readOnly?: boolean;
}

@Component({
  selector: 'app-view-container',
  templateUrl: './view-container.component.html',
  styleUrls: ['./view-container.component.scss'],
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class ViewContainerComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;
  @Input() displayOnlyFA$: boolean;

  // For interaction with AngularPConnect
  angularPConnectData: AngularPConnectData = {};
  configProps$: ViewContainerProps;

  arChildren$: any[];
  templateName$: string;
  buildName$: string;
  context$: string;
  title$ = '';

  viewPConn$: any;

  isViewContainer$ = true;

  // JA - created object is now a View with a Template
  //  Use its PConnect to render the CaseView; DON'T replace this.pConn$
  createdViewPConn$: any;
  state: any;
  dispatchObject: any;

  constructor(
    private angularPConnect: AngularPConnectService,
    private psService: ProgressSpinnerService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    if (this.displayOnlyFA$ == null) {
      this.displayOnlyFA$ = false;
    }

    // debugger;

    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);

    // Then, continue on with other initialization

    //    this.configProps$ = this.pConn$.getConfigProps();
    // children may have a 'reference' so normalize the children array
    this.arChildren$ = ReferenceComponent.normalizePConnArray(this.pConn$.getChildren());

    this.buildName$ = this.buildName();
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as ViewContainerProps;
    this.templateName$ = this.configProps$.template || '';
    this.title$ = this.configProps$.title || '';
    const { CONTAINER_TYPE, APP } = PCore.getConstants();
    const { name, mode, limit } = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as ViewContainerProps;

    this.pConn$.isBoundToState();

    const containerMgr = this.pConn$.getContainerManager();

    this.prepareDispatchObject = this.prepareDispatchObject.bind(this);

    this.dispatchObject = this.prepareDispatchObject();

    // TODO: Plan is to rename window.constellationCore to window.pega (or similar)
    //    And expose less via ui-bootstrap.js
    this.state = {
      dispatchObject: this.dispatchObject,
      visible: !PCore.checkIfSemanticURL()
    };

    if (sessionStorage.getItem('hasViewContainer') == 'false') {
      containerMgr.initializeContainers({
        type: mode === CONTAINER_TYPE.MULTIPLE ? CONTAINER_TYPE.MULTIPLE : CONTAINER_TYPE.SINGLE
      });

      if (mode === CONTAINER_TYPE.MULTIPLE && limit) {
        /* NOTE: setContainerLimit use is temporary. It is a non-public, unsupported API. */
        PCore.getContainerUtils().setContainerLimit(`${APP.APP}/${name}`, limit);
      }

      if (!PCore.checkIfSemanticURL()) containerMgr.addContainerItem(this.pConn$ as any);
      if (!this.displayOnlyFA$) configureBrowserBookmark(this.pConn$);

      sessionStorage.setItem('hasViewContainer', 'true');
    }

    // cannot call checkAndUpdate becasue first time through, will call updateSelf and that is incorrect (causes issues).
    // however, need angularPConnect to be initialized with currentProps for future updates, so calling shouldComponentUpdate directly
    // without checking to update here in init, will initialize and this is correct
    this.angularPConnect.shouldComponentUpdate(this);
  }

  ngOnDestroy() {
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
    //   *** DON'T call updateSelf in ngInit!!  ***

    if (this.arChildren$ == null) {
      // children may have a 'reference' so normalize the children array
      this.arChildren$ = ReferenceComponent.normalizePConnArray(this.pConn$.getChildren());
    }

    // routingInfo was added as component prop in populateAdditionalProps
    const routingInfo = this.angularPConnect.getComponentProp(this, 'routingInfo');

    let loadingInfo;
    try {
      // @ts-ignore - Property 'getLoadingStatus' is private and only accessible within class 'C11nEnv'
      loadingInfo = this.pConn$.getLoadingStatus();

      this.psService.sendMessage(loadingInfo);
    } catch (ex) {
      console.log(ex);
    }

    // const buildName = this.buildName();
    const { CREATE_DETAILS_VIEW_NAME } = PCore.getConstants();
    if (routingInfo) {
      const { accessedOrder, items } = routingInfo;
      if (accessedOrder && items) {
        const key = accessedOrder[accessedOrder.length - 1];
        let componentVisible = accessedOrder.length > 0;
        const { visible } = this.state;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        componentVisible = visible || componentVisible;
        if (items[key] && items[key].view && Object.keys(items[key].view).length > 0) {
          const latestItem = items[key];
          const rootView = latestItem.view;
          const { context, name: viewName } = rootView.config;
          const config: any = { meta: rootView };
          config.options = {
            context: latestItem.context,
            pageReference: context || this.pConn$.getPageReference(),
            containerName: this.pConn$.getContainerName(),
            containerItemName: key,
            hasForm: viewName === CREATE_DETAILS_VIEW_NAME
          };
          const configObject = PCore.createPConnect(config);

          // THIS is where the ViewContainer creates a View
          //    The config has meta.config.type = "view"
          const newComp = configObject.getPConnect();
          // const newCompName = newComp.getComponentName();
          // The metadata for pyDetails changed such that the "template": "CaseView"
          //  is no longer a child of the created View but is in the created View's
          //  config. So, we DON'T want to replace this.pConn$ since the created
          //  component is a View (and not a ViewContainer). We now look for the
          //  "template" type directly in the created component (newComp) and NOT
          //  as a child of the newly created component.

          // Use the newly created component (View) info but DO NOT replace
          //  this ViewContainer's pConn$, etc.
          //  Note that we're now using the newly created View's PConnect in the
          //  ViewContainer HTML template to guide what's rendered similar to what
          //  the Nebula/Constellation return of React.Fragment does

          this.ngZone.run(() => {
            if (newComp.getComponentName() === 'reference') {
              // if a refernece, it will de reference to a "view"
              // so hand this off to the "View" component to do that
              this.isViewContainer$ = false;
              this.viewPConn$ = newComp;

              /*
               ***  this commmented out code should be removed, once we test out that
               ***  handing off refernce to View component always works
               */

              // When newComp is a reference, we want to de-reference
              //  it (to get the View) and then use that View to get the
              //  template, title, children, etc.

              /*

              const theDereferencedView = ReferenceComponent.normalizePConn(newComp);
              const newConfigProps = theDereferencedView.getConfigProps();

              // children may have a 'reference' so normalize the children arra

              const theDereferencedViewChildren = ReferenceComponent.normalizePConnArray(theDereferencedView.getChildren());
              this.templateName$ = ('template' in newConfigProps) ? newConfigProps["template"] : "";
              this.title$ = ('title' in newConfigProps) ? newConfigProps["title"] : "";
              this.arChildren$ = theDereferencedViewChildren;
              this.createdViewPConn$ = theDereferencedView;
              */
            } else {
              // old style when newComp is NOT a 'reference'
              this.isViewContainer$ = true;

              console.error(`ViewContainer has a newComp that is NOT a reference!`);

              this.createdViewPConn$ = newComp;
              const newConfigProps = newComp.getConfigProps();
              this.templateName$ = newConfigProps.template || '';
              this.title$ = newConfigProps.title || '';
              // update children with new view's children
              // children may have a 'reference' so normalize the children array
              this.arChildren$ = ReferenceComponent.normalizePConnArray(newComp.getChildren());
            }
          });
        }
      }
    }
  }

  prepareDispatchObject(): any {
    const baseContext = this.pConn$.getContextName();
    // const { acName = "primary" } = pConn.getContainerName(); // doesn't work with 8.23 typings
    const acName = this.pConn$.getContainerName() || 'primary';

    return {
      semanticURL: '',
      context: baseContext,
      acName
    };
  }

  buildName(): string {
    const sContext = this.pConn$.getContextName();
    const sName = this.pConn$.getContainerName();

    return `${sContext.toUpperCase()}/${sName.toUpperCase()}`;
  }
}
