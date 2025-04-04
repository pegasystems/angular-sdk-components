import { Directive } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldBase } from '../field.base';
import { PConnFieldProps } from '../../../../_types/PConnProps.interface';
import { getDateFormatInfo } from '../../../../_helpers/date-format-utils';
import { format } from '../../../../_helpers/formatters';

interface DateTimeProps extends PConnFieldProps {
  // If any, enter additional props that only exist on DateTime here
}

@Directive()
export abstract class DateTimeBase extends FieldBase {
  configProps$: DateTimeProps;

  theDateFormat = getDateFormatInfo();
  formattedValue$: any;

  override fieldControl = new FormControl('', null);
  override placeholder = `${this.theDateFormat.dateFormatStringLC}, hh:mm A`;

  /**
   * Updates the component's properties based on the configuration.
   */
  override updateSelf(): void {
    // Resolve configuration properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as DateTimeProps;

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    // Extract the value property
    const { value } = this.configProps$;

    // Update component properties
    this.value$ = value;
    this.fieldControl.setValue(this.value$);

    // Format value for display modes
    if (['DISPLAY_ONLY', 'STACKED_LARGE_VAL'].includes(this.displayMode$)) {
      this.formattedValue$ = format(this.value$, 'datetime', {
        format: `${this.theDateFormat.dateFormatString} hh:mm A`
      });
    }
  }
}
