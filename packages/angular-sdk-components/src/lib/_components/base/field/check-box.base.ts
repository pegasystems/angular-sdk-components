import { Directive, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldBase } from './field.base';
import { deleteInstruction, insertInstruction, updateNewInstructions } from '../../../_helpers/instructions-utils';
import { handleEvent } from '../../../_helpers/event-util';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

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

  override ngOnInit(): void {
    super.ngOnInit();

    if (this.selectionMode === 'multi' && this.referenceList?.length > 0) {
      this.pConn$.setReferenceList(this.selectionList);
      updateNewInstructions(this.pConn$, this.selectionList);
    }
  }

  // updateSelf
  override updateSelf(): void {
    // moved this from ngOnInit() and call this from there instead...
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as CheckboxProps;

    this.testId = this.configProps$.testId;
    this.displayMode$ = this.configProps$.displayMode;
    this.label$ = this.configProps$.label;
    if (this.label$ != '') {
      this.showLabel$ = true;
    }

    this.actionsApi = this.pConn$.getActionsApi();
    this.propName = this.pConn$.getStateProps().value;

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
      this.helperText = this.configProps$.helperText;
      this.trueLabel$ = this.configProps$.trueLabel || 'Yes';
      this.falseLabel$ = this.configProps$.falseLabel || 'No';

      this.bRequired$ = this.utils.getBooleanValue(this.configProps$.required);
      this.bVisible$ = this.utils.getBooleanValue(this.configProps$.visibility);
      this.bDisabled$ = this.utils.getBooleanValue(this.configProps$.disabled);
      this.bReadonly$ = this.utils.getBooleanValue(this.configProps$.readOnly);
      this.isChecked$ = this.utils.getBooleanValue(this.value$);

      if (this.bDisabled$ || this.bReadonly$) {
        this.fieldControl.disable();
      } else {
        this.fieldControl.enable();
      }

      // trigger display of error message with field control
      if (this.angularPConnectData.validateMessage != null && this.angularPConnectData.validateMessage != '') {
        this.fieldControl.setErrors({ message: true });
        this.fieldControl.markAsTouched();
      }
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
