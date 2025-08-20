import { Directive } from '@angular/core';
import { FormControl } from '@angular/forms';

import { FieldBase } from '../field.base';
import { getCurrencyCharacters, getCurrencyOptions } from '../../../../_helpers/currency-utils';
import { format } from '../../../../_helpers/formatters';
import { PConnFieldProps } from '../../../../_types/PConnProps.interface';

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

  currencyISOCode = 'USD';
  currencyOptions: Object = {};

  currencySymbol: string;
  thousandSeparator: string;
  decimalSeparator: string;
  decimalPrecision: number | undefined;
  formattedValue: string;
  formatter;

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
    const { allowDecimals, currencyISOCode = '', formatter } = configProps;

    const theSymbols = getCurrencyCharacters(currencyISOCode);
    this.currencySymbol = theSymbols.theCurrencySymbol;
    this.thousandSeparator = theSymbols.theDigitGroupSeparator;
    this.decimalSeparator = theSymbols.theDecimalIndicator;
    this.decimalPrecision = allowDecimals ? 2 : 0;

    if (['DISPLAY_ONLY', 'STACKED_LARGE_VAL'].includes(this.displayMode$)) {
      this.formattedValue = format(this.value$, formatter ? formatter.toLowerCase() : 'currency', getCurrencyOptions(currencyISOCode));
    }
  }
}
