import { Component, OnInit, OnDestroy } from '@angular/core';

import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { loginIfNecessary, logout, sdkSetAuthHeader, sdkSetCustomTokenParamsCB } from '@pega/auth/lib/sdk-auth-manager';
import { CommonModule } from '@angular/common';
import {
  compareSdkPCoreVersions,
  ComponentMapperComponent,
  getSdkComponentMap,
  ProgressSpinnerService,
  ServerConfigService
} from 'packages/angular-sdk-components/src/public-api';
import localSdkComponentMap from 'packages/angular-sdk-components/src/sdk-local-component-map';

@Component({
  selector: 'app-combination',
  standalone: true,
  imports: [CommonModule, ComponentMapperComponent],
  templateUrl: './combination.component.html',
  styleUrl: './combination.component.scss'
})
export class CombinationComponent implements OnInit, OnDestroy {
  pConn$: typeof PConnect;

  applicationLabel: string | undefined = '';
  bLoggedIn$ = false;
  bPConnectLoaded$ = false;
  bHasPConnect$ = false;
  isProgress$ = false;
  displayOnlyFA$ = false;

  progressSpinnerSubscription: Subscription;

  constructor(
    private psservice: ProgressSpinnerService,
    private titleService: Title,
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

  async initialize() {
    this.titleService.setTitle('Media Co');

    sessionStorage.clear();

    // handle showing and hiding the progress spinner
    this.progressSpinnerSubscription = this.psservice.getMessage().subscribe(message => {
      this.showHideProgress(message.show);
    });

    // Add event listener for when logged in and constellation bootstrap is loaded
    document.addEventListener('SdkConstellationReady', () => {
      this.bLoggedIn$ = true;
      // start the portal
      this.startMashup();
    });

    // Add event listener for when logged out
    document.addEventListener('SdkLoggedOut', () => {
      this.bLoggedIn$ = false;
    });

    const sdkConfigAuth = await this.scservice.getSdkConfigAuth();

    if ((sdkConfigAuth.mashupGrantType === 'none' || !sdkConfigAuth.mashupClientId) && sdkConfigAuth.customAuthType === 'Basic') {
      // Service package to use custom auth with Basic
      const sB64 = window.btoa(`${sdkConfigAuth.mashupUserIdentifier}:${window.atob(sdkConfigAuth.mashupPassword)}`);
      sdkSetAuthHeader(`Basic ${sB64}`);
    }

    if ((sdkConfigAuth.mashupGrantType === 'none' || !sdkConfigAuth.mashupClientId) && sdkConfigAuth.customAuthType === 'BasicTO') {
      const now = new Date();
      const expTime = new Date(now.getTime() + 5 * 60 * 1000);
      let sISOTime = `${expTime.toISOString().split('.')[0]}Z`;
      const regex = /[-:]/g;
      sISOTime = sISOTime.replace(regex, '');
      // Service package to use custom auth with Basic
      const sB64 = window.btoa(`${sdkConfigAuth.mashupUserIdentifier}:${window.atob(sdkConfigAuth.mashupPassword)}:${sISOTime}`);
      sdkSetAuthHeader(`Basic ${sB64}`);
    }

    if (sdkConfigAuth.mashupGrantType === 'customBearer' && sdkConfigAuth.customAuthType === 'CustomIdentifier') {
      // Use custom bearer with specific custom parameter to set the desired operator via
      //  a userIdentifier property.  (Caution: highly insecure...being used for simple demonstration)
      sdkSetCustomTokenParamsCB(() => {
        return { userIdentifier: sdkConfigAuth.mashupUserIdentifier };
      });
    }

    // Login if needed, without doing an initial main window redirect
    // eslint-disable-next-line no-restricted-globals
    const sAppName = location.pathname.substring(location.pathname.indexOf('/') + 1);
    loginIfNecessary({ appName: sAppName, mainRedirect: false });
  }

  startMashup() {
    PCore.onPCoreReady(renderObj => {
      console.log('PCore ready!');
      // Check that we're seeing the PCore version we expect
      compareSdkPCoreVersions();
      this.applicationLabel = PCore.getEnvironmentInfo().getApplicationLabel();

      this.titleService.setTitle(this.applicationLabel ?? '');

      // Initialize the SdkComponentMap (local and pega-provided)
      getSdkComponentMap(localSdkComponentMap).then((theComponentMap: any) => {
        console.log(`SdkComponentMap initialized`, theComponentMap);

        // Don't call initialRender until SdkComponentMap is fully initialized
        this.initialRender(renderObj);
      });
    });

    window.myLoadMashup('app-root', false); // this is defined in bootstrap shell that's been loaded already
  }

  initialRender(renderObj) {
    // Need to register the callback function for PCore.registerComponentCreator
    //  This callback is invoked if/when you call a PConnect createComponent
    PCore.registerComponentCreator(c11nEnv => {
      return c11nEnv;
    });

    // Change to reflect new use of arg in the callback:
    const { props } = renderObj;

    this.pConn$ = props.getPConnect();

    this.bHasPConnect$ = true;
    this.bPConnectLoaded$ = true;

    this.showHideProgress(false);

    sessionStorage.setItem('pCoreUsage', 'AngularSDKMashup');
  }

  showHideProgress(bShow: boolean) {
    this.isProgress$ = bShow;
    // causing failure on actions buttons in emebedded mode
    // this.cdRef.detectChanges();
  }

  logOff() {
    logout().then(() => {
      // Reload the page to kick off the login
      window.location.reload();
    });
  }

  showHome() {
    this.pConn$.getActionsApi().showPage('pyHome', 'DIXL-MediaCo-UIPages');
  }

  createCase(sLevel: string = 'Basic') {
    // this.displayOnlyFA$ = true;
    this.scservice.getSdkConfig().then(sdkConfig => {
      let mashupCaseType = sdkConfig.serverConfig.appMashupCaseType;
      if (!mashupCaseType) {
        // @ts-ignore - Object is possibly 'null'
        const caseTypes: any = PCore.getEnvironmentInfo().environmentInfoObject.pyCaseTypeList;
        mashupCaseType = caseTypes[0].pyWorkTypeImplementationClassName;
      }

      const options: any = {
        pageName: 'pyEmbedAssignment',
        startingFields:
          mashupCaseType === 'DIXL-MediaCo-Work-NewService'
            ? {
                Package: sLevel
              }
            : {}
      };
      PCore.getMashupApi()
        .createCase(mashupCaseType, PCore.getConstants().APP.ROOT, options)
        .then(() => {
          console.log('createCase rendering is complete');
        });
    });
  }
}
