import { Directive, OnDestroy } from '@angular/core';
import { AngularPConnectData } from '../../../_bridge/angular-pconnect';

@Directive()
export class FormTemplateBase implements OnDestroy {
  pConn$: any;
  angularPConnectData: AngularPConnectData;

  ngOnDestroy(): void {
    PCore.getContextTreeManager().removeContextTreeNode(this.pConn$.getContextName());

    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }
}
