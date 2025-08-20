import { Directive } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldBase } from '../field.base';
import { PConnFieldProps } from '../../../../_types/PConnProps.interface';

interface TextInputProps extends PConnFieldProps {
  fieldMetadata?: any;
}

@Directive()
export class TextInputBase extends FieldBase {
  configProps$: TextInputProps;

  override fieldControl = new FormControl('', null);

  /**
   * Updates the component's properties based on the configuration.
   */
  override updateSelf(): void {
    // Resolve configuration properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as TextInputProps;

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    // Get component specific properties
    const { value } = this.configProps$;

    // Update component specific properties
    this.value$ = value;
  }
}
