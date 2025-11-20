import { Component, OnInit, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import dayjs from 'dayjs';

import { FieldBase } from '../field.base';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { getDateFormatInfo } from '../../../_helpers/date-format-utils';
import { handleEvent } from '../../../_helpers/event-util';
import { DateFormatters } from '../../../_helpers/formatters/date';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface DateTimeProps extends PConnFieldProps {
  // If any, enter additional props that only exist on DateTime here
}

@Component({
  selector: 'app-date-time',
  templateUrl: './date-time.component.html',
  styleUrls: ['./date-time.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    forwardRef(() => ComponentMapperComponent)
  ]
})
export class DateTimeComponent extends FieldBase implements OnInit, OnDestroy {
  configProps$: DateTimeProps;

  stepHour = 1;
  stepMinute = 1;
  stepSecond = 1;
  public color = 'primary';
  formattedValue$: any;
  theDateFormat = getDateFormatInfo();
  timezone = PCore.getEnvironmentInfo()?.getTimeZone();
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

  /**
   * Updates the component when there are changes in the state.
   */
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

    if (['DISPLAY_ONLY', 'STACKED_LARGE_VAL'].includes(this.displayMode$)) {
      this.formattedValue$ = this.generateDateTime(this.value$);
    }
  }

  generateDateTime(sVal): string {
    if (!sVal) return '';
    if (sVal.length === 10) return this.utils.generateDate(sVal, 'Date-Long-Custom-YYYY');
    return this.utils.generateDateTime(sVal, 'DateTime-Long-YYYY-Custom');
  }

  fieldOnDateChange(event: any) {
    // this comes from the date pop up
    if (typeof event.value === 'object') {
      // convert date to pega "date" format
      const dateTime = dayjs(event.value?.toISOString());
      const timeZoneDateTime = (dayjs as any).tz(dateTime.format('YYYY-MM-DDTHH:mm:ss'), this.timezone);
      event.value = timeZoneDateTime && timeZoneDateTime.isValid() ? timeZoneDateTime.toISOString() : '';
    }
    handleEvent(this.actionsApi, 'changeNblur', this.propName, event.value);
  }
}
