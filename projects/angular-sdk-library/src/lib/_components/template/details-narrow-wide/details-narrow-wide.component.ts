import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-details-narrow-wide',
  templateUrl: './details-narrow-wide.component.html',
  styleUrls: ['./details-narrow-wide.component.scss'],
  standalone: true,
  imports: [forwardRef(() => ComponentMapperComponent)]
})
export class DetailsNarrowWideComponent implements OnInit {
  constructor(private angularPConnect: AngularPConnectService) {}

  @Input() pConn$: typeof PConnect;

  arFields$: Array<any> = [];
  arFields2$: Array<any> = [];
  highlightedDataArr: Array<any> = [];
  showHighlightedData: boolean;
  // Used with AngularPConnect
  angularPConnectData: AngularPConnectData = {};

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);

    // this.updateSelf();
    this.checkAndUpdate();
  }

  ngOnDestroy() {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

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
    const rawMetaData: any = this.pConn$.resolveConfigProps((this.pConn$.getRawMetadata() as any).config);
    this.showHighlightedData = rawMetaData?.showHighlightedData;

    if (this.showHighlightedData) {
      const highlightedData = rawMetaData?.highlightedData;
      this.highlightedDataArr = highlightedData.map((field) => {
        field.config.displayMode = 'STACKED_LARGE_VAL';

        if (field.config.value === '@P .pyStatusWork') {
          field.type = 'TextInput';
          field.config.displayAsStatus = true;
        }

        return field;
      });
    }

    const kids = this.pConn$.getChildren() as Array<any>;
    for (const kid of kids) {
      const pKid = kid.getPConnect();
      const pKidData = pKid.resolveConfigProps(pKid.getRawMetadata());
      if (kids.indexOf(kid) == 0) {
        this.arFields$ = pKidData.children;
      } else {
        this.arFields2$ = pKidData.children;
      }
    }
  }
}
