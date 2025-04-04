import { Directive } from '@angular/core';
import { FormControl } from '@angular/forms';

import { FieldBase } from '../field.base';
import { format } from '../../../../_helpers/formatters';
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

    // Update component properties
    this.value$ = value;

    if (this.displayMode$ === 'DISPLAY_ONLY' || this.displayMode$ === 'STACKED_LARGE_VAL') {
      this.formattedValue$ = format(this.value$, 'timeonly', {
        format: 'hh:mm A'
      });
    }
  }
}
