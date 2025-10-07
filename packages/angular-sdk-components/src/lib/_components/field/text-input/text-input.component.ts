import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { FieldBase } from '../field.base';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { handleEvent } from '../../../_helpers/event-util';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface TextInputProps extends PConnFieldProps {
  // If any, enter additional props that only exist on TextInput here
  fieldMetadata?: any;
}

@Component({
  selector: 'app-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, forwardRef(() => ComponentMapperComponent)]
})
export class TextInputComponent extends FieldBase {
  configProps$: TextInputProps;

  /**
   * Updates the component when there are changes in the state.
   */
  override updateSelf(): void {
    // Resolve configuration properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as TextInputProps;

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    // Get and set component specific properties
    const { value } = this.configProps$;
    this.value$ = value;
  }

  fieldOnChange(event: any) {
    const oldVal = this.value$ ?? '';
    const isValueChanged = event.target.value.toString() !== oldVal.toString();

    if (isValueChanged) {
      this.pConn$.clearErrorMessages({
        property: this.propName
      });
    }
  }

  fieldOnBlur(event: any) {
    const oldVal = this.value$ ?? '';
    const isValueChanged = event.target.value.toString() !== oldVal.toString();

    if (isValueChanged) {
      const value = event?.target?.value;
      handleEvent(this.actionsApi, 'changeNblur', this.propName, value);
    }
  }
}
