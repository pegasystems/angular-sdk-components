import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxCurrencyDirective, NgxCurrencyInputMode } from 'ngx-currency';
import { PercentageBase } from '../../base/field/percentage/percentage.base';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-percentage',
  templateUrl: './percentage.component.html',
  styleUrls: ['./percentage.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, NgxCurrencyDirective, forwardRef(() => ComponentMapperComponent)]
})
export class PercentageComponent extends PercentageBase {
  inputMode: number = NgxCurrencyInputMode.Natural;

  fieldOnChange(event: any) {
    this.onChange(event.target.value);
  }

  fieldOnBlur(event: any) {
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

    this.onBlur(value);
  }
}
