import { Directive } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldBase } from './field.base';
import { handleEvent } from '../../../_helpers/event-util';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface TextAreaProps extends PConnFieldProps {
  // If any, enter additional props that only exist on TextArea here
  fieldMetadata?: any;
}

@Directive()
export class TextAreaBase extends FieldBase {
  configProps$: TextAreaProps;
  override fieldControl = new FormControl('', null);

  nMaxLength$: number;

  /**
   * Updates the component's properties based on the configuration.
   */
  override updateSelf(): void {
    this.actionsApi = this.pConn$.getActionsApi();
    this.propName = this.pConn$.getStateProps().value;

    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as TextAreaProps;

    if (this.configProps$.value != undefined) {
      this.value$ = this.configProps$.value;
    }

    this.nMaxLength$ = this.pConn$.getFieldMetadata(this.pConn$.getRawConfigProps()?.value)?.maxLength || 100;
    this.testId = this.configProps$.testId;
    this.displayMode$ = this.configProps$.displayMode;
    this.label$ = this.configProps$.label;
    this.helperText = this.configProps$.helperText;
    this.bVisible$ = this.utils.getBooleanValue(this.configProps$.visibility);
    this.bRequired$ = this.utils.getBooleanValue(this.configProps$.required);
    this.bDisabled$ = this.utils.getBooleanValue(this.configProps$.disabled);
    this.bReadonly$ = this.utils.getBooleanValue(this.configProps$.readOnly);

    if (this.bDisabled$) {
      this.fieldControl.disable();
    } else {
      this.fieldControl.enable();
    }

    // trigger display of error message with field control
    if (this.angularPConnectData.validateMessage) {
      this.fieldControl.setErrors({ message: true });
      this.fieldControl.markAsTouched();
    }
  }

  /**
   * Clears error messages for the current property when a field changes.
   */
  fieldOnChange() {
    this.pConn$.clearErrorMessages({
      property: this.propName
    });
  }

  /**
   * Handles the blur event on a field.
   *
   * @param event The event object triggered by the blur action.
   */
  fieldOnBlur(event: any) {
    const value = event?.target?.value;
    handleEvent(this.actionsApi, 'changeNblur', this.propName, value);
  }
}
