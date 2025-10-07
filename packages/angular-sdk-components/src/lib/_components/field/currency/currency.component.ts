import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxCurrencyDirective, NgxCurrencyInputMode } from 'ngx-currency';

import { FieldBase } from '../field.base';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { handleEvent } from '../../../_helpers/event-util';
import { getCurrencyCharacters, getCurrencyOptions } from '../../../_helpers/currency-utils';
import { format } from '../../../_helpers/formatters';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface CurrrencyProps extends PConnFieldProps {
  // If any, enter additional props that only exist on Currency here
  currencyISOCode?: string;
  allowDecimals: boolean;
  formatter?: string;
}

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, NgxCurrencyDirective, forwardRef(() => ComponentMapperComponent)]
})
export class CurrencyComponent extends FieldBase {
  configProps$: CurrrencyProps;
  override fieldControl = new FormControl<number | null>(null, { updateOn: 'blur' });

  currencyOptions: object = {};
  currencySymbol: string;
  thousandSeparator: string;
  decimalSeparator: string;
  decimalPrecision: number | undefined;
  formattedValue: string;
  formatter;
  inputMode = NgxCurrencyInputMode.Natural;

  /**
   * Updates the component when there are changes in the state.
   */
  override updateSelf(): void {
    // Resolve configuration properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as CurrrencyProps;

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    // Extract and normalize the value property
    const { value } = this.configProps$;
    if (value) {
      this.value$ = typeof value === 'string' ? parseFloat(value) : value;
      this.fieldControl.setValue(this.value$);
    }

    // update currency properties
    this.updateCurrencyProperties(this.configProps$);
  }

  /**
   * Updates the currency properties
   *
   * @param {Object} configProps - Configuration properties.
   * @param {boolean} configProps.allowDecimals - Whether to allow decimal values.
   * @param {string} configProps.currencyISOCode - The ISO code of the currency.
   * @param {string} configProps.formatter - The formatter type (e.g., 'currency').
   */
  protected updateCurrencyProperties(configProps): void {
    const { allowDecimals, currencyISOCode = 'USD', formatter } = configProps;

    const theSymbols = getCurrencyCharacters(currencyISOCode);
    this.currencySymbol = theSymbols.theCurrencySymbol;
    this.thousandSeparator = theSymbols.theDigitGroupSeparator;
    this.decimalSeparator = theSymbols.theDecimalIndicator;
    this.decimalPrecision = allowDecimals ? 2 : 0;

    if (['DISPLAY_ONLY', 'STACKED_LARGE_VAL'].includes(this.displayMode$)) {
      this.formattedValue = format(this.value$, formatter ? formatter.toLowerCase() : 'currency', getCurrencyOptions(currencyISOCode));
    }
  }

  fieldOnBlur(event: any) {
    const oldVal = this.value$ ?? '';
    const isValueChanged = event.target.value.toString() !== oldVal.toString();

    if (isValueChanged) {
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
}
