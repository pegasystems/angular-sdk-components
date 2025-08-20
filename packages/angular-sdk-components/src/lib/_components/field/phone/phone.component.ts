import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxMatIntlTelInputComponent } from 'ngx-mat-intl-tel-input';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { PhoneBase } from '../../base/field/phone/phone.base';

@Component({
  selector: 'app-phone',
  templateUrl: './phone.component.html',
  styleUrls: ['./phone.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, NgxMatIntlTelInputComponent, forwardRef(() => ComponentMapperComponent)]
})
export class PhoneComponent extends PhoneBase {
  fieldOnBlur() {
    // 'blur' isn't getting fired
  }

  fieldOnChange() {
    this.onBlur();
  }
}
