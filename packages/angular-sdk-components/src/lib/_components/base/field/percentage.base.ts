import { Directive } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldBase } from './field.base';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';
import { getCurrencyCharacters } from '../../../_helpers/currency-utils';
import { format } from '../../../_helpers/formatters';
import { handleEvent } from '../../../_helpers/event-util';

interface PercentageProps extends Omit<PConnFieldProps, 'value'> {
  value: number;
  showGroupSeparators?: string;
  decimalPrecision?: number;
  currencyISOCode?: string;
  // If any, enter additional props that only exist on Percentage here
}

@Directive()
export abstract class PercentageBase extends FieldBase {
  configProps$: PercentageProps;

  override fieldControl = new FormControl<number | null>(null, null);
  override value$: number;

  inputMode: any;
  decimalSeparator: string;
  thousandSeparator: string;
  decimalPrecision: number | undefined;
  formattedValue: string;

  /**
   * Updates the component's properties based on the configuration.
   */
  override updateSelf(): void {
    // Resolve configuration properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as PercentageProps;

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    // Set component specific properties
    const { value } = this.configProps$;
    if (value) {
      this.value$ = value;
      this.fieldControl.setValue(value);
    }

    // update percentage properties
    this.updatePercentageProperties(this.configProps$);
  }

  /**
   * Updates the percentage properties
   *
   * @param {Object} configProps - Configuration properties.
   * @param {boolean} configProps.showGroupSeparators - Whether to show group separators.
   * @param {number} configProps.decimalPrecision - The number of decimal places to display.
   */
  updatePercentageProperties(configProps): void {
    const { showGroupSeparators, decimalPrecision } = configProps;

    const theSymbols = getCurrencyCharacters('');
    this.decimalSeparator = theSymbols.theDecimalIndicator;
    this.thousandSeparator = showGroupSeparators ? theSymbols.theDigitGroupSeparator : '';
    this.decimalPrecision = decimalPrecision ?? 2;

    if (this.displayMode$ === 'DISPLAY_ONLY' || this.displayMode$ === 'STACKED_LARGE_VAL') {
      this.formattedValue = this.value$ ? format(this.value$, 'percentage') : '';
    }
  }

  /**
   * Handles the blur event on a field, formatting the value before passing it to the 'changeNblur' action.
   *
   * @param event The blur event.
   */
  override fieldOnBlur(event: any) {
    let value = event?.target?.value?.trim() ?? '';

    // Remove percentage sign
    value = value.replace(/%/g, '');

    // Replace thousand separator with empty string as not required in api call
    if (this.configProps$.showGroupSeparators) {
      const thousandSep = this.thousandSeparator === '.' ? '\\.' : this.thousandSeparator;
      const regExp = new RegExp(String.raw`${thousandSep}`, 'g');
      value = value?.replace(regExp, '');
    }

    // Replace decimal separator with '.' if it's not already '.'
    if (this.decimalSeparator !== '.') {
      const regExp = new RegExp(String.raw`${this.decimalSeparator}`, 'g');
      value = value.replace(regExp, '.');
    }

    handleEvent(this.actionsApi, 'changeNblur', this.propName, value);
  }
}
