import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxCurrencyDirective, NgxCurrencyInputMode } from 'ngx-currency';

import { FieldBase } from '../field.base';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { handleEvent } from '../../../_helpers/event-util';
import { getCurrencyCharacters, getCurrencyOptions } from '../../../_helpers/currency-utils';
import { format } from '../../../_helpers/formatters';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

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
export class DecimalComponent extends FieldBase {
  configProps$: DecimalProps;
  override fieldControl = new FormControl<number | null>(null, null);

  decimalSeparator: string;
  thousandSeparator: string;
  currencySymbol = '';
  decimalPrecision: number | undefined;
  formatter;
  formattedValue: any;
  inputMode: any = NgxCurrencyInputMode.Natural;
  suffix = '';

  /**
   * Updates the component when there are changes in the state.
   */
  override updateSelf(): void {
    // Resolve config properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as DecimalProps;

    // Update common properties
    this.updateComponentCommonProperties(this.configProps$);

    // Extract and normalize the value property
    const { value } = this.configProps$;
    if (value) {
      this.value$ = typeof value === 'string' ? parseFloat(value) : value;
      this.fieldControl.setValue(this.value$);
    }

    // updates decimal properties
    this.updateDecimalProperties(this.configProps$);
  }

  /**
   * Updates decimal properties based on the provided configuration.
   *
   * @param {Object} configProps - Configuration properties.
   * @param {string} configProps.currencyISOCode - ISO code of the currency.
   * @param {string} configProps.formatter - Formatter type (e.g., 'decimal', 'currency').
   * @param {boolean} configProps.showGroupSeparators - Whether to show group separators.
   */
  protected updateDecimalProperties(configProps): void {
    const { currencyISOCode = '', formatter, showGroupSeparators } = configProps;

    // Extract currency symbols and options
    const theSymbols = getCurrencyCharacters(currencyISOCode);
    this.decimalSeparator = theSymbols.theDecimalIndicator;
    this.thousandSeparator = showGroupSeparators ? theSymbols.theDigitGroupSeparator : '';

    const theCurrencyOptions = getCurrencyOptions(currencyISOCode);
    const formatterLower = formatter?.toLowerCase() || 'decimal';
    this.formattedValue = format(this.value$, formatterLower, theCurrencyOptions);

    if (this.bReadonly$ && formatter === 'Currency') {
      this.currencySymbol = theSymbols.theCurrencySymbol;
    }

    if (this.bReadonly$ && formatter === 'Percentage') {
      this.suffix = '%';
    }

    this.decimalPrecision = this.configProps$?.decimalPrecision ?? 2;
  }

  fieldOnBlur(event: any) {
    const oldVal = this.value$ ?? '';
    const isValueChanged = event.target.value.toString() !== oldVal.toString();

    if (isValueChanged) {
      const actionsApi = this.pConn$?.getActionsApi();
      const propName = this.pConn$?.getStateProps().value;
      let value = event?.target?.value;
      // replacing thousand separator with empty string as not required in api call
      if (this.configProps$.showGroupSeparators) {
        const thousandSep = this.thousandSeparator === '.' ? '\\.' : this.thousandSeparator;
        const regExp = new RegExp(String.raw`${thousandSep}`, 'g');
        value = value?.replace(regExp, '');
      }
      // replacing decimal separator with '.'
      if (this.decimalSeparator !== '.') {
        const regExp = new RegExp(String.raw`${this.decimalSeparator}`, 'g');
        value = value.replace(regExp, '.');
      }
      handleEvent(actionsApi, 'changeNblur', propName, value);
    }
  }
}
