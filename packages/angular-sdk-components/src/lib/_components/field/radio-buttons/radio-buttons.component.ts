import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Utils } from '../../../_helpers/utils';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { RadioButtonsBase } from '../../base/field/radio-buttons/radio-buttons.base';

@Component({
  selector: 'app-radio-buttons',
  templateUrl: './radio-buttons.component.html',
  styleUrls: ['./radio-buttons.component.scss'],
  providers: [Utils],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatRadioModule, forwardRef(() => ComponentMapperComponent)]
})
export class RadioButtonsComponent extends RadioButtonsBase {
  isSelected(buttonValue: string): boolean {
    return this.value$ === buttonValue;
  }

  fieldOnChange(event: any) {
    this.onBlur(event.value);
  }
}
