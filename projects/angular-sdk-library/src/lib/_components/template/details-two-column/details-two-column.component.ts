import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { MaterialDetailsComponent } from '../../designSystemExtension/material-details/material-details.component';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-details-two-column',
  templateUrl: './details-two-column.component.html',
  styleUrls: ['./details-two-column.component.scss'],
  standalone: true,
  imports: [MaterialDetailsComponent, forwardRef(() => ComponentMapperComponent)]
})
export class DetailsTwoColumnComponent implements OnInit {
  constructor(private angularPConnect: AngularPConnectService) {}

  @Input() pConn$: any;
  @Input() formGroup$: FormGroup;

  showHighlightedData: boolean;
  highlightedDataArr: any;

  arFields$: Array<any> = [];
  arFields2$: Array<any> = [];
  arFields3$: Array<any> = [];

  propsToUse: any = {};

  // Used with AngularPConnect
  angularPConnectData: any = {};

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);

    //this.updateSelf();
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
    const rawMetaData = this.pConn$.resolveConfigProps(this.pConn$.getRawMetadata().config);  
    this.showHighlightedData = rawMetaData?.showHighlightedData;

    if( this.showHighlightedData ){
      const highlightedData = rawMetaData?.highlightedData;
      this.highlightedDataArr = highlightedData.map(field => {
        field.config.displayMode = 'STACKED_LARGE_VAL';

        if (field.config.value === '@P .pyStatusWork') {
          field.type = 'TextInput';
          field.config.displayAsStatus = true;
        }

        return field;
      });
    }

    this.pConn$.setInheritedProp('displayMode', 'LABELS_LEFT');
    this.pConn$.setInheritedProp('readOnly', true);
    
    let kids = this.pConn$.getChildren();
    for (let kid of kids) {
      let pKid = kid.getPConnect();
      let pKidData = pKid.resolveConfigProps(pKid.getRawMetadata());
      if (kids.indexOf(kid) == 0) {
        this.arFields$ = pKidData.children;
      } else {
        this.arFields2$ = pKidData.children;
      }
    }
  }
}
