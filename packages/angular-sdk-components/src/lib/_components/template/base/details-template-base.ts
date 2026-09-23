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

  children: any[] = [];
  propsToUse: any = {};
  showHighlightedData: boolean;
  highlightedDataArr: any = [];

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
    if (bUpdateSelf) {
      this.updateSelf();
    }
  }

  updateSelf() {
    this.updateDetailsProps();
  }

  fetchChildrenMetadata() {
    const children = this.pConn$.getChildren() || [];

    return children.map(child => {
      const pConnect = child.getPConnect();
      return pConnect.resolveConfigProps(pConnect.getRawMetadata());
    });
  }

  updateDetailsProps() {
    const { label, showLabel, showHighlightedData } = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());
    this.propsToUse = { label, showLabel, ...this.pConn$.getInheritedProps() };
    this.showHighlightedData = showHighlightedData;

    this.pConn$.setInheritedProp('displayMode', 'DISPLAY_ONLY');
    this.pConn$.setInheritedProp('readOnly', true);

    this.children = this.pConn$.getChildren() as any[];

    // Process highlighted fields for display in the highlighted section
    this.highlightedDataArr = this.processHighlightedFields();
  }

  processHighlightedFields(): any[] {
    if (!this.showHighlightedData) return [];

    const { highlightedData = [] } = (this.pConn$.getRawMetadata() as any).config;

    return (highlightedData ?? []).map(field => {
      field.config.displayMode = 'STACKED_LARGE_VAL';
      field.config.readOnly = true;

      if (field.config.value === '@P .pyStatusWork') {
        field.type = 'TextInput';
        field.config.displayAsStatus = true;
      }

      return this.pConn$.createComponent(field, '', 0, {}).getPConnect();
    });
  }
}
