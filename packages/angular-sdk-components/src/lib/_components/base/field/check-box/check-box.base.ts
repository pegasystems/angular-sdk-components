import { Directive, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { FieldBase } from '../field.base';
import { PConnFieldProps } from '../../../../_types/PConnProps.interface';
import { handleEvent } from '../../../../_helpers/event-util';
import { deleteInstruction, insertInstruction, updateNewInstructions } from '../../../../_helpers/instructions-utils';

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
}

@Directive()
export class CheckBoxBase extends FieldBase implements OnInit {
  configProps$: CheckboxProps;

  override fieldControl = new FormControl('', null);

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

  // Override ngOnInit method
  override ngOnInit(): void {
    super.ngOnInit();

    // Check if selection mode is multi and reference list is not empty
    if (this.selectionMode === 'multi' && this.referenceList?.length > 0) {
      // Set reference list and update new instructions
      this.pConn$.setReferenceList(this.selectionList);
      updateNewInstructions(this.pConn$, this.selectionList);
    }
  }

  /**
   * Updates the component's properties based on the configuration.
   */
  override updateSelf(): void {
    // Resolve config properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as CheckboxProps;

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    if (this.label$) {
      this.showLabel$ = true;
    }

    // multi case
    this.selectionMode = this.configProps$.selectionMode;
    if (this.selectionMode === 'multi') {
      this.referenceList = this.configProps$.referenceList;
      this.selectionList = this.configProps$.selectionList;
      this.selectedvalues = this.configProps$.readonlyContextList;
      this.primaryField = this.configProps$.primaryField;

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

      // eslint-disable-next-line sonarjs/no-redundant-boolean
      if (this.value$ === 'true' || this.value$ == true) {
        this.isChecked$ = true;
      } else {
        this.isChecked$ = false;
      }
    }
  }

  /**
   * Handles the change event for the checkbox.
   *
   * @param value The new value of the checkbox.
   */
  override onChange(value: boolean): void {
    handleEvent(this.actionsApi, 'changeNblur', this.propName, value);
    this.pConn$.clearErrorMessages({
      property: this.propName
    });
  }

  /**
   * Handles the blur event for the checkbox.
   *
   * @param value The new value of the checkbox.
   */
  override onBlur(value: any): void {
    if (this.selectionMode === 'multi') {
      this.pConn$.getValidationApi().validate(this.selectedvalues, this.selectionList);
    } else {
      this.pConn$.getValidationApi().validate(value);
    }
  }

  /**
   * Handles the change event for the checkbox in multiple selection mode.
   *
   * @param event The change event.
   * @param element The checkbox element.
   */
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
