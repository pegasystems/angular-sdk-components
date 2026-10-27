import { Component, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxCurrencyDirective, NgxCurrencyInputMode } from 'ngx-currency';

import { FieldBase } from '../field.base';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import {
  formatNumberFieldForDisplay,
  getNumberInputFormat,
  NumberInputFormat,
  parseDecimalPrecision,
  parseFormattedNumber,
  saveNumberOnBlur
} from '../../../_helpers/currency-utils';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface DecimalProps extends Omit<PConnFieldProps, 'value'> {
  // If any, enter additional props that only exist on Decimal here
  value?: number | string;
  currencyISOCode?: string;
  decimalPrecision?: number | string;
  showGroupSeparators?: boolean | string;
  formatter?: string;
  currencyDisplay?: 'symbol' | 'code' | 'name';
  negative?: 'minus-sign' | 'parentheses';
  notation?: 'standard' | 'compact';
  currencyDecimalPrecision?: string;
}

@Component({
  selector: 'app-decimal',
  templateUrl: './decimal.component.html',
  styleUrls: ['./decimal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
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
  decimalPrecision: number | undefined;
  formattedValue: any;
  inputMode: any = NgxCurrencyInputMode.Natural;
  private inputFormat: NumberInputFormat;

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
    this.value$ = value === undefined || value === null || value === '' ? '' : Number(value);
    this.fieldControl.setValue(this.value$ === '' ? null : this.value$);

    // updates decimal properties
    this.updateDecimalProperties(this.configProps$);
  }

  /**
   * Updates the input mask and read-only value, matching the Constellation DX Decimal component.
   */
  protected updateDecimalProperties(configProps: DecimalProps): void {
    const { decimalPrecision, showGroupSeparators = true } = configProps;
    const numberOfDecimals = parseDecimalPrecision(decimalPrecision, 2);
    const groupSeparators = this.utils.getBooleanValue(showGroupSeparators);

    this.inputFormat = getNumberInputFormat();
    this.decimalSeparator = this.inputFormat.decimalSeparator;
    this.thousandSeparator = groupSeparators ? this.inputFormat.thousandSeparator : '';
    // ngx-currency needs a fixed precision; Constellation allows any number of decimals when none is configured
    this.decimalPrecision = numberOfDecimals ?? 2;

    if (['DISPLAY_ONLY', 'STACKED_LARGE_VAL'].includes(this.displayMode$)) {
      this.formattedValue = formatNumberFieldForDisplay('Decimal', this.value$, configProps);
    }
  }

  fieldOnBlur(event: any) {
    const parsed = parseFormattedNumber(event?.target?.value, this.inputFormat);
    saveNumberOnBlur(this.pConn$, parsed !== '' ? Number(parsed) : '', this.configProps$?.value);
  }
}
