import { Component, OnInit, Input, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { handleEvent } from '../../../_helpers/event-util';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface RichTextProps extends PConnFieldProps {
  // If any, enter additional props that only exist on RichText here
}

@Component({
  selector: 'app-rich-text',
  templateUrl: './rich-text.component.html',
  styleUrls: ['./rich-text.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, forwardRef(() => ComponentMapperComponent)]
})
export class RichTextComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  // Used with AngularPConnect
  angularPConnectData: AngularPConnectData = {};
  configProps$: RichTextProps;

  label$ = '';
  value$ = '';
  bRequired$ = false;
  bReadonly$ = false;
  bDisabled$ = false;
  bVisible$ = true;
  displayMode$?: string = '';
  controlName$: string;
  testId: string;
  helperText: string;
  placeholder: any;
  info: any;
  error: boolean;
  status: any;

  constructor(
    private angularPConnect: AngularPConnectService,
    private utils: Utils
  ) {}

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);

    // call updateSelf when initializing
    this.checkAndUpdate();
  }

  ngOnDestroy(): void {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
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

  // updateSelf
  updateSelf(): void {
    // moved this from ngOnInit() and call this from there instead...
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as RichTextProps;
    const stateProps: any = this.pConn$.getStateProps();
    this.status = stateProps?.status;

    if (this.configProps$.value != undefined) {
      this.value$ = this.configProps$.value;
    }

    this.testId = this.configProps$.testId;
    this.displayMode$ = this.configProps$.displayMode;
    this.label$ = this.configProps$.label;
    this.placeholder = this.configProps$.placeholder;
    this.info = stateProps?.validatemessage || this.configProps$.helperText;
    this.error = stateProps?.status === 'error';

    if (this.configProps$.required != null) {
      this.bRequired$ = this.utils.getBooleanValue(this.configProps$.required);
    }

    if (this.configProps$.visibility != null) {
      this.bVisible$ = this.utils.getBooleanValue(this.configProps$.visibility);
    }

    if (this.configProps$.disabled != undefined) {
      this.bDisabled$ = this.utils.getBooleanValue(this.configProps$.disabled);
    }

    if (this.configProps$.readOnly != null) {
      this.bReadonly$ = this.utils.getBooleanValue(this.configProps$.readOnly);
    }
  }

  fieldOnChange() {
    if (this.status === 'error') {
      const property = (this.pConn$.getStateProps() as any).value;
      this.pConn$.clearErrorMessages({
        property,
        category: '',
        context: ''
      });
    }
  }

  fieldOnBlur(editorValue: any) {
    // PConnect wants to use eventHandler for onBlur
    const actionsApi = this.pConn$?.getActionsApi();
    const propName = (this.pConn$?.getStateProps() as any).value;
    handleEvent(actionsApi, 'changeNblur', propName, editorValue);
  }
}
