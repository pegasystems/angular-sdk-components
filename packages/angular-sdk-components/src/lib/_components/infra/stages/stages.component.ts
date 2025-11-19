import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval } from 'rxjs';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';

interface StagesProps {
  // If any, enter additional props that only exist on this component
  stages: any[];
}

@Component({
  selector: 'app-stages',
  templateUrl: './stages.component.html',
  styleUrls: ['./stages.component.scss'],
  imports: [CommonModule]
})
export class StagesComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;

  // Used with AngularPConnect
  angularPConnectData: AngularPConnectData = {};
  PCore$: typeof PCore = PCore;
  configProps$: StagesProps;

  arStageResults$: any[];
  lastStage$: any;
  checkSvgIcon$: string;
  key: any;
  localizationService: any;

  constructor(
    private angularPConnect: AngularPConnectService,
    private utils: Utils
  ) {}

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);

    // const imagePath = this.utils.getIconPath(this.utils.getSDKStaticContentUrl());
    this.checkSvgIcon$ = this.utils.getImageSrc('check', this.utils.getSDKStaticContentUrl());
    this.key = this.pConn$?.getCaseLocaleReference();
    this.localizationService = this.pConn$?.getLocalizationService();
  }

  ngOnDestroy(): void {
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
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as StagesProps;

    const timer = interval(50).subscribe(() => {
      timer.unsubscribe();

      const arStages = this.angularPConnect.getComponentProp(this, 'stages');

      // this.stageResults$ = this.configProps$.stages;
      if (arStages != null) {
        this.arStageResults$ = arStages;
        this.lastStage$ = this.arStageResults$[this.arStageResults$.length - 1];
      }
    });
  }
}
