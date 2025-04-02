import { Directive } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldBase } from './field.base';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface IntegerProps extends PConnFieldProps {
  // If any, enter additional props that only exist on Integer here
}

@Directive()
export class IntegerBase extends FieldBase {
  configProps$: IntegerProps;

  override fieldControl = new FormControl<number | null>(null, null);
  override value$: number;

  /**
   * Updates the component's properties based on the configuration.
   */
  override updateSelf(): void {
    // Resolve configuration properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as IntegerProps;

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    // Extract and normalize the value property
    const { value } = this.configProps$;
    if (value) {
      this.value$ = typeof value === 'string' ? parseInt(value, 10) : value;
    }
  }
}
