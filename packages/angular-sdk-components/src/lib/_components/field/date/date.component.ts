import { Component, OnInit, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateModule } from '@angular/material-moment-adapter';

import { FieldBase } from '../field.base';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { getDateFormatInfo } from '../../../_helpers/date-format-utils';
import { format } from '../../../_helpers/formatters';
import { handleEvent } from '../../../_helpers/event-util';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface DateProps extends PConnFieldProps {
  // If any, enter additional props that only exist on Date here
}

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
export class DateComponent extends FieldBase implements OnInit, OnDestroy {
  configProps$: DateProps;

  theDateFormat = getDateFormatInfo();
  formattedValue$: any;

  /**
   * Updates the component when there are changes in the state.
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

  fieldOnDateChange(event: any) {
    // this comes from the date pop up
    const value = event?.target?.value.format('YYYY-MM-DD');
    handleEvent(this.actionsApi, 'changeNblur', this.propName, value);
    this.pConn$.clearErrorMessages({
      property: this.propName
    });
  }

  hasErrors() {
    return this.fieldControl.status === 'INVALID';
  }

  override getErrorMessage() {
    // look for validation messages for json, pre-defined or just an error pushed from workitem (400)
    if (this.fieldControl.hasError('message')) {
      return this.angularPConnectData.validateMessage ?? '';
    }

    if (this.fieldControl.hasError('required')) {
      return 'You must enter a value';
    }

    if (this.fieldControl.errors) {
      return `${this.fieldControl.errors['matDatepickerParse'].text} is not a valid date value`;
    }

    return '';
  }
}
