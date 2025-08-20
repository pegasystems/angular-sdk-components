import { Component, forwardRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { handleEvent } from '../../../_helpers/event-util';
import { AutoCompleteBase } from '../../base/field/auto-complete/auto-complete.base';

@Component({
  selector: 'app-auto-complete',
  templateUrl: './auto-complete.component.html',
  styleUrls: ['./auto-complete.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    forwardRef(() => ComponentMapperComponent)
  ]
})
export class AutoCompleteComponent extends AutoCompleteBase implements OnInit, OnDestroy {
  /**
   * Handles the change event of a field.
   *
   * @param event The event triggered by the field change.
   */
  fieldOnChange(event: Event) {
    const target = event?.target as HTMLInputElement;
    const value = target?.value;

    this.filterValue = value;
    handleEvent(this.actionsApi, 'change', this.propName, value);
  }

  /**
   * Handles the change event of an option.
   *
   * @param event The event triggered by the option change.
   */
  optionChanged(event: any) {
    const value = event?.option?.value;
    handleEvent(this.actionsApi, 'change', this.propName, value);
  }

  /**
   * Handles the blur event on the field.
   *
   * @param {Event} event - The blur event.
   */
  fieldOnBlur(event: Event) {
    let key = '';
    const el = event?.target as HTMLInputElement;
    if (el?.value) {
      const index = this.options$?.findIndex(element => element.value === el.value);
      key = index > -1 ? (key = this.options$[index].key) : el.value;
    }
    const value = key;

    this.onBlur(value);

    if (this.configProps$?.onRecordChange) {
      el.value = value;
      this.configProps$.onRecordChange(event);
    }
  }
}
