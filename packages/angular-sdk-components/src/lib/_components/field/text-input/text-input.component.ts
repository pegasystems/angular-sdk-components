import { Component, OnInit, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { TextInputBase } from '../../base/field/text-input/text-input.base';

@Component({
  selector: 'app-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, forwardRef(() => ComponentMapperComponent)]
})
export class TextInputComponent extends TextInputBase implements OnInit, OnDestroy {
  /**
   * Handles changes to the text input field.
   */
  fieldOnChange(event: any) {
    this.onChange(event.target.value);
  }

  /**
   * Handles blur events on the text input field.
   */
  fieldOnBlur(event: any) {
    this.onBlur(event.target.value);
  }
}
