import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ComponentMapperComponent } from '@pega/angular-sdk-library';
import { compareSdkPCoreVersions } from '@pega/angular-sdk-library';

import { getSdkComponentMap } from '@pega/angular-sdk-library';
// import localSdkComponentMap from '@pega/angular-sdk-library';
import localSdkComponentMap from '@pega/angular-sdk-library';

declare const window: any;

@Component({
  selector: 'app-top-app',
  templateUrl: './top-app.component.html',
  styleUrls: ['./top-app.component.scss'],
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, ComponentMapperComponent]
})
export class TopAppComponent implements OnInit {
  PCore$: any;
  pConn$: any;
  props$: any;

  sComponentName$: string;
  arChildren$: Array<any>;
  bPCoreReady$: boolean = false;

  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    this.doSubscribe();
  }

  doSubscribe() {
    window.PCore.onPCoreReady((renderObj: any) => {
      // Check that we're seeing the PCore version we expect
      compareSdkPCoreVersions();

      // Initialize the SdkComponentMap (local and pega-provided)
      getSdkComponentMap(localSdkComponentMap).then((theComponentMap: any) => {
        console.log(`SdkComponentMap initialized`, theComponentMap);

        // Don't call initialRender until SdkComponentMap is fully initialized
        this.initialRender(renderObj);
      });
    });
  }

  initialRender(renderObj) {
    // Change to reflect new use of arg in the callback:
    const { props /*, domContainerID = null */ } = renderObj;

    this.ngZone.run(() => {
      this.props$ = props;
      this.pConn$ = this.props$.getPConnect();
      this.sComponentName$ = this.pConn$.getComponentName();
      this.PCore$ = window.PCore;
      this.arChildren$ = this.pConn$.getChildren();
      this.bPCoreReady$ = true;
    });

    sessionStorage.setItem('pCoreUsage', 'AngularSDK');
  }
}