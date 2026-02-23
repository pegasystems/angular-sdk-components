import { Component, computed, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { FieldBaseStore } from '../field.base.store';
import { PConnectStore } from '../../../_bridge/pconnect.store';
import { handleEvent } from '../../../_helpers/event-util';

/**
 * Text Input Component
 * Implements the NGRX Signal Store architecture for Redux connection.
 */
@Component({
  selector: 'app-text-input',
  standalone: true,
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  providers: [PConnectStore], // Required: Provide the store at component level
  changeDetection: ChangeDetectionStrategy.OnPush // Crucial for Zoneless performance
})
export class TextInputComponent extends FieldBaseStore {
  // Inherits from FieldBaseStore:
  // pConn$, formGroup$, inject(PConnectStore)
  // Signals: props, label, value, visibility, required, readOnly, disabled, helperText, testId

  // Local computed props specific to TextInput
  placeholder = computed(() => this.props().placeholder || '');

  constructor() {
    super();

    // Example: Debugging value changes
    effect(() => {
      // console.log('TextInput Value changed to:', this.value());
    });
  }

  fieldOnChange(event: any) {
    // Access value from the store signal
    const oldVal = this.value() ?? '';
    const isValueChanged = event.target.value.toString() !== oldVal.toString();
    const pConn = this.pConn$();
    const propName = pConn.getStateProps().value;

    if (isValueChanged) {
      pConn.clearErrorMessages({
        property: propName
      });
    }
  }

  fieldOnBlur(event: any) {
    const oldVal = this.value() ?? '';
    const isValueChanged = event.target.value.toString() !== oldVal.toString();

    const pConn = this.pConn$();
    if (isValueChanged) {
      // For value changes, propagate changeNblur event
      const value = event?.target?.value;
      handleEvent(pConn.getActionsApi(), 'changeNblur', pConn.getStateProps().value, value);
    }
  }
}
