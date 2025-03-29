import { Directive } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldBase } from './field.base';
import { getCurrencyCharacters, getCurrencyOptions } from '../../../_helpers/currency-utils';
import { format } from '../../../_helpers/formatters';
import { handleEvent } from '../../../_helpers/event-util';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface CurrrencyProps extends PConnFieldProps {
  // If any, enter additional props that only exist on Currency here
  currencyISOCode?: string;
  allowDecimals: boolean;
  formatter?: string;
}

@Directive()
export class CurrencyBase extends FieldBase {
  configProps$: CurrrencyProps;

  override fieldControl = new FormControl<number | null>(null, { updateOn: 'blur' });

  currencySymbol: string;
  thousandSeparator: string;
  decimalSeparator: string;
  inputMode: any;
  decimalPrecision: number | undefined;
  formattedValue: string;

  // updateSelf
  override updateSelf(): void {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as CurrrencyProps;
    this.testId = this.configProps$.testId;
    this.label$ = this.configProps$.label;
    this.displayMode$ = this.configProps$.displayMode;
    let nValue: any = this.configProps$.value;
    if (nValue) {
      if (typeof nValue === 'string') {
        nValue = parseFloat(nValue);
      }
      this.value$ = nValue;
    }
    this.helperText = this.configProps$.helperText;
    this.placeholder = this.configProps$.placeholder || '';

    this.bRequired$ = this.utils.getBooleanValue(this.configProps$.required);
    this.bVisible$ = this.utils.getBooleanValue(this.configProps$.visibility);
    this.bDisabled$ = this.utils.getBooleanValue(this.configProps$.disabled);
    this.bReadonly$ = this.utils.getBooleanValue(this.configProps$.readOnly);

    const currencyISOCode = this.configProps$?.currencyISOCode ?? '';

    const theSymbols = getCurrencyCharacters(currencyISOCode);
    this.currencySymbol = theSymbols.theCurrencySymbol;
    this.thousandSeparator = theSymbols.theDigitGroupSeparator;
    this.decimalSeparator = theSymbols.theDecimalIndicator;

    const formatter = this.configProps$.formatter;
    if (this.displayMode$ === 'DISPLAY_ONLY' || this.displayMode$ === 'STACKED_LARGE_VAL') {
      const theCurrencyOptions = getCurrencyOptions(currencyISOCode);
      if (formatter) {
        this.formattedValue = format(this.value$, formatter.toLowerCase(), theCurrencyOptions);
      } else {
        this.formattedValue = format(this.value$, 'currency', theCurrencyOptions);
      }
    }

    this.decimalPrecision = this.configProps$?.allowDecimals ? 2 : 0;

    if (this.bDisabled$) {
      this.fieldControl.disable();
    } else {
      this.fieldControl.enable();
    }

    // trigger display of error message with field control
    if (this.angularPConnectData.validateMessage != null && this.angularPConnectData.validateMessage != '') {
      this.fieldControl.setErrors({ message: true });
      this.fieldControl.markAsTouched();
    }
  }

  fieldOnBlur(event: any) {
    const actionsApi = this.pConn$?.getActionsApi();
    const propName = this.pConn$?.getStateProps().value;
    let value = event?.target?.value;
    value = value?.substring(1);
    // replacing thousand separator with empty string as not required in api call
    const thousandSep = this.thousandSeparator === '.' ? '\\.' : this.thousandSeparator;
    let regExp = new RegExp(String.raw`${thousandSep}`, 'g');
    value = value?.replace(regExp, '');
    // replacing decimal separator with '.'
    if (this.decimalSeparator !== '.') {
      regExp = new RegExp(String.raw`${this.decimalSeparator}`, 'g');
      value = value.replace(regExp, '.');
    }
    handleEvent(actionsApi, 'changeNblur', propName, value);
  }
}
