import { Directive, inject, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AngularPConnectData, AngularPConnectService } from '../../../../_bridge/angular-pconnect';
import { ReferenceComponent } from '../../../infra/reference/reference.component';
import { PConnFieldProps } from '../../../../_types/PConnProps.interface';

interface GroupProps extends PConnFieldProps {
  // If any, enter additional props that only exist on Group here
  showHeading: boolean;
  heading: string;
  instructions: string;
  collapsible: boolean;
}

@Directive()
export class GroupBase implements OnInit {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  protected angularPConnect = inject(AngularPConnectService);

  // Used with AngularPConnect
  angularPConnectData: AngularPConnectData = {};
  configProps$: GroupProps;

  arChildren$: any[];
  visibility$?: boolean;
  showHeading$?: boolean;
  heading$: string;
  instructions$: string;
  collapsible$: boolean;

  ngOnInit(): void {
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);

    this.checkAndUpdate();
  }

  // Callback passed when subscribing to store change
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

  updateSelf(): void {
    // Resolve configuration properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as GroupProps;

    this.arChildren$ = ReferenceComponent.normalizePConnArray(this.pConn$.getChildren());
    this.visibility$ = this.configProps$.visibility;
    this.showHeading$ = this.configProps$.showHeading;
    this.heading$ = this.configProps$.heading;
    this.instructions$ = this.configProps$.instructions;
    this.collapsible$ = this.configProps$.collapsible;

    if (this.configProps$.visibility === undefined) {
      this.visibility$ = this.pConn$.getComputedVisibility();
    }

    if (this.configProps$.displayMode === 'DISPLAY_ONLY') {
      if (this.configProps$.visibility === undefined) this.visibility$ = true;

      this.arChildren$.forEach(child => {
        const pConn = child.getPConnect();
        pConn.setInheritedProp('displayMode', 'DISPLAY_ONLY');
        pConn.setInheritedProp('readOnly', true);

        return child;
      });
    }
  }
}
