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

  inputMode: any;
  currencySymbol: string;
  thousandSeparator: string;
  decimalSeparator: string;
  decimalPrecision: number | undefined;
  formattedValue: string;

  /**
   * Updates the component's properties based on the configuration.
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

  /**
   * Handles the blur event on a field, formatting the value and triggering a change and blur action.
   *
   * @param event The blur event.
   */
  override fieldOnBlur(event: any) {
    // Get the value from the event target, removing the first character.
    const value = event?.target?.value?.substring(1);

    // Remove the thousand separator from the value.
    const thousandSep = this.thousandSeparator === '.' ? '\\.' : this.thousandSeparator;
    const thousandSeparatorRegex = new RegExp(String.raw`${thousandSep}`, 'g');
    const valueWithoutThousandSeparator = value?.replace(thousandSeparatorRegex, '');

    // Replace the decimal separator with '.' if it's not already '.'.
    const decimalSeparatorRegex = new RegExp(String.raw`${this.decimalSeparator}`, 'g');
    const formattedValue =
      this.decimalSeparator !== '.' ? valueWithoutThousandSeparator.replace(decimalSeparatorRegex, '.') : valueWithoutThousandSeparator;

    // Trigger the change and blur action with the formatted value.
    handleEvent(this.actionsApi, 'changeNblur', this.propName, formattedValue);
  }
}
