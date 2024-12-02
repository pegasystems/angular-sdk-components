import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ReferenceComponent } from '../../infra/reference/reference.component';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface GroupProps extends PConnFieldProps {
  // If any, enter additional props that only exist on Group here
  showHeading: boolean;
  heading: string;
  instructions: string;
  collapsible: boolean;
}

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class GroupComponent implements OnInit {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  arChildren$: any[];
  visibility$?: boolean;
  showHeading$?: boolean;
  heading$: string;
  instructions$: string;
  collapsible$: boolean;

  // Used with AngularPConnect
  angularPConnectData: AngularPConnectData = {};
  configProps$: GroupProps;

  constructor(private angularPConnect: AngularPConnectService) {}

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
