import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { loginIfNecessary, logout, getAvailablePortals } from '@pega/auth/lib/sdk-auth-manager';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { interval, Subscription } from 'rxjs';
import { ProgressSpinnerService } from 'packages/angular-sdk-components/src/lib/_messages/progress-spinner.service';
import { ServerConfigService } from 'packages/angular-sdk-components/src/lib/_services/server-config.service';
import { compareSdkPCoreVersions } from 'packages/angular-sdk-components/src/lib/_helpers/versionHelpers';
import { ComponentMapperComponent } from 'packages/angular-sdk-components/src/lib/_bridge/component-mapper/component-mapper.component';

import { getSdkComponentMap } from 'packages/angular-sdk-components/src/lib/_bridge/helpers/sdk_component_map';
import localSdkComponentMap from 'packages/angular-sdk-components/src/sdk-local-component-map';

declare global {
  interface Window {
    myLoadPortal: Function;
    myLoadDefaultPortal: Function;
  }
}

@Component({
  selector: 'app-full-portal',
  templateUrl: './full-portal.component.html',
  styleUrls: ['./full-portal.component.scss'],
  imports: [CommonModule, MatProgressSpinnerModule, ComponentMapperComponent]
})
export class FullPortalComponent implements OnInit, OnDestroy {
  pConn$: typeof PConnect;

  sComponentName$: string | undefined;
  bPCoreReady$ = false;

  bLoggedIn$ = false;
  isProgress$ = false;

  progressSpinnerSubscription: Subscription;

  spinnerTimer: any;

  portalSelectionScreen = false;
  availablePortals: string[];
  defaultPortalName: string | undefined;

  constructor(
    private psservice: ProgressSpinnerService,
    private ngZone: NgZone,
    private scservice: ServerConfigService
  ) {}

  ngOnInit() {
    this.scservice.readSdkConfig().then(() => {
      this.initialize();
    });
  }

  ngOnDestroy() {
    this.progressSpinnerSubscription.unsubscribe();
  }

  initialize() {
    // handle showing and hiding the progress spinner
    this.progressSpinnerSubscription = this.psservice.getMessage().subscribe(message => {
      this.showHideProgress(message.show);
    });

    // Add event listener for when logged in and constellation bootstrap is loaded
    document.addEventListener('SdkConstellationReady', () => {
      this.bLoggedIn$ = true;
      // start the portal
      this.startPortal();
    });

    // Add event listener for when logged out
    document.addEventListener('SdkLoggedOut', () => {
      this.bLoggedIn$ = false;
    });

    /* Login if needed */

    const sAppName = location.pathname.substring(location.pathname.indexOf('/') + 1);
    loginIfNecessary({ appName: sAppName, mainRedirect: true });

    /* Check if portal is specified as a query parameter */
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const portalValue = urlParams.get('portal');
    if (portalValue) {
      sessionStorage.setItem('asdk_portalName', portalValue);
    }
  }

  startPortal() {
    PCore.onPCoreReady(renderObj => {
      // Check that we're seeing the PCore version we expect
      compareSdkPCoreVersions();

      // Initialize the SdkComponentMap (local and pega-provided)
      getSdkComponentMap(localSdkComponentMap).then((theComponentMap: any) => {
        console.log(`SdkComponentMap initialized`, theComponentMap);

        // Don't call initialRender until SdkComponentMap is fully initialized
        this.initialRender(renderObj);
      });
    });

    const { appPortal: thePortal, excludePortals } = this.scservice.getSdkConfigServer();
    const defaultPortal = PCore?.getEnvironmentInfo?.().getDefaultPortal?.();
    const queryPortal = sessionStorage.getItem('asdk_portalName');

    // Note: myLoadPortal and myLoadDefaultPortal are set when bootstrapWithAuthHeader is invoked
    if (queryPortal) {
      console.log(`Loading appPortal specified as a query parameter: ${queryPortal}`);
      window.myLoadPortal('app-root', queryPortal, []);
    } else if (thePortal) {
      console.log(`Loading specified appPortal: ${thePortal}`);
      window.myLoadPortal('app-root', thePortal, []); // this is defined in bootstrap shell that's been loaded already
    } else if (window.myLoadDefaultPortal && defaultPortal && !excludePortals.includes(defaultPortal)) {
      console.log(`Loading default portal: ${defaultPortal}`);
      window.myLoadDefaultPortal('app-root', []);
    } else {
      console.log('Loading portal selection screen');
      this.portalSelectionScreen = true;
      this.defaultPortalName = defaultPortal;
      // Getting current user's access group's available portals list other than excluded portals (relies on Traditional DX APIs)
      getAvailablePortals().then((portals: string[]) => {
        this.availablePortals = portals;
      });
    }
  }

  initialRender(renderObj) {
    /* In react initialRender happens here */

    // Need to register the callback function for PCore.registerComponentCreator
    // This callback is invoked if/when you call a PConnect createComponent
    PCore.registerComponentCreator(c11nEnv => {
      return c11nEnv;
    });

    // Change to reflect new use of arg in the callback:
    const { props } = renderObj;

    this.pConn$ = props.getPConnect();
    this.sComponentName$ = this.pConn$.getComponentName();
    this.bPCoreReady$ = true;
  }

  showHideProgress(bShow: boolean) {
    if (bShow) {
      if (!this.isProgress$) {
        // makes sure Angular tracks these changes

        this.spinnerTimer = interval(500).subscribe(() => {
          if (this.spinnerTimer) {
            this.spinnerTimer.unsubscribe();
            this.spinnerTimer = null;
          }

          this.ngZone.run(() => {
            this.isProgress$ = true;
          });
        });
      }
    } else {
      if (this.spinnerTimer != null) {
        this.spinnerTimer.unsubscribe();
        this.spinnerTimer = null;
      }

      // don't touch bIsProgress$ unless differnent
      if (bShow != this.isProgress$) {
        // makes sure Angular tracks these changes
        this.ngZone.run(() => {
          this.isProgress$ = bShow;
        });
      }
    }
  }

  logOff() {
    logout().then(() => {
      // Reload the page to kick off the login
      window.location.reload();
    });
  }

  loadSelectedPortal(portal) {
    this.portalSelectionScreen = false;
    window.myLoadPortal('app-root', portal, []); // this is defined in bootstrap shell that's been loaded already
  }
}
