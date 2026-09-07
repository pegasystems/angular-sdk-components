import { Directive, OnInit, OnDestroy, Injector, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';

@Directive()
export class DetailsTemplateBase implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

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

  processDetailFields(kid: any): any[] {
    const pKid = kid.getPConnect();
    const fields = pKid.getChildren();
    const processedFields: any[] = [];

    fields?.forEach(field => {
      const thePConn = field.getPConnect();
      const theCompType = thePConn.getComponentName().toLowerCase();
      if (theCompType === 'reference' || theCompType === 'group') {
        const configProps = thePConn.getConfigProps();
        configProps.readOnly = true;
        configProps.displayMode = 'DISPLAY_ONLY';
        const propToUse = { ...thePConn.getInheritedProps() };
        configProps.label = propToUse?.label;
        const options = {
          context: thePConn.getContextName(),
          pageReference: thePConn.getPageReference(),
          referenceList: thePConn.getReferenceList()
        };
        const viewContConfig = {
          meta: {
            ...thePConn.getMetadata(),
            type: theCompType,
            config: configProps
          },
          options
        };
        const theViewCont = PCore.createPConnect(viewContConfig);
        processedFields.push({
          type: theCompType,
          pConn: theViewCont?.getPConnect()
        });
      } else {
        processedFields.push({
          type: theCompType,
          config: thePConn.getConfigProps()
        });
      }
    });

    return processedFields;
  }
}
