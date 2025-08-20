import { Directive } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldBase } from '../field.base';
import { PConnFieldProps } from '../../../../_types/PConnProps.interface';

interface RichTextProps extends PConnFieldProps {
  // If any, enter additional props that only exist on RichText here
}

@Directive()
export abstract class RichTextBase extends FieldBase {
  configProps$: RichTextProps;

  override fieldControl = new FormControl('', null);

  info: any;
  error: boolean;
  status: any;

  /**
   * Updates the component's properties based on the configuration.
   */
  override updateSelf(): void {
    // Resolve config properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as RichTextProps;

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    // Extract and normalize the value property
    const { value, helperText } = this.configProps$;
    this.value$ = value;

    const { status, validatemessage } = this.pConn$.getStateProps();
    this.status = status;
    this.info = validatemessage || helperText;
    this.error = status === 'error';
  }

  override onChange(value: any): void {
    const oldVal = this.value$ ?? '';
    const isValueChanged = value.toString() !== oldVal.toString();

    if (isValueChanged || this.status === 'error') {
      const property = this.propName;
      this.pConn$.clearErrorMessages({
        property,
        category: '',
        context: ''
      });
    }
  }
}
