import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateModule } from '@angular/material-moment-adapter';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { DateBase } from '../../base/field/date/date.base';
import { getDateFormatInfo } from '../../../_helpers/date-format-utils';

class MyFormat {
  theDateFormat = getDateFormatInfo();

  get display() {
    return {
      dateInput: this.theDateFormat.dateFormatString,
      monthYearLabel: 'MMM YYYY',
      dateA11yLabel: 'LL',
      monthYearA11yLabel: 'MMMM YYYY'
    };
  }

  get parse() {
    return {
      dateInput: this.theDateFormat.dateFormatString
    };
  }
}

@Component({
  selector: 'app-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MomentDateModule,
    forwardRef(() => ComponentMapperComponent)
  ],
  providers: [{ provide: MAT_DATE_FORMATS, useClass: MyFormat }]
})
export class DateComponent extends DateBase {
  fieldOnDateChange(event: any) {
    // this comes from the date pop up
    const value = event?.target?.value.format('YYYY-MM-DD');

    this.onBlur(value);
  }
}
