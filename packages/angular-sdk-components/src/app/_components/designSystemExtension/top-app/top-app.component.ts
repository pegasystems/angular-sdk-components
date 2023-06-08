import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RootContainerComponent } from '../../infra/root-container/root-container.component';
import { compareSdkPCoreVersions } from '../../../_helpers/versionHelpers';

@Component({
  selector: 'app-top-app',
  templateUrl: './top-app.component.html',
  styleUrls: ['./top-app.component.scss'],
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, RootContainerComponent]
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
    });
  }
}
