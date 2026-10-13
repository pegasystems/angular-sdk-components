import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxCurrencyDirective, NgxCurrencyInputMode } from 'ngx-currency';

import { FieldBase } from '../field.base';
import { FieldWarningDirective } from '../../../_directives/field-warning.directive';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import {
  formatNumberFieldForDisplay,
  getCurrencyInputFormat,
  NumberInputFormat,
  parseFormattedNumber,
  saveNumberOnBlur
} from '../../../_helpers/currency-utils';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface CurrrencyProps extends Omit<PConnFieldProps, 'value'> {
  // If any, enter additional props that only exist on Currency here
  value?: number | string;
  currencyISOCode?: string;
  alwaysShowISOCode?: boolean;
  allowDecimals: boolean;
  formatter?: string;
  currencyDisplay?: 'symbol' | 'code' | 'name';
  negative?: 'minus-sign' | 'parentheses';
  notation?: 'standard' | 'compact';
  currencyDecimalPrecision?: string;
  decimalPrecision?: number | string;
}

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgxCurrencyDirective,
    FieldWarningDirective,
    forwardRef(() => ComponentMapperComponent)
  ]
})
export class CurrencyComponent extends FieldBase {
  configProps$: CurrrencyProps;
  override fieldControl = new FormControl<number | null>(null, { updateOn: 'blur' });

  currencySymbol: string;
  currencySuffix: string;
  thousandSeparator: string;
  decimalSeparator: string;
  decimalPrecision: number | undefined;
  formattedValue: string;
  inputMode = NgxCurrencyInputMode.Natural;
  private inputFormat: NumberInputFormat;

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
    this.value$ = value === undefined || value === null || value === '' ? '' : Number(value);
    this.fieldControl.setValue(this.value$ === '' ? null : this.value$);

    // update currency properties
    this.updateCurrencyProperties(this.configProps$);
  }

  /**
   * Updates the input mask and read-only value, matching the Constellation DX Currency component.
   */
  protected updateCurrencyProperties(configProps: CurrrencyProps): void {
    const { allowDecimals = true, currencyISOCode = 'USD', alwaysShowISOCode = false } = configProps;

    const inputFormat = getCurrencyInputFormat(
      currencyISOCode,
      this.utils.getBooleanValue(alwaysShowISOCode),
      this.utils.getBooleanValue(allowDecimals)
    );
    this.inputFormat = inputFormat;
    this.currencySymbol = inputFormat.prefix;
    this.currencySuffix = inputFormat.suffix;
    this.thousandSeparator = inputFormat.thousandSeparator;
    this.decimalSeparator = inputFormat.decimalSeparator;
    this.decimalPrecision = inputFormat.precision;

    if (['DISPLAY_ONLY', 'STACKED_LARGE_VAL'].includes(this.displayMode$)) {
      this.formattedValue = formatNumberFieldForDisplay('Currency', this.value$, { ...configProps, currencyISOCode });
    }
  }

  fieldOnBlur(event: any) {
    const parsed = parseFormattedNumber(event?.target?.value, this.inputFormat);
    saveNumberOnBlur(this.pConn$, parsed !== '' ? Number(parsed) : '', this.configProps$?.value);
  }
}
