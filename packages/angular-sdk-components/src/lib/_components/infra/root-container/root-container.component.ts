import { Component, OnInit, Input, NgZone, forwardRef, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { interval, Subscription } from 'rxjs';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { ServerConfigService } from '../../../_services/server-config.service';
import { ProgressSpinnerService } from '../../../_messages/progress-spinner.service';
import { ThemeService } from '../../../_services/theme.service';
import { ReferenceComponent } from '../reference/reference.component';
import { PreviewViewContainerComponent } from '../Containers/preview-view-container/preview-view-container.component';
import { ModalViewContainerComponent } from '../Containers/modal-view-container/modal-view-container.component';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

/**
 * WARNING:  It is not expected that this file should be modified.  It is part of infrastructure code that works with
 * Redux and creation/update of Redux containers and PConnect.  Modifying this code could have undesireable results and
 * is totally at your own risk.
 */

const options = { context: 'app' };

@Component({
  selector: 'app-root-container',
  templateUrl: './root-container.component.html',
  styleUrls: ['./root-container.component.scss'],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    ModalViewContainerComponent,
    PreviewViewContainerComponent,
    forwardRef(() => ComponentMapperComponent)
  ]
})
export class RootContainerComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() displayOnlyFA$: boolean;
  @Input() isMashup$: boolean;

  scService = inject(ServerConfigService);

  // For interaction with AngularPConnect
  angularPConnectData: AngularPConnectData = {};

  componentName$ = '';
  bIsProgress$ = false;

  // preview and modalview pConn
  pvConn$: any = null;
  mConn$: any = null;

  bShowRoot$ = true;

  progressSpinnerSubscription: Subscription;
  spinnerTimer: any = null;
  viewContainerPConn$: any = null;
  localizedVal: any;
  localeCategory = 'Messages';

  constructor(
    private angularPConnect: AngularPConnectService,
    private psService: ProgressSpinnerService,
    private ngZone: NgZone,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    const themeClass = this.themeService.getDefaultTheme();
    this.themeService.setTheme(themeClass);
    const { containers } = PCore.getStore().getState();
    const items = Object.keys(containers).filter(item => item.includes('root'));

    PCore.getContainerUtils().getContainerAPI().addContainerItems(items);

    // add preview and modalview containers to redux
    // keep local copies of the the pConnect that is related

    const configObjPreview = PCore.createPConnect({
      meta: {
        type: 'PreviewViewContainer',
        config: {
          name: 'preview'
        }
      },
      options
    });

    this.pvConn$ = configObjPreview.getPConnect();

    this.configureModalContainer();

    // clear out hasViewContainer
    sessionStorage.setItem('hasViewContainer', 'false');

    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);

    // handle showing and hiding the progress spinner
    this.progressSpinnerSubscription = this.psService.getMessage().subscribe(message => {
      this.showHideProgress(message.show);
    });
    this.localizedVal = PCore.getLocaleUtils().getLocaleValue;
  }

  ngOnDestroy() {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  // Callback passed when subscribing to store change
  onStateChange() {
    // Should always check the bridge to see if the component should update itself (re-render)
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);

    if (bUpdateSelf) {
      this.updateSelf();
    }
  }

  updateSelf() {
    // need to call this.getCurrentCompleteProps (not this.thePConn.getConfigProps)
    //  to get full set of props that affect this component in Redux
    const myProps: any = this.angularPConnect.getCurrentCompleteProps(this);

    const renderingModes = ['portal', 'view'];
    const noPortalMode = 'noPortal';

    const { renderingMode, children, skeleton, routingInfo } = myProps;

    if (routingInfo && renderingModes.includes(renderingMode)) {
      const { accessedOrder, items } = routingInfo;
      if (accessedOrder && items) {
        // bootstrap loadPortal resolves to here
        const key = accessedOrder[accessedOrder.length - 1];
        if (items[key] && items[key].view && Object.keys(items[key].view).length > 0) {
          const itemView = items[key].view;

          const rootObject = PCore.createPConnect({
            meta: itemView,
            options: {
              context: items[key].context
            }
          });

          setTimeout(() => {
            // makes sure Angular tracks these changes
            this.ngZone.run(() => {
              // the new rootObject may be a 'reference'. So,
              //  normalize it to get the referencedView if that's the case
              const theNewPConn = ReferenceComponent.normalizePConn(rootObject.getPConnect());
              // update ComponentName$ before we update pConn$ to make sure they're in sync
              //  when rendering...
              this.componentName$ = theNewPConn.getComponentName();

              this.pConn$ = theNewPConn;
              // this.pConn$ = rootObject.getPConnect();

              console.log(`RootContainer updated pConn$ to be: ${this.componentName$}`);
            });
          });
        }
      }
    } else if (renderingMode === noPortalMode) {
      // console.log(`RootContainer: renderingMode === noPortalMode: ${noPortalMode}`);
      this.generateViewContainerForNoPortal();
    } else if (children && children.length > 0) {
      // haven't resolved to here
    } else if (skeleton !== undefined) {
      // TODO: need to update once skeletons are available;
    }
  }

  async configureModalContainer() {
    const sdkConfig = await this.scService.getSdkConfig();
    const showModalsInEmbeddedMode = sdkConfig.serverConfig.showModalsInEmbeddedMode;

    if (!this.displayOnlyFA$ || showModalsInEmbeddedMode) {
      const configObjModal = PCore.createPConnect({
        meta: {
          type: 'ModalViewContainer',
          config: {
            name: 'modal'
          }
        },
        options
      });

      this.mConn$ = configObjModal.getPConnect();
    }
  }

  generateViewContainerForNoPortal() {
    // bootstrap loadMashup resolves to here
    const arChildren = this.pConn$.getChildren() as any[];
    if (arChildren && arChildren.length == 1) {
      // have to have a quick timeout or get an "expressions changed" angular error
      setTimeout(() => {
        this.ngZone.run(() => {
          const localPConn = arChildren[0].getPConnect();

          this.componentName$ = localPConn.getComponentName();
          if (this.componentName$ === 'ViewContainer') {
            const configProps = this.pConn$.getConfigProps();
            const viewContConfig = {
              meta: {
                type: 'ViewContainer',
                config: configProps
              },
              options
            };

            this.viewContainerPConn$ = PCore.createPConnect(viewContConfig).getPConnect();
          }
          this.bShowRoot$ = true;
        });
      });
    }
  }

  showHideProgress(bShow: boolean) {
    // only show spinner after 500ms wait, so if server fast, won't see
    if (bShow) {
      if (!this.bIsProgress$) {
        // makes sure Angular tracks these changes
        if (!this.spinnerTimer || this.spinnerTimer.isStopped) {
          this.spinnerTimer = interval(500).subscribe(() => {
            try {
              this.spinnerTimer.unsubscribe();
            } catch (ex) {
              console.log(ex);
            }

            this.ngZone.run(() => {
              this.bIsProgress$ = true;
            });
          });
        }
      }
    } else {
      if (this.spinnerTimer && !this.spinnerTimer.isStopped) {
        this.spinnerTimer.unsubscribe();
      }

      // don't touch bIsProgress$ unless differnent
      if (bShow != this.bIsProgress$) {
        // makes sure Angular tracks these changes
        this.ngZone.run(() => {
          this.bIsProgress$ = bShow;
        });
      }
    }
  }
}
