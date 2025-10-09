import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { FieldBase } from '../field.base';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { handleEvent } from '../../../_helpers/event-util';
import { format } from '../../../_helpers/formatters';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface TimeProps extends PConnFieldProps {
  // If any, enter additional props that only exist on Time here
}

@Component({
  selector: 'app-time',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, forwardRef(() => ComponentMapperComponent)]
})
export class TimeComponent extends FieldBase {
  configProps$: TimeProps;
  formattedValue$: any;

  /**
   * Updates the component when there are changes in the state.
   */
  override updateSelf(): void {
    // Resolve config properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as TimeProps;

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    // Extract the value property
    const { value } = this.configProps$;
    this.value$ = value;

    if (['DISPLAY_ONLY', 'STACKED_LARGE_VAL'].includes(this.displayMode$)) {
      this.formattedValue$ = format(this.value$, 'timeonly', {
        format: 'hh:mm A'
      });
    }
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
    const isValueChanged = event?.target?.value.toString() !== oldVal.toString();

    if (isValueChanged) {
      let value = event?.target?.value;
      const hhmmPattern = /^\d{2}:\d{2}$/;
      if (hhmmPattern.test(value)) {
        value = `${value}:00`; // append ":00"
      }

      handleEvent(this.actionsApi, 'changeNblur', this.propName, value);
    }
  }
}
