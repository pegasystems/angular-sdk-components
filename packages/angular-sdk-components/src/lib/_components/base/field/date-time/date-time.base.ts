import { Directive, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import dayjs from 'dayjs';

import { FieldBase } from '../field.base';
import { getDateFormatInfo } from '../../../../_helpers/date-format-utils';
import { PConnFieldProps } from '../../../../_types/PConnProps.interface';
import { DateFormatters } from '../../../../_helpers/formatters/date';
import { format } from '../../../../_helpers/formatters';

interface DateTimeProps extends PConnFieldProps {
  // If any, enter additional props that only exist on DateTime here
}

@Directive()
export abstract class DateTimeBase extends FieldBase implements OnInit {
  configProps$: DateTimeProps;
  formattedValue$: any;
  theDateFormat = getDateFormatInfo();
  timezone = PCore.getEnvironmentInfo()?.getTimeZone();

  override fieldControl = new FormControl('', null);
  override placeholder = `${this.theDateFormat.dateFormatStringLC}, hh:mm A`;

  override ngOnInit(): void {
    super.ngOnInit();

    if (this.formGroup$) {
      let dateTimeValue = this.value$ ?? '';

      if (this.value$) {
        dateTimeValue = dayjs(DateFormatters?.convertToTimezone(this.value$, { timezone: this.timezone }))?.toISOString();
      }
      this.fieldControl.setValue(dateTimeValue);
    }
  }

  override updateSelf(): void {
    // Resolve config properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as DateTimeProps;

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    // Extract the value property
    const { value } = this.configProps$;

    // Update component properties
    this.value$ = value;
    let dateTimeValue = value ?? '';
    if (this.value$) {
      dateTimeValue = dayjs(DateFormatters?.convertToTimezone(this.value$, { timezone: this.timezone }))?.toISOString();
    }
    this.fieldControl.setValue(dateTimeValue);

    if (this.displayMode$ === 'DISPLAY_ONLY' || this.displayMode$ === 'STACKED_LARGE_VAL') {
      this.formattedValue$ = format(this.value$, 'datetime', {
        format: `${this.theDateFormat.dateFormatString} hh:mm A`
      });
    }
  }
}
