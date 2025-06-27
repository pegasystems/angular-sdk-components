import { Directive, OnInit, OnDestroy, Injector, Input } from '@angular/core';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';

@Directive()
export class DetailsTemplateBase implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;

  // For interaction with AngularPConnect
  protected angularPConnectData: AngularPConnectData = {};
  protected angularPConnect;

  childrenMetadataOld;

  constructor(injector: Injector) {
    this.angularPConnect = injector.get(AngularPConnectService);
  }

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);

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
    // Should always check the bridge to see if the component should update itself (re-render)
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);

    // Only call updateSelf when the component should update
    if (bUpdateSelf || this.hasRawMetadataChanged()) {
      this.updateSelf();
    }
  }

  // this method will get overriden by the child component
  updateSelf() {}

  hasRawMetadataChanged(): boolean {
    const newChildrenMetadata = this.fetchChildrenMetadata();

    if (!PCore.isDeepEqual(newChildrenMetadata, this.childrenMetadataOld)) {
      this.childrenMetadataOld = newChildrenMetadata;
      return true;
    }

    return false;
  }

  fetchChildrenMetadata() {
    const children = this.pConn$.getChildren() || [];

    return children.map(child => {
      const pConnect = child.getPConnect();
      return pConnect.resolveConfigProps(pConnect.getRawMetadata());
    });
  }
}
