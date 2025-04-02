import { Directive, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';
import { handleEvent } from '../../../_helpers/event-util';

@Directive()
export class FieldBase implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  protected angularPConnect = inject(AngularPConnectService);
  protected utils = inject(Utils);

  protected angularPConnectData: AngularPConnectData = {};

  controlName$: string;
  fieldControl;

  actionsApi: Object;
  propName: string;

  testId: string;
  helperText: string;
  placeholder: string;

  bHasForm$ = true;
  value$: any = '';
  label$ = '';
  bRequired$ = false;
  bReadonly$ = false;
  bDisabled$ = false;
  bVisible$ = true;
  displayMode$ = '';

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange.bind(this));
    this.controlName$ = this.angularPConnect.getComponentID(this);

    // call checkAndUpdate
    this.checkAndUpdate();

    if (this.formGroup$) {
      this.formGroup$.addControl(this.controlName$, this.fieldControl);
      this.fieldControl.setValue(this.value$);
      this.bHasForm$ = true;
    } else {
      this.bReadonly$ = true;
      this.bHasForm$ = false;
    }

    this.actionsApi = this.pConn$.getActionsApi();
    this.propName = this.pConn$.getStateProps().value;
  }

  ngOnDestroy(): void {
    if (this.formGroup$) {
      this.formGroup$.removeControl(this.controlName$);
    }

    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  // Callback passed when subscribing to store change
  onStateChange() {
    this.checkAndUpdate();
  }

  // Should always check the bridge to see if the component should update itself (re-render)
  checkAndUpdate() {
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);

    // ONLY call updateSelf when the component should update
    if (bUpdateSelf) {
      this.updateSelf();
    }
  }

  updateSelf(): void {}

  /**
   * Clears error messages for the current property when a field changes.
   */
  fieldOnChange(): void {
    this.pConn$.clearErrorMessages({
      property: this.propName
    });
  }

  /**
   * Handles the blur event on a field.
   *
   * @param event The event object triggered by the blur action.
   */
  fieldOnBlur(event: any): void {
    const value = event?.target?.value;
    handleEvent(this.actionsApi, 'changeNblur', this.propName, value);
  }

  /**
   * Updates the component's common properties based on the provided configuration.
   *
   * @param configProps The configuration properties to update.
   */
  protected updateComponentCommonProperties(configProps) {
    // Extract properties from config
    const { testId, label, displayMode = '', helperText, placeholder, required, visibility = true, disabled, readOnly } = configProps;

    // Update component properties
    this.testId = testId;
    this.label$ = label;
    this.displayMode$ = displayMode;
    this.helperText = helperText;
    this.placeholder = placeholder || '';

    // Convert boolean properties
    this.bVisible$ = this.utils.getBooleanValue(visibility);
    this.bRequired$ = this.utils.getBooleanValue(required);
    this.bDisabled$ = this.utils.getBooleanValue(disabled);
    this.bReadonly$ = this.utils.getBooleanValue(readOnly);

    // Enable or disable field control
    this.fieldControl[this.bDisabled$ ? 'disable' : 'enable']();

    // Display error message if validation message exists
    this.displayValidationMessage();
  }

  /**
   * Displays the validation message if it exists.
   */
  private displayValidationMessage(): void {
    if (this.angularPConnectData.validateMessage) {
      setTimeout(() => {
        this.fieldControl.setErrors({ message: true });
        this.fieldControl.markAsTouched();
      }, 100);
    }
  }

  /**
   * Retrieves the error message for the current field control.
   *
   * @returns The error message, or an empty string if no error is found.
   */
  getErrorMessage() {
    // look for validation messages for json, pre-defined or just an error pushed from workitem (400)
    if (this.fieldControl.hasError('message')) {
      return this.angularPConnectData.validateMessage ?? '';
    }

    if (this.fieldControl.hasError('required')) {
      return 'You must enter a value';
    }

    return this.fieldControl.errors?.toString() ?? '';
  }
}
