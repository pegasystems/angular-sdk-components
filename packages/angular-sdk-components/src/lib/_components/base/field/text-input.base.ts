import { Directive } from '@angular/core';

import { FieldBase } from './field.base';
import { handleEvent } from '../../../_helpers/event-util';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface TextInputProps extends PConnFieldProps {
  fieldMetadata?: any;
}

@Directive()
export class TextInputBase extends FieldBase {
  configProps$: TextInputProps;

  override value$ = '';

  testId = '';
  componentReference = '';
  helperText: string;
  placeholder: string;

  actionsApi: Object;
  propName: string;

  /**
   * Updates the component's properties based on the configuration.
   */
  override updateSelf(): void {
    this.actionsApi = this.pConn$.getActionsApi();
    this.componentReference = this.pConn$.getStateProps().value;
    this.propName = this.pConn$.getStateProps().value;

    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as TextInputProps;

    if (this.configProps$.value != undefined) {
      this.value$ = this.configProps$.value;
    }

    this.testId = this.configProps$.testId;
    this.label$ = this.configProps$.label;
    this.displayMode$ = this.configProps$.displayMode;

    this.helperText = this.configProps$.helperText;
    this.placeholder = this.configProps$.placeholder || '';
    this.bVisible$ = this.configProps$.visibility ? this.utils.getBooleanValue(this.configProps$.visibility) : true;
    this.bRequired$ = this.utils.getBooleanValue(this.configProps$.required);
    this.bDisabled$ = this.utils.getBooleanValue(this.configProps$.disabled);
    this.bReadonly$ = this.utils.getBooleanValue(this.configProps$.readOnly);

    if (this.bDisabled$) {
      this.fieldControl.disable();
    } else {
      this.fieldControl.enable();
    }

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
