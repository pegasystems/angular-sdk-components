import { Directive } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldBase } from '../field.base';
import { PConnFieldProps } from '../../../../_types/PConnProps.interface';
import { getCurrencyCharacters, getCurrencyOptions } from '../../../../_helpers/currency-utils';
import { format } from '../../../../_helpers/formatters';
import { handleEvent } from '../../../../_helpers/event-util';

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

  inputMode: any;
  decimalSeparator: string;
  thousandSeparator: string;
  currencySymbol = '';
  decimalPrecision: number | undefined;
  formattedValue: any;

  /**
   * Updates the component's properties based on the resolved configuration.
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
    this.decimalPrecision = this.configProps$?.decimalPrecision ?? 2;
  }

  /**
   * Handles the blur event on a field.
   *
   * @param event The blur event.
   */
  override fieldOnBlur(event: any) {
    // Get the value from the event target.
    let value = event?.target?.value;

    // Remove thousand separators.
    if (this.configProps$.showGroupSeparators) {
      const thousandSep = this.thousandSeparator === '.' ? '\\.' : this.thousandSeparator;
      const regExp = new RegExp(String.raw`${thousandSep}`, 'g');
      value = value?.replace(regExp, '');
    }

    // Replace decimal separators with '.'.
    if (this.decimalSeparator !== '.') {
      const regExp = new RegExp(String.raw`${this.decimalSeparator}`, 'g');
      value = value.replace(regExp, '.');
    }

    // Handle the change and blur event.
    handleEvent(this.actionsApi, 'changeNblur', this.propName, value);
  }
}
