import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { loginIfNecessary, getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';

import { initializeAuthentication } from '../../../embedded/utils';
import { getSdkComponentMap } from 'packages/angular-sdk-components/src/lib/_bridge/helpers/sdk_component_map';
import localSdkComponentMap from 'packages/angular-sdk-components/src/sdk-local-component-map';

@Component({
  selector: 'app-customer-support-shell',
  templateUrl: './customer-support-shell.component.html',
  styleUrls: ['./customer-support-shell.component.scss'],
  imports: [CommonModule, RouterOutlet]
})
export class CustomerSupportShellComponent {
  cdRef: ChangeDetectorRef = inject(ChangeDetectorRef);

  isLoggedIn = false;
  pConn$: any;
  bHasPConnect$ = false;

  ngOnInit() {
    // Any initialization logic can go here
    this.initialize();
  }

  async initialize() {
    // Add event listener for when logged in and constellation bootstrap is loaded
    document.addEventListener('SdkConstellationReady', () => this.handleSdkConstellationReady());

    const { authConfig, theme } = await getSdkConfig();
    document.body.classList.remove(...['light', 'dark']);
    document.body.classList.add(theme || 'dark');
    initializeAuthentication(authConfig);

    // Login if needed, without doing an initial main window redirect
    const sAppName = window.location.pathname.split('/')[1];
    // auth.html lives at the site root; nested routes would otherwise resolve it under /customer-support/
    authConfig.redirectUri ??= `${window.location.origin}/${sAppName}`;
    loginIfNecessary({ appName: sAppName, mainRedirect: false });
  }

  handleSdkConstellationReady() {
    this.isLoggedIn = true;
    // start the portal
    this.startMashup();
    this.cdRef.markForCheck();
  }

  startMashup() {
    PCore.onPCoreReady(async renderObj => {
      console.log('PCore ready!');

      // Initialize the SdkComponentMap (local and pega-provided)
      await getSdkComponentMap(localSdkComponentMap);
      console.log(`SdkComponentMap initialized`);

      // Don't call initialRender until SdkComponentMap is fully initialized
      this.initialRender(renderObj);
    });

    window.myLoadMashup('app-root', false); // this is defined in bootstrap shell that's been loaded already
  }

  initialRender(renderObj) {
    // Need to register the callback function for PCore.registerComponentCreator
    // This callback is invoked if/when you call a PConnect createComponent
    PCore.registerComponentCreator(c11nEnv => {
      return c11nEnv;
    });

    // Change to reflect new use of arg in the callback:
    const { props } = renderObj;

    this.pConn$ = props.getPConnect();
    this.bHasPConnect$ = true;
    this.cdRef.markForCheck();
  }
}
