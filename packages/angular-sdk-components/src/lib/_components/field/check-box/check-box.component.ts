import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { CheckBoxBase } from '../../base/field/check-box/check-box.base';

@Component({
  selector: 'app-check-box',
  templateUrl: './check-box.component.html',
  styleUrls: ['./check-box.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCheckboxModule, MatFormFieldModule, MatOptionModule, forwardRef(() => ComponentMapperComponent)]
})
export class CheckBoxComponent extends CheckBoxBase {
  fieldOnChange(event: any) {
    this.onChange(event.checked);
  }

  fieldOnBlur(event: any) {
    this.onBlur(event.target.checked);
  }
}
