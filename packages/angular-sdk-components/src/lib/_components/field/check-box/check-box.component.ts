import { Component, OnInit, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';

import { FieldBase } from '../field.base';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';
import { deleteInstruction, insertInstruction, updateNewInstructions } from '../../../_helpers/instructions-utils';
import { handleEvent } from '../../../_helpers/event-util';

interface CheckboxProps extends Omit<PConnFieldProps, 'value'> {
  // If any, enter additional props that only exist on Checkbox here
  // Everything from PConnFieldProps except value and change type of value to boolean
  value: boolean;
  caption?: string;
  trueLabel?: string;
  falseLabel?: string;
  selectionMode?: string;
  datasource?: any;
  selectionKey?: string;
  selectionList?: any;
  primaryField: string;
  readonlyContextList: any;
  referenceList: string;
  variant?: string;
  renderMode: string;
}

@Component({
  selector: 'app-check-box',
  templateUrl: './check-box.component.html',
  styleUrls: ['./check-box.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatCheckboxModule, MatFormFieldModule, MatOptionModule, forwardRef(() => ComponentMapperComponent)]
})
export class CheckBoxComponent extends FieldBase implements OnInit, OnDestroy {
  configProps$: CheckboxProps;

  caption$?: string = '';
  showLabel$ = false;
  isChecked$ = false;
  trueLabel$?: string;
  falseLabel$?: string;

  selectionMode?: string;
  datasource?: any;
  selectionKey?: string;
  selectionList?: any;
  primaryField: string;
  selectedvalues: any;
  referenceList: string;
  listOfCheckboxes: any[] = [];
  variant?: string;

  // Override ngOnInit method
  override ngOnInit(): void {
    super.ngOnInit();

    if (this.selectionMode === 'multi' && this.referenceList?.length > 0 && !this.bReadonly$) {
      this.pConn$.setReferenceList(this.selectionList);
      updateNewInstructions(this.pConn$, this.selectionList);
    }
  }

  /**
   * Updates the component when there are changes in the state.
   */
  override updateSelf(): void {
    // moved this from ngOnInit() and call this from there instead...
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as CheckboxProps;

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    if (this.label$ != '') {
      this.showLabel$ = true;
    }
    this.variant = this.configProps$.variant;

    // multi case
    this.selectionMode = this.configProps$.selectionMode;
    if (this.selectionMode === 'multi') {
      this.referenceList = this.configProps$.referenceList;
      this.selectionList = this.configProps$.selectionList;
      this.selectedvalues = this.configProps$.readonlyContextList;
      this.primaryField = this.configProps$.primaryField;
      this.bReadonly$ = this.configProps$.renderMode === 'ReadOnly' || this.displayMode$ === 'DISPLAY_ONLY' || this.configProps$.readOnly;

      this.datasource = this.configProps$.datasource;
      this.selectionKey = this.configProps$.selectionKey;
      const listSourceItems = this.datasource?.source ?? [];
      const dataField = this.selectionKey?.split?.('.')[1] ?? '';
      const listToDisplay: any[] = [];
      listSourceItems.forEach(element => {
        element.selected = this.selectedvalues?.some?.(data => data[dataField] === element.key);
        listToDisplay.push(element);
      });
      this.listOfCheckboxes = listToDisplay;
    } else {
      if (this.configProps$.value != undefined) {
        this.value$ = this.configProps$.value;
      }

      this.caption$ = this.configProps$.caption;
      this.trueLabel$ = this.configProps$.trueLabel || 'Yes';
      this.falseLabel$ = this.configProps$.falseLabel || 'No';

      this.isChecked$ = this.value$ === 'true' || this.value$ == true;
    }
  }

  fieldOnChange(event: any) {
    event.value = event.checked;
    handleEvent(this.actionsApi, 'changeNblur', this.propName, event.checked);
    this.pConn$.clearErrorMessages({
      property: this.propName
    });
  }

  fieldOnBlur(event: any) {
    if (this.selectionMode === 'multi') {
      this.pConn$.getValidationApi().validate(this.selectedvalues, this.selectionList);
    } else {
      this.pConn$.getValidationApi().validate(event.target.checked);
    }
  }

  handleChangeMultiMode(event, element) {
    if (!element.selected) {
      insertInstruction(this.pConn$, this.selectionList, this.selectionKey, this.primaryField, {
        id: element.key,
        primary: element.text ?? element.value
      });
    } else {
      deleteInstruction(this.pConn$, this.selectionList, this.selectionKey, {
        id: element.key,
        primary: element.text ?? element.value
      });
    }
    this.pConn$.clearErrorMessages({
      property: this.selectionList,
      category: '',
      context: ''
    });
  }
}
