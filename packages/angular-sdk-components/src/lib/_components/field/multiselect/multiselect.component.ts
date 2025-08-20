import { CommonModule } from '@angular/common';
import { Component, forwardRef } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { handleEvent } from '../../../_helpers/event-util';
import { MultiselectBase } from '../../base/field/multiselect/multiselect.base';

@Component({
  selector: 'app-multiselect',
  templateUrl: './multiselect.component.html',
  styleUrls: ['./multiselect.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatCheckboxModule,
    MatIconModule,
    MatChipsModule,
    forwardRef(() => ComponentMapperComponent)
  ]
})
export class MultiselectComponent extends MultiselectBase {
  fieldOnChange(event: Event) {
    this.value$ = (event.target as HTMLInputElement).value;
    this.getCaseListBasedOnParams(this.value$, '', [...this.selectedItems], [...this.itemsTree], true);
  }

  optionChanged(event: any) {
    let value = event?.target?.value;
    value = value?.substring(1);
    handleEvent(this.actionsApi, 'changeNblur', this.propName, value);
  }

  optionClicked = (event: Event, data: any): void => {
    event.stopPropagation();
    this.toggleSelection(data);
  };

  removeChip = (data: any): void => {
    if (data) {
      data = this.itemsTree.filter((ele: any) => {
        return ele.id === data.id;
      });
      this.toggleSelection(data[0]);
    }
  };
}
