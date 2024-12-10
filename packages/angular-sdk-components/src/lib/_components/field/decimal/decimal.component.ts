import { Component, OnInit, Input, ChangeDetectorRef, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxCurrencyDirective, NgxCurrencyInputMode } from 'ngx-currency';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { handleEvent } from '../../../_helpers/event-util';
import { getCurrencyCharacters, getCurrencyOptions } from '../../../_helpers/currency-utils';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';
import { format } from '../../../_helpers/formatters';

interface DecimalProps extends PConnFieldProps {
  // If any, enter additional props that only exist on Decimal here
  currencyISOCode?: string;
  decimalPrecision?: number;
  showGroupSeparators?: string;
  formatter?: string;
}

@Component({
  selector: 'app-decimal',
  templateUrl: './decimal.component.html',
  styleUrls: ['./decimal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgxCurrencyDirective,
    forwardRef(() => ComponentMapperComponent)
  ]
})
export class DecimalComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  // Used with AngularPConnect
  angularPConnectData: AngularPConnectData = {};
  configProps$: DecimalProps;

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
  testId: string;
  helperText: string;
  placeholder: string;

  fieldControl = new FormControl<number | null>(null, null);
  currDec: string;
  currSep: string;
  currSym: string;
  decimalPrecision: number | undefined;
  formatter;
  formattedValue: any;
  inputMode: any;

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
    // starting very simple...

    // moved this from ngOnInit() and call this from there instead...
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as DecimalProps;
    this.testId = this.configProps$.testId;
    this.label$ = this.configProps$.label;
    this.displayMode$ = this.configProps$.displayMode;
    this.inputMode = NgxCurrencyInputMode.Natural;
    let nValue: any = this.configProps$.value;
    if (nValue) {
      if (typeof nValue === 'string') {
        nValue = parseFloat(nValue);
      }
      this.value$ = nValue;
    }
    this.helperText = this.configProps$.helperText;
    this.placeholder = this.configProps$.placeholder || '';
    const showGroupSeparators = this.configProps$.showGroupSeparators;
    const currencyISOCode = this.configProps$?.currencyISOCode ?? '';

    const theSymbols = getCurrencyCharacters(currencyISOCode);
    this.currDec = theSymbols.theDecimalIndicator;
    this.currSep = showGroupSeparators ? theSymbols.theDigitGroupSeparator : '';

    const theCurrencyOptions = getCurrencyOptions(currencyISOCode);
    this.formatter = this.configProps$.formatter;

    if (this.formatter) {
      this.formattedValue = format(this.value$, this.formatter.toLowerCase(), theCurrencyOptions);
    } else {
      this.formattedValue = format(this.value$, 'decimal', theCurrencyOptions);
    }

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

    if (this.configProps$.readOnly != null) {
      this.bReadonly$ = this.utils.getBooleanValue(this.configProps$.readOnly);
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

    if (this.bReadonly$ && this.formatter === 'Currency') {
      this.currSym = theSymbols.theCurrencySymbol;
    } else {
      this.currSym = '';
    }
    this.decimalPrecision = this.configProps$?.decimalPrecision ?? 2;

    this.componentReference = this.pConn$.getStateProps().value;
  }

  fieldOnBlur(event: any) {
    const actionsApi = this.pConn$?.getActionsApi();
    const propName = this.pConn$?.getStateProps().value;
    let value = event?.target?.value;
    if (this.currSep === ',') {
      value = value.replace(/,/g, '');
    } else {
      value = value?.replace(/\./g, '');
      value = value?.replace(/,/g, '.');
    }
    handleEvent(actionsApi, 'changeNblur', propName, value);
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
