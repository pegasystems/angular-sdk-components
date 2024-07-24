import { Injector } from '@angular/core';
import { getPConnectOfActiveContainerItem } from './helper';
import { AngularPConnectData, AngularPConnectService } from 'packages/angular-sdk-components/src/public-api';

export class FlowContainerBaseComponent {
  // For interaction with AngularPConnect
  protected angularPConnectData: AngularPConnectData = {};
  protected angularPConnect;

  constructor(injector: Injector) {
    this.angularPConnect = injector.get(AngularPConnectService);
  }

  getPConnectOfActiveContainerItem(parentPConnect) {
    const routingInfo = this.angularPConnect.getComponentProp(this, 'routingInfo');
    const isAssignmentView = this.angularPConnect.getComponentProp(this, 'isAssignmentView');
    return getPConnectOfActiveContainerItem(routingInfo, {
      isAssignmentView,
      parentPConnect
    });
  }
}
