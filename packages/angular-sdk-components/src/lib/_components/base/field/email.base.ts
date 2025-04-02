import { Directive } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldBase } from './field.base';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface EmailProps extends PConnFieldProps {
  // If any, enter additional props that only exist on Email here
}

@Directive()
export abstract class EmailBase extends FieldBase {
  configProps$: EmailProps;

  override fieldControl = new FormControl('', null);

  /**
   * Updates the component's properties based on the configuration.
   */
  override updateSelf(): void {
    // Resolve configuration properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as EmailProps;

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    // Set component specific properties
    const { value } = this.configProps$;

    // Update component properties
    this.value$ = value;
  }
}
