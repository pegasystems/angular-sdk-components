import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@danielmoncada/angular-datetime-picker';

import { ComponentMapperComponent, DateTimeBase, handleEvent } from '@pega/angular-sdk-components';

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
export class DateTimeComponent extends DateTimeBase {
  /**
   * Handles the date change event from the date popup.
   * Converts the date to "date" format and triggers a change and blur event.
   *
   * @param {any} event - The event object from the date popup.
   */
  fieldOnDateChange(event: any) {
    // Check if the event value is an object (i.e., a Date object)
    if (typeof event.value === 'object') {
      // Convert the Date object to "date" format (ISOString)
      event.value = event.value?.toISOString();
    }
    // Trigger a change and blur event with the updated value
    handleEvent(this.actionsApi, 'changeNblur', this.propName, event.value);
  }
}
