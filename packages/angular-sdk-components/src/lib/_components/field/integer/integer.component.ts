import { Component, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxCurrencyDirective, NgxCurrencyInputMode } from 'ngx-currency';

import { FieldBase } from '../field.base';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import {
  formatNumberFieldForDisplay,
  getNumberInputFormat,
  NumberInputFormat,
  parseFormattedNumber,
  saveNumberOnBlur
} from '../../../_helpers/currency-utils';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface IntegerProps extends Omit<PConnFieldProps, 'value'> {
  // If any, enter additional props that only exist on Integer here
  value?: number | string;
  showGroupSeparators?: boolean | string;
  formatter?: string;
  decimalPrecision?: number | string;
  currencyISOCode?: string;
  currencyDisplay?: 'symbol' | 'code' | 'name';
  negative?: 'minus-sign' | 'parentheses';
  notation?: 'standard' | 'compact';
  currencyDecimalPrecision?: string;
}

@Component({
  selector: 'app-integer',
  templateUrl: './integer.component.html',
  styleUrls: ['./integer.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, NgxCurrencyDirective, forwardRef(() => ComponentMapperComponent)]
})
export class IntegerComponent extends FieldBase {
  configProps$: IntegerProps;
  override fieldControl = new FormControl<number | null>(null, null);

  decimalSeparator: string;
  thousandSeparator: string;
  formattedValue: string;
  inputMode: any = NgxCurrencyInputMode.Natural;
  private inputFormat: NumberInputFormat;

  /**
   * Updates the component when there are changes in the state.
   */
  override updateSelf(): void {
    // Resolve configuration properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as IntegerProps;

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    // Extract and normalize the value property
    const { value } = this.configProps$;
    this.value$ = value === undefined || value === null || value === '' ? '' : Number(value);
    this.fieldControl.setValue(this.value$ === '' ? null : this.value$);

    this.updateIntegerProperties(this.configProps$);
  }

  /**
   * Updates the input mask and read-only value, matching the Constellation DX Integer component.
   */
  protected updateIntegerProperties(configProps: IntegerProps): void {
    const { showGroupSeparators = true } = configProps;
    const groupSeparators = this.utils.getBooleanValue(showGroupSeparators);

    this.inputFormat = getNumberInputFormat();
    this.decimalSeparator = this.inputFormat.decimalSeparator;
    this.thousandSeparator = groupSeparators ? this.inputFormat.thousandSeparator : '';

    if (['DISPLAY_ONLY', 'STACKED_LARGE_VAL'].includes(this.displayMode$)) {
      this.formattedValue = formatNumberFieldForDisplay('Integer', this.value$, configProps);
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
    saveNumberOnBlur(this.pConn$, parsed !== '' ? Number(parsed) : '', this.configProps$?.value);
  }
}
