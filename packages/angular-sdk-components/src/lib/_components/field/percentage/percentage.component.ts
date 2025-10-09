import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxCurrencyDirective, NgxCurrencyInputMode } from 'ngx-currency';

import { FieldBase } from '../field.base';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { handleEvent } from '../../../_helpers/event-util';
import { getCurrencyCharacters } from '../../../_helpers/currency-utils';
import { format } from '../../../_helpers/formatters';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface PercentageProps extends Omit<PConnFieldProps, 'value'> {
  value?: number;
  showGroupSeparators?: string;
  decimalPrecision?: number;
  currencyISOCode?: string;
  // If any, enter additional props that only exist on Percentage here
}

@Component({
  selector: 'app-percentage',
  templateUrl: './percentage.component.html',
  styleUrls: ['./percentage.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, NgxCurrencyDirective, forwardRef(() => ComponentMapperComponent)]
})
export class PercentageComponent extends FieldBase {
  configProps$: PercentageProps;
  override fieldControl = new FormControl<number | null>(null, null);

  decimalSeparator: string;
  thousandSeparator: string;
  inputMode: any = NgxCurrencyInputMode.Natural;
  decimalPrecision: number | undefined;
  formattedValue: string;

  /**
   * Updates the component when there are changes in the state.
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

  fieldOnChange(event: any) {
    const oldVal = this.value$ ?? '';
    const isValueChanged = event.target.value.toString() !== oldVal.toString();

    if (isValueChanged) {
      this.pConn$.clearErrorMessages({
        property: this.propName
      });
    }
  }

  fieldOnBlur(event: any) {
    const oldVal = this.value$ ?? '';
    const isValueChanged = event.target.value.toString() !== oldVal.toString();

    if (isValueChanged) {
      let value = event?.target?.value;
      value = value ? value.replace(/%/g, '') : '';
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
      handleEvent(this.actionsApi, 'changeNblur', this.propName, value);
    }
  }
}
