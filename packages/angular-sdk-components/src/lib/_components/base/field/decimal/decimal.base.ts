import { Directive } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldBase } from '../field.base';
import { getCurrencyCharacters, getCurrencyOptions } from '../../../../_helpers/currency-utils';
import { format } from '../../../../_helpers/formatters';
import { PConnFieldProps } from '../../../../_types/PConnProps.interface';

interface DecimalProps extends PConnFieldProps {
  // If any, enter additional props that only exist on Decimal here
  currencyISOCode?: string;
  decimalPrecision?: number;
  showGroupSeparators?: string;
  formatter?: string;
}

@Directive()
export abstract class DecimalBase extends FieldBase {
  configProps$: DecimalProps;

  override fieldControl = new FormControl<number | null>(null, null);

  decimalSeparator: string;
  thousandSeparator: string;
  currencySymbol = '';
  decimalPrecision: number | undefined;
  formattedValue: any;
  suffix = '';

  /**
   * Updates the component's properties based on the resolved configuration.
   */
  override updateSelf(): void {
    // Resolve config properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as DecimalProps;

    // Update common properties
    this.updateComponentCommonProperties(this.configProps$);

    // updates decimal properties
    this.updateDecimalProperties(this.configProps$);

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
}
