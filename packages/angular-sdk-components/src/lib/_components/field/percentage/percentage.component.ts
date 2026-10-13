import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxCurrencyDirective, NgxCurrencyInputMode } from 'ngx-currency';

import { FieldBase } from '../field.base';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import {
  decimalsToPercentage,
  formatNumberFieldForDisplay,
  getNumberInputFormat,
  NumberInputFormat,
  parseDecimalPrecision,
  parseFormattedNumber,
  percentageToDecimals,
  saveNumberOnBlur
} from '../../../_helpers/currency-utils';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface PercentageProps extends Omit<PConnFieldProps, 'value'> {
  value?: number | string;
  showGroupSeparators?: boolean | string;
  decimalPrecision?: number | string;
  currencyISOCode?: string;
  storePercentageAsDecimal?: boolean | string;
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

  prefix: string;
  suffix: string;
  decimalSeparator: string;
  thousandSeparator: string;
  inputMode: any = NgxCurrencyInputMode.Natural;
  decimalPrecision: number | undefined;
  formattedValue: string;
  private inputFormat: NumberInputFormat;
  private numberOfDecimals: number | undefined;
  private storeAsDecimal = false;

  /**
   * Updates the component when there are changes in the state.
   */
  override updateSelf(): void {
    // Resolve configuration properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as PercentageProps;

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    const { value, decimalPrecision, storePercentageAsDecimal } = this.configProps$;
    this.numberOfDecimals = parseDecimalPrecision(decimalPrecision, 2);
    this.storeAsDecimal = this.utils.getBooleanValue(storePercentageAsDecimal);

    // The stored value may be a fraction (0.25); the field always shows/edits the percentage (25)
    if (value === undefined || value === null || value === '') {
      this.value$ = '';
    } else {
      this.value$ = this.storeAsDecimal && Number(value) ? decimalsToPercentage(Number(value), this.numberOfDecimals) : Number(value);
    }
    this.fieldControl.setValue(this.value$ === '' ? null : this.value$);

    // update percentage properties
    this.updatePercentageProperties(this.configProps$);
  }

  /**
   * Updates the input mask and read-only value, matching the Constellation DX Percentage component.
   */
  updatePercentageProperties(configProps: PercentageProps): void {
    const { showGroupSeparators = false } = configProps;
    const groupSeparators = this.utils.getBooleanValue(showGroupSeparators);

    this.inputFormat = getNumberInputFormat('percent');
    this.prefix = this.inputFormat.prefix;
    this.suffix = this.inputFormat.suffix;
    this.decimalSeparator = this.inputFormat.decimalSeparator;
    this.thousandSeparator = groupSeparators ? this.inputFormat.thousandSeparator : '';
    // ngx-currency needs a fixed precision; Constellation allows any number of decimals when none is configured
    this.decimalPrecision = this.numberOfDecimals ?? 2;

    if (['DISPLAY_ONLY', 'STACKED_LARGE_VAL'].includes(this.displayMode$)) {
      this.formattedValue = formatNumberFieldForDisplay('Percentage', this.value$, configProps);
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
    const parsed = parseFormattedNumber(event?.target?.value, this.inputFormat);
    let newValue: number | '' = parsed !== '' ? Number(parsed) : '';
    if (this.storeAsDecimal && newValue !== '') {
      newValue = percentageToDecimals(newValue, this.numberOfDecimals);
    }
    saveNumberOnBlur(this.pConn$, newValue, this.configProps$?.value);
  }
}
