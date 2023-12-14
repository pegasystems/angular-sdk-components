import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-multi-reference-readonly',
  templateUrl: './multi-reference-readonly.component.html',
  styleUrls: ['./multi-reference-readonly.component.scss'],
  standalone: true,
  imports: [forwardRef(() => ComponentMapperComponent)]
})
export class MultiReferenceReadonlyComponent implements OnInit {
  constructor(private angularPConnect: AngularPConnectService) {}

  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  angularPConnectData: AngularPConnectData = {};
  configProps$: any;
  label: string;

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    this.updateSelf();
  }

  ngOnDestroy(): void {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  onStateChange() {
    // Should always check the bridge to see if the component should
    // update itself (re-render)
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);
    // ONLY call updateSelf when the component should update
    if (bUpdateSelf) {
      this.updateSelf();
    }
  }

  updateSelf() {
    this.configProps$ = this.pConn$.getConfigProps();
    this.label = this.configProps$['label'];
  }
}
