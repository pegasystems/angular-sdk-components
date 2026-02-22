import { Component, computed, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { FieldBase } from '../field.base.new';
import { handleEvent } from '../../../_helpers/event-util';

@Component({
  selector: 'app-text-input',
  standalone: true,
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush // Crucial for Zoneless performance
})
export class TextInputComponent extends FieldBase {
  // Inherit signals from FieldBase (pConn$, formGroup$)

  // Specific computed signals for cleaner template access
  // 'props' signal comes from the parent FieldBase class
  testId = computed(() => this.props().testId);
  placeholder = computed(() => this.props().placeholder || '');
  helperText = computed(() => this.props().helperText);
  required = computed(() => this.props().required === true);
  readOnly = computed(() => this.props().readOnly === true);
  disabled = computed(() => this.props().disabled === true);

  // Example of handling side-effects responsively (e.g. clearing errors)
  constructor() {
    super();
    // If we needed to react to value changes outside the template
    effect(() => {
      console.log('Value changed to:', this.value());
    });

    effect(() => {
      console.log('Props changed:', this.props());
    });
  }

  fieldOnChange(event: any) {
    const oldVal = this.value() ?? '';
    const isValueChanged = event.target.value.toString() !== oldVal.toString();
    const propName = this.pConn$().getStateProps().value;

    if (isValueChanged) {
      this.pConn$().clearErrorMessages({
        property: propName
      });
    }
  }

  fieldOnBlur(event: any) {
    const oldVal = this.value() ?? '';
    const isValueChanged = event.target.value.toString() !== oldVal.toString();

    if (isValueChanged) {
      const value = event?.target?.value;
      handleEvent(this.pConn$().getActionsApi(), 'changeNblur', this.pConn$().getStateProps().value, value);
    }
  }
}
