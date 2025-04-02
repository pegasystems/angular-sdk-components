import { Directive } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldBase } from './field.base';
import { format } from '../../../_helpers/formatters';
import { getDateFormatInfo } from '../../../_helpers/date-format-utils';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface DateProps extends PConnFieldProps {
  // If any, enter additional props that only exist on Date here
}

@Directive()
export class DateBase extends FieldBase {
  configProps$: DateProps;

  override fieldControl = new FormControl('', null);

  // and then update, as needed, based on locale, etc.
  theDateFormat = getDateFormatInfo();
  formattedValue$: any;

  /**
   * Updates the component's properties based on the configuration.
   */
  override updateSelf(): void {
    // Resolve config properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as DateProps;

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    // Extract and normalize the value property
    const { value } = this.configProps$;
    this.value$ = value;

    // Format value for display modes
    if (['DISPLAY_ONLY', 'STACKED_LARGE_VAL'].includes(this.displayMode$)) {
      this.formattedValue$ = format(this.value$, 'date', {
        format: this.theDateFormat.dateFormatString
      });
    }
  }
}
