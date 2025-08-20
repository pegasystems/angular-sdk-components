import { Component, OnInit, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

import { UserReferenceBase } from '../../base/field/user-reference/user-reference.base';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { handleEvent } from '../../../_helpers/event-util';

@Component({
  selector: 'app-user-reference',
  templateUrl: './user-reference.component.html',
  styleUrls: ['./user-reference.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatAutocompleteModule,
    forwardRef(() => ComponentMapperComponent)
  ]
})
export class UserReferenceComponent extends UserReferenceBase implements OnInit, OnDestroy {
  fieldOnChange(event: any) {
    if (event?.value === 'Select') {
      event.value = '';
    }
    if (event?.target) {
      this.filterValue = (event.target as HTMLInputElement).value;
    }
    const value = event?.value;
    handleEvent(this.actionsApi, 'change', this.propName, value);
  }

  optionChanged(event: any) {
    const value = event?.option?.value;
    handleEvent(this.actionsApi, 'change', this.propName, value);
  }

  fieldOnBlur(event: any) {
    let key = '';
    if (event?.target?.value) {
      const index = this.options$?.findIndex(element => element.value === event.target.value);
      key = index > -1 ? (key = this.options$[index].key) : event.target.value;
    }
    const value = key;
    handleEvent(this.actionsApi, 'changeNblur', this.propName, value);
    if (this.onRecordChange) {
      event.target.value = value;
      this.onRecordChange(event);
    }
  }
}
