import { Directive } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldBase } from './field.base';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface TextAreaProps extends PConnFieldProps {
  // If any, enter additional props that only exist on TextArea here
  fieldMetadata?: any;
}

@Directive()
export class TextAreaBase extends FieldBase {
  configProps$: TextAreaProps;
  override fieldControl = new FormControl('', null);

  nMaxLength$: number;

  /**
   * Updates the component's properties based on the configuration.
   */
  override updateSelf(): void {
    // Resolve config properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as TextAreaProps;

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    // Extract properties from config
    const { value } = this.configProps$;

    // Set component specific properties
    this.value$ = value;
    this.nMaxLength$ = this.pConn$.getFieldMetadata(this.pConn$.getRawConfigProps()?.value)?.maxLength || 100;
  }
}
