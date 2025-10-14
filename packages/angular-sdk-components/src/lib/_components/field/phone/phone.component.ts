import { Component, OnInit, Input, ChangeDetectorRef, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { interval } from 'rxjs';
import { MatTelInput } from 'mat-tel-input';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { Utils } from '../../../_helpers/utils';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { handleEvent } from '../../../_helpers/event-util';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface PhoneProps extends PConnFieldProps {
  // If any, enter additional props that only exist on Phone here
}

@Component({
  selector: 'app-phone',
  templateUrl: './phone.component.html',
  styleUrls: ['./phone.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatTelInput, forwardRef(() => ComponentMapperComponent)]
})
export class PhoneComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  // Used with AngularPConnect
  angularPConnectData: AngularPConnectData = {};
  configProps$: PhoneProps;

  label$ = '';
  value$: string;
  bRequired$ = false;
  bReadonly$ = false;
  bDisabled$ = false;
  bVisible$ = true;
  displayMode$?: string = '';
  controlName$: string;
  bHasForm$ = true;
  testId: string;
  helperText: string;
  placeholder: string;

  fieldControl = new FormControl('', null);

  actionsApi: object;
  propName: string;
  preferredCountries: string[] = ['us'];

  constructor(
    private angularPConnect: AngularPConnectService,
    private cdRef: ChangeDetectorRef,
    private utils: Utils
  ) {}

  ngOnInit(): void {
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
      this.fieldControl.setValue(this.value$);
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
    // moved this from ngOnInit() and call this from there instead...
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as PhoneProps;

    this.label$ = this.configProps$.label;
    this.displayMode$ = this.configProps$.displayMode;
    this.testId = this.configProps$.testId;
    if (this.configProps$.value != undefined) {
      this.value$ = this.configProps$.value;
      this.fieldControl.setValue(this.value$);
      this.updatePreferredCountries();
    }
    this.helperText = this.configProps$.helperText;
    this.placeholder = this.configProps$.placeholder || '';
    this.actionsApi = this.pConn$.getActionsApi();
    this.propName = this.pConn$.getStateProps().value;

    // timeout and detectChanges to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      if (this.configProps$.required != null) {
        this.bRequired$ = this.utils.getBooleanValue(this.configProps$.required);
      }
      this.cdRef.detectChanges();
    });

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

    // trigger display of error message with field control
    if (this.angularPConnectData.validateMessage != null && this.angularPConnectData.validateMessage != '') {
      const timer = interval(100).subscribe(() => {
        this.fieldControl.setErrors({ message: true });
        this.fieldControl.markAsTouched();

        timer.unsubscribe();
      });
    }
  }

  fieldOnBlur() {
    // 'blur' isn't getting fired
  }

  fieldOnChange() {
    const oldVal = this.value$ ?? '';
    const newVal = this.formGroup$.controls[this.controlName$].value;
    const isValueChanged = newVal?.toString() !== oldVal.toString();

    if (isValueChanged && newVal) {
      const value = this.formGroup$.controls[this.controlName$].value;
      handleEvent(this.actionsApi, 'changeNblur', this.propName, value);
    }
  }

  updatePreferredCountries() {
    if (this.value$ && typeof this.value$ === 'string') {
      const phoneNumber = parsePhoneNumberFromString(this.value$);
      this.preferredCountries =
        phoneNumber?.country && !this.preferredCountries.includes(phoneNumber?.country.toLowerCase())
          ? [phoneNumber?.country?.toLowerCase(), ...this.preferredCountries]
          : this.preferredCountries;
    }
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
      errMessage = 'Invalid Phone';
    }

    return errMessage;
  }
}
