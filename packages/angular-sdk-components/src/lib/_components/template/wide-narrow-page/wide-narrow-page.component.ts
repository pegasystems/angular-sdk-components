import { Component, OnInit, Input, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-wide-narrow-page',
  templateUrl: './wide-narrow-page.component.html',
  styleUrls: ['./wide-narrow-page.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class WideNarrowPageComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  thePConnType: string | undefined = '';

  // Used with AngularPConnect
  angularPConnectData: AngularPConnectData = {};

  constructor(private angularPConnect: AngularPConnectService) {}

  ngOnInit(): void {
    // normalize the pConn$ in case the incoming pConn$ is a 'reference'
    // this.pConn$ = ReferenceComponent.normalizePConn(this.pConn$);

    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);

    // this.updateSelf();
    this.checkAndUpdate();
  }

  ngOnDestroy(): void {
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
    // console.log(`WideNarrowPage: updateSelf`);

    this.thePConnType = this.pConn$.getComponentName();
  }
}
