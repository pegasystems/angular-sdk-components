import { Directive } from '@angular/core';
import { FormControl } from '@angular/forms';

import { FieldBase } from '../field.base';
import { format } from '../../../../_helpers/formatters';
import { handleEvent } from '../../../../_helpers/event-util';
import { PConnFieldProps } from '../../../../_types/PConnProps.interface';

interface TimeProps extends PConnFieldProps {
  // If any, enter additional props that only exist on Time here
}

@Directive()
export class TimeBase extends FieldBase {
  configProps$: TimeProps;

  override fieldControl = new FormControl('', null);

  formattedValue$: any;

  /**
   * Updates the component's properties based on the configuration.
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

  override onBlur(value: any): void {
    const oldVal = this.value$ ?? '';
    const isValueChanged = value.toString() !== oldVal.toString();

    if (isValueChanged) {
      const hhmmPattern = /^\d{2}:\d{2}$/;
      if (hhmmPattern.test(value)) {
        value = `${value}:00`; // append ":00"
      }

      handleEvent(this.actionsApi, 'changeNblur', this.propName, value);
    }
  }
}
