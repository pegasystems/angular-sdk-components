import { Component, OnInit, Input, ChangeDetectorRef, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { interval } from 'rxjs';
import dayjs from 'dayjs';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { dateFormatInfoDefault, getDateFormatInfo } from '../../../_helpers/date-format-utils';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';
import { handleEvent } from '../../../_helpers/event-util';
import { format } from '../../../_helpers/formatters';
import { DateFormatters } from '../../../_helpers/formatters/date';

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
export class DateTimeComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  // Used with AngularPConnect
  angularPConnectData: AngularPConnectData = {};
  configProps$: DateTimeProps;

  label$ = '';
  value$: any;
  bRequired$ = false;
  bReadonly$ = false;
  bDisabled$ = false;
  bVisible$ = true;
  displayMode$?: string = '';
  controlName$: string;
  bHasForm$ = true;
  componentReference = '';
  testId = '';
  helperText: string;

  fieldControl = new FormControl('', null);
  stepHour = 1;
  stepMinute = 1;
  stepSecond = 1;
  public color = 'primary';
  // Start with default dateFormatInfo
  dateFormatInfo = dateFormatInfoDefault;
  // and then update, as needed, based on locale, etc.
  theDateFormat = getDateFormatInfo();
  placeholder: string;
  actionsApi: object;
  propName: string;
  formattedValue$: any;
  timezone = PCore.getEnvironmentInfo()?.getTimeZone();

  constructor(
    private angularPConnect: AngularPConnectService,
    private cdRef: ChangeDetectorRef,
    private utils: Utils
  ) {}

  ngOnInit(): void {
    this.placeholder = `${this.theDateFormat.dateFormatStringLC}, hh:mm A`;
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    this.controlName$ = this.angularPConnect.getComponentID(this);
    // Then, continue on with other initialization
    // call updateSelf when initializing
    // this.updateSelf();
    this.checkAndUpdate();

    if (this.formGroup$) {
      // add control to formGroup
      this.formGroup$.addControl(this.controlName$, this.fieldControl);
      let dateTimeValue = this.value$ ?? '';

      if (this.value$) {
        dateTimeValue = dayjs(DateFormatters?.convertToTimezone(this.value$, { timezone: this.timezone }))?.toISOString();
      }
      this.fieldControl.setValue(dateTimeValue);
      this.bHasForm$ = true;
    } else {
      this.bReadonly$ = true;
      this.bHasForm$ = false;
    }
  }

  ngOnDestroy(): void {
    if (this.formGroup$) {
      this.formGroup$.removeControl(this.controlName$);
    }
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  // Callback passed when subscribing to store change
  onStateChange() {
    this.checkAndUpdate();
  }

  checkAndUpdate() {
    // Should always check the bridge to see if the component should
    // update itself (re-render)
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);

    // ONLY call updateSelf when the component should update
    if (bUpdateSelf) {
      this.updateSelf();
    }
  }

  // updateSelf
  updateSelf(): void {
    // starting very simple...
    // moved this from ngOnInit() and call this from there instead...
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as DateTimeProps;

    this.label$ = this.configProps$.label;
    this.displayMode$ = this.configProps$.displayMode;
    this.testId = this.configProps$.testId;
    this.helperText = this.configProps$.helperText;
    this.value$ = this.configProps$?.value;
    let dateTimeValue = this.configProps$?.value ?? '';
    if (this.value$) {
      dateTimeValue = dayjs(DateFormatters?.convertToTimezone(this.value$, { timezone: this.timezone }))?.toISOString();
    }
    this.fieldControl.setValue(dateTimeValue);
    // timeout and detectChanges to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      if (this.configProps$.required != null) {
        this.bRequired$ = this.utils.getBooleanValue(this.configProps$.required);
      }
      this.cdRef.detectChanges();
    });

    if (this.displayMode$ === 'DISPLAY_ONLY' || this.displayMode$ === 'STACKED_LARGE_VAL') {
      this.formattedValue$ = format(this.value$, 'datetime', {
        format: `${this.theDateFormat.dateFormatString} hh:mm A`
      });
    }

    if (this.configProps$.visibility != null) {
      this.bVisible$ = this.utils.getBooleanValue(this.configProps$.visibility);
    }

    // disabled
    if (this.configProps$.disabled != undefined) {
      this.bDisabled$ = this.utils.getBooleanValue(this.configProps$.disabled);
    }

    if (this.bDisabled$) {
      this.fieldControl.disable();
    } else {
      this.fieldControl.enable();
    }

    if (this.configProps$.readOnly != null) {
      this.bReadonly$ = this.utils.getBooleanValue(this.configProps$.readOnly);
    }

    this.componentReference = this.pConn$.getStateProps().value;

    this.actionsApi = this.pConn$.getActionsApi();
    this.propName = this.pConn$.getStateProps().value;

    // trigger display of error message with field control
    if (this.angularPConnectData.validateMessage != null && this.angularPConnectData.validateMessage != '') {
      const timer = interval(100).subscribe(() => {
        this.fieldControl.setErrors({ message: true });
        this.fieldControl.markAsTouched();

        timer.unsubscribe();
      });
    }
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

  getErrorMessage() {
    let errMessage = '';
    // look for validation messages for json, pre-defined or just an error pushed from workitem (400)
    if (this.fieldControl.hasError('message')) {
      errMessage = this.angularPConnectData.validateMessage ?? '';
      return errMessage;
    }
    if (this.fieldControl.hasError('required')) {
      errMessage = 'You must enter a value';
    } else if (this.fieldControl.errors) {
      errMessage = this.fieldControl.errors.toString();
    }
    return errMessage;
  }
}
