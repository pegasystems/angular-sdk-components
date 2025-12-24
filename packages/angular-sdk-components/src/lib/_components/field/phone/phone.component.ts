import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTelInput } from 'mat-tel-input';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

import { FieldBase } from '../field.base';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { handleEvent } from '../../../_helpers/event-util';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface PhoneProps extends PConnFieldProps {
  // If any, enter additional props that only exist on Phone here
}

@Component({
  selector: 'app-phone',
  templateUrl: './phone.component.html',
  styleUrls: ['./phone.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatTelInput, forwardRef(() => ComponentMapperComponent)]
})
export class PhoneComponent extends FieldBase {
  configProps$: PhoneProps;

  preferredCountries: string[] = ['us'];

  /**
   * Updates the component when there are changes in the state.
   */
  override updateSelf(): void {
    // Resolve config properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as PhoneProps;

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    // Extract and normalize the value property
    const { value } = this.configProps$;
    if (value) {
      this.value$ = value;
      this.fieldControl.setValue(this.value$);
      this.updatePreferredCountries();
    }
  }

  fieldOnBlur() {
    // 'blur' isn't getting fired
  }

  fieldOnChange() {
    const oldVal = this.value$ ?? '';
    const newVal = this.formGroup$.controls[this.controlName$].value;
    const isValueChanged = newVal?.toString() !== oldVal.toString();

    if (isValueChanged) {
      handleEvent(this.actionsApi, 'changeNblur', this.propName, newVal);
    }
  }

  updatePreferredCountries() {
    if (this.value$ && typeof this.value$ === 'string') {
      const phoneNumber = parsePhoneNumberFromString(this.value$);
      this.preferredCountries =
        phoneNumber?.country && !this.preferredCountries.includes(phoneNumber?.country.toLowerCase())
          ? [phoneNumber?.country?.toLowerCase(), ...this.preferredCountries]
          : this.preferredCountries;
    }
  }

  override getErrorMessage() {
    // look for validation messages for json, pre-defined or just an error pushed from workitem (400)
    if (this.fieldControl.hasError('message')) {
      return this.angularPConnectData.validateMessage ?? '';
    }

    if (this.fieldControl.hasError('required')) {
      return 'You must enter a value';
    }

    if (this.fieldControl.errors) {
      return 'Invalid Phone';
    }

    return '';
  }
}
