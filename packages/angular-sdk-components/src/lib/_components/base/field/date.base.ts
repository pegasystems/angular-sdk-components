import { Directive } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldBase } from './field.base';
import { format } from '../../../_helpers/formatters';
import { getDateFormatInfo } from '../../../_helpers/date-format-utils';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface DateProps extends PConnFieldProps {
  // If any, enter additional props that only exist on Date here
}

@Directive()
export class DateBase extends FieldBase {
  configProps$: DateProps;

  override fieldControl = new FormControl('', null);

  // and then update, as needed, based on locale, etc.
  theDateFormat = getDateFormatInfo();
  formattedValue$: any;

  // updateSelf
  override updateSelf(): void {
    // starting very simple...
    // moved this from ngOnInit() and call this from there instead...
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as DateProps;

    this.value$ = this.configProps$.value;
    this.testId = this.configProps$.testId;
    this.label$ = this.configProps$.label;
    this.displayMode$ = this.configProps$.displayMode;
    this.helperText = this.configProps$.helperText;
    this.placeholder = this.configProps$.placeholder || '';

    this.actionsApi = this.pConn$.getActionsApi();
    this.propName = this.pConn$.getStateProps().value;

    this.bRequired$ = this.utils.getBooleanValue(this.configProps$.required);
    this.bVisible$ = this.utils.getBooleanValue(this.configProps$.visibility);
    this.bDisabled$ = this.utils.getBooleanValue(this.configProps$.disabled);
    this.bReadonly$ = this.utils.getBooleanValue(this.configProps$.readOnly);

    if (this.displayMode$ === 'DISPLAY_ONLY' || this.displayMode$ === 'STACKED_LARGE_VAL') {
      this.formattedValue$ = format(this.value$, 'date', {
        format: this.theDateFormat.dateFormatString
      });
    }

    if (this.bDisabled$) {
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
