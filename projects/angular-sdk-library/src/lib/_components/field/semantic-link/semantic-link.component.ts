import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { Utils } from '../../../_helpers/utils';
import { PConnFieldProps } from '../../../_types/PConnProps';

interface SemanticLinkProps extends PConnFieldProps {
  // If any, enter additional props that only exist on SemanticLink here
  text: string;
}

@Component({
  selector: 'app-semantic-link',
  templateUrl: './semantic-link.component.html',
  styleUrls: ['./semantic-link.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class SemanticLinkComponent implements OnInit {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  angularPConnectData: AngularPConnectData = {};
  configProps$: SemanticLinkProps;

  label$: string = '';
  value$: string = '';
  displayMode$?: string = '';
  bVisible$: boolean = true;

  constructor(
    private angularPConnect: AngularPConnectService,
    private utils: Utils
  ) {}

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
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as SemanticLinkProps;
    this.value$ = this.configProps$.text || '---';
    this.displayMode$ = this.configProps$.displayMode;
    this.label$ = this.configProps$.label;
    if (this.configProps$.visibility) {
      this.bVisible$ = this.utils.getBooleanValue(this.configProps$.visibility);
    }
  }
}
