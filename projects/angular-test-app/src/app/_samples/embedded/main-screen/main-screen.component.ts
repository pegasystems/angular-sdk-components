import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResolutionScreenComponent } from '../resolution-screen/resolution-screen.component';
import { ShoppingCardComponent } from '../shopping-card/shopping-card.component';
import { ServerConfigService } from 'packages/angular-sdk-components/src/lib/_services/server-config.service';
import { ComponentMapperComponent } from 'packages/angular-sdk-components/src/lib/_bridge/component-mapper/component-mapper.component';
import { shoppingOptions } from '../utils';

declare const PCore: any;

@Component({
  selector: 'app-main-screen',
  templateUrl: './main-screen.component.html',
  styleUrls: ['./main-screen.component.scss'],
  standalone: true,
  imports: [CommonModule, ShoppingCardComponent, ComponentMapperComponent, ResolutionScreenComponent]
})
export class MainScreenComponent implements OnInit, OnDestroy {
  @Input() pConn$: any;

  shoppingOptionsList = shoppingOptions;

  showPega$ = false;
  showTriplePlayOptions$ = true;
  showResolution$ = false;

  constructor(private scservice: ServerConfigService) {}

  ngOnInit(): void {
    PCore.getPubSubUtils().subscribe(PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL, () => this.cancelAssignment(), 'cancelAssignment');

    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.END_OF_ASSIGNMENT_PROCESSING,
      () => this.assignmentFinished(),
      'endOfAssignmentProcessing'
    );
  }

  ngOnDestroy() {
    PCore.getPubSubUtils().unsubscribe(PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL, 'cancelAssignment');
    PCore.getPubSubUtils().unsubscribe(PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.END_OF_ASSIGNMENT_PROCESSING, 'endOfAssignmentProcessing');
  }

  cancelAssignment() {
    this.showTriplePlayOptions$ = true;
    this.showPega$ = false;
  }

  assignmentFinished() {
    this.showResolution$ = true;
    this.showPega$ = false;
  }

  onShopNow(optionClicked: string) {
    this.showTriplePlayOptions$ = false;
    this.showPega$ = true;

    this.scservice.getSdkConfig().then(sdkConfig => {
      let mashupCaseType = sdkConfig.serverConfig.appMashupCaseType;
      if (!mashupCaseType) {
        const caseTypes: any = PCore.getEnvironmentInfo().environmentInfoObject?.pyCaseTypeList;
        if (caseTypes && caseTypes.length > 0) {
          mashupCaseType = caseTypes[0].pyWorkTypeImplementationClassName;
        }
      }

      const options: any = {
        pageName: 'pyEmbedAssignment',
        startingFields: {}
      };

      if (mashupCaseType === 'DIXL-MediaCo-Work-NewService') {
        options.startingFields.Package = optionClicked;
      }

      PCore.getMashupApi()
        .createCase(mashupCaseType, PCore.getConstants().APP.APP, options)
        .then(() => {
          console.log('createCase rendering is complete');
        });
    });
  }
}
