import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_FORMATS, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MomentDateModule } from '@angular/material-moment-adapter';

import { DateBase } from '../../base/field/date.base';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { getDateFormatInfo } from '../../../_helpers/date-format-utils';
import { handleEvent } from '../../../_helpers/event-util';

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
    handleEvent(this.actionsApi, 'changeNblur', this.propName, value);
    this.pConn$.clearErrorMessages({
      property: this.propName
    });
  }

  override getErrorMessage() {
    let errMessage = '';
    // look for validation messages for json, pre-defined or just an error pushed from workitem (400)
    if (this.fieldControl.hasError('message')) {
      errMessage = this.angularPConnectData.validateMessage ?? '';
      return errMessage;
    }
    if (this.fieldControl.hasError('required')) {
      errMessage = 'You must enter a value';
    } else if (this.fieldControl.errors) {
      errMessage = `${this.fieldControl.errors['matDatepickerParse'].text} is not a valid date value`;
    }
    return errMessage;
  }
}
