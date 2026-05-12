import { Directive, OnDestroy } from '@angular/core';
import { AngularPConnectData } from '../../../_bridge/angular-pconnect';

@Directive()
export class FormTemplateBase implements OnDestroy {
  pConn$: any;
  angularPConnectData: AngularPConnectData;

  ngOnDestroy(): void {
    if (this.angularPConnectData?.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }
}
