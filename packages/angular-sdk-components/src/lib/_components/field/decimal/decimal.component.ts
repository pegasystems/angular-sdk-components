import { Component, OnInit, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxCurrencyDirective, NgxCurrencyInputMode } from 'ngx-currency';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { DecimalBase } from '../../base/field/decimal/decimal.base';

@Component({
  selector: 'app-decimal',
  templateUrl: './decimal.component.html',
  styleUrls: ['./decimal.component.scss'],
  standalone: true,
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
export class DecimalComponent extends DecimalBase implements OnInit, OnDestroy {
  inputMode: any = NgxCurrencyInputMode.Natural;

  fieldOnBlur(event: any) {
    let value = event?.target?.value;
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
