import { Component, OnInit, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxCurrencyDirective, NgxCurrencyInputMode } from 'ngx-currency';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { CurrencyBase } from '../../base/field/currency/currency.base';

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, NgxCurrencyDirective, forwardRef(() => ComponentMapperComponent)]
})
export class CurrencyComponent extends CurrencyBase implements OnInit, OnDestroy {
  inputMode = NgxCurrencyInputMode.Natural;

  fieldOnBlur(event: any) {
    let value = event?.target?.value;
    value = value?.substring(1);
    // replacing thousand separator with empty string as not required in api call
    const thousandSep = this.thousandSeparator === '.' ? '\\.' : this.thousandSeparator;
    let regExp = new RegExp(String.raw`${thousandSep}`, 'g');
    value = value?.replace(regExp, '');
    // replacing decimal separator with '.'
    if (this.decimalSeparator !== '.') {
      regExp = new RegExp(String.raw`${this.decimalSeparator}`, 'g');
      value = value.replace(regExp, '.');
    }

    this.onBlur(value);
  }
}
