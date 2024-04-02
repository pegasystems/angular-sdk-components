import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResolutionScreenComponent } from '../resolution-screen/resolution-screen.component';
import { BundleSwatchComponent } from '../bundle-swatch/bundle-swatch.component';
import { ProgressSpinnerService } from '../../../../../../../packages/angular-sdk-components/src/lib/_messages/progress-spinner.service';
import { ServerConfigService } from '../../../../../../../packages/angular-sdk-components/src/lib/_services/server-config.service';
import { ComponentMapperComponent } from '../../../../../../../packages/angular-sdk-components/src/lib/_bridge/component-mapper/component-mapper.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-main-screen',
  templateUrl: './main-screen.component.html',
  styleUrls: ['./main-screen.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    BundleSwatchComponent,
    ComponentMapperComponent,
    ResolutionScreenComponent,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule
  ]
})
export class MainScreenComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;

  firstConfig$: any;
  secondConfig$: any;
  thirdConfig$: any;
  showTriplePlayOptions$ = true;
  showPega$ = false;
  showResolution$ = false;

  caseID = 'DIXL-MEDIACO-WORK%20N-128038';

  constructor(
    private psservice: ProgressSpinnerService,
    private scservice: ServerConfigService
  ) {}

  ngOnInit(): void {
    // first
    this.firstConfig$ = {
      play: 'Triple Play',
      level: 'Basic',
      channels: '100+',
      channels_full: '100+ (Basic +)',
      banner: 'Value package',
      price: '99.00',
      internetSpeed: '100 Mbps',
      calling: ''
    };

    // second
    this.secondConfig$ = {
      play: 'Triple Play',
      level: 'Silver',
      channels: '125+',
      channels_full: '125+ (Delux)',
      banner: 'Most popular',
      price: '120.00',
      internetSpeed: '300 Mbps',
      calling: ''
    };

    // third
    this.thirdConfig$ = {
      play: 'Triple Play',
      level: 'Gold',
      channels: '175+',
      channels_full: '175+ (Premium)',
      banner: 'All the channels you want',
      price: '150.00',
      internetSpeed: '1 Gbps',
      calling: ' & International'
    };

    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL,
      () => {
        this.cancelAssignment();
      },
      'cancelAssignment'
    );

    PCore.getPubSubUtils().subscribe(
      'assignmentFinished',
      () => {
        this.assignmentFinished();
      },
      'assignmentFinished'
    );
  }

  ngOnDestroy() {
    PCore.getPubSubUtils().unsubscribe(PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL, 'cancelAssignment');

    PCore.getPubSubUtils().unsubscribe('assignmentFinished', 'assignmentFinished');
  }

  cancelAssignment() {
    this.showTriplePlayOptions$ = true;
    this.showPega$ = false;
  }

  assignmentFinished() {
    this.showResolution$ = true;
    this.showPega$ = false;

    this.psservice.sendMessage(false);
  }

  createWork(sLevel: string) {
    this.showTriplePlayOptions$ = false;
    this.showPega$ = true;

    this.scservice.getSdkConfig().then(sdkConfig => {
      let mashupCaseType = sdkConfig.serverConfig.appMashupCaseType;
      if (!mashupCaseType) {
        const caseTypes = PCore.getEnvironmentInfo().environmentInfoObject.pyCaseTypeList;
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
      (PCore.getMashupApi().createCase(mashupCaseType, PCore.getConstants().APP.APP, options) as Promise<any>).then(() => {
        console.log('createCase rendering is complete');
      });
    });
  }

  openCase() {
    this.showTriplePlayOptions$ = false;
    this.showPega$ = true;
    // DIXL-MediaCo-Sdktest-Work-Dictu
    const options: any = {
      pageName: 'pyEmbedAssignment',
      startingFields: {}
    };
    PCore.getMashupApi()
      .openCase(this.caseID, PCore.getConstants().APP.APP, options)
      .then(() => {
        console.log('openCase rendering is complete');
      })
      .catch(error => console.log('error:', error));
  }

  onShopNow(sLevel: string) {
    this.createWork(sLevel);
  }
}
