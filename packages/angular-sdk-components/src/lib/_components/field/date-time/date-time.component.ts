import { Component, OnInit, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import dayjs from 'dayjs';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { DateTimeBase } from '../../base/field/date-time/date-time.base';

@Component({
  selector: 'app-date-time',
  templateUrl: './date-time.component.html',
  styleUrls: ['./date-time.component.scss'],
  standalone: true,
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
export class DateTimeComponent extends DateTimeBase implements OnInit, OnDestroy {
  fieldOnDateChange(event: any) {
    // this comes from the date pop up
    if (typeof event.value === 'object') {
      // convert date to pega "date" format
      const dateTime = dayjs(event.value?.toISOString());
      const timeZoneDateTime = (dayjs as any).tz(dateTime.format('YYYY-MM-DDTHH:mm:ss'), this.timezone);
      event.value = timeZoneDateTime && timeZoneDateTime.isValid() ? timeZoneDateTime.toISOString() : '';
    }

    this.onBlur(event.value);
  }
}
