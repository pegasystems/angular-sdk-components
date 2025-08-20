import { Directive } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldBase } from '../field.base';
import { handleEvent } from '../../../../_helpers/event-util';
import { PConnFieldProps } from '../../../../_types/PConnProps.interface';

interface PhoneProps extends PConnFieldProps {
  // If any, enter additional props that only exist on Phone here
}

@Directive()
export abstract class PhoneBase extends FieldBase {
  configProps$: PhoneProps;

  override fieldControl = new FormControl('', null);

  separateDialCode = false;
  afterBlur: boolean;

  /**
   * Updates the component's properties based on the configuration.
   */
  override updateSelf(): void {
    // Resolve config properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as PhoneProps;

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    // Extract and normalize the value property
    const { value } = this.configProps$;
    this.value$ = value;
    this.fieldControl.setValue(this.value$);
  }

  override onBlur(): void {
    const oldVal = this.value$ ?? '';
    const newVal = this.formGroup$.controls[this.controlName$].value;
    const isValueChanged = newVal?.toString() !== oldVal.toString();

    if (isValueChanged && newVal) {
      const value = this.formGroup$.controls[this.controlName$].value;
      handleEvent(this.actionsApi, 'changeNblur', this.propName, value);
    }
  }
}
