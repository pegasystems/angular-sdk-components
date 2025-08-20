import { Directive } from '@angular/core';
import { FormControl } from '@angular/forms';

import { FieldBase } from '../field.base';
import { getCurrencyCharacters } from '../../../../_helpers/currency-utils';
import { format } from '../../../../_helpers/formatters';
import { PConnFieldProps } from '../../../../_types/PConnProps.interface';

interface PercentageProps extends Omit<PConnFieldProps, 'value'> {
  value: number;
  showGroupSeparators?: string;
  decimalPrecision?: number;
  currencyISOCode?: string;
  // If any, enter additional props that only exist on Percentage here
}

@Directive()
export abstract class PercentageBase extends FieldBase {
  override fieldControl = new FormControl<number | null>(null, null);

  configProps$: PercentageProps;
  override value$: number;

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

    if (['DISPLAY_ONLY', 'STACKED_LARGE_VAL'].includes(this.displayMode$)) {
      this.formattedValue = this.value$ ? format(this.value$, 'percentage') : '';
    }
  }
}
