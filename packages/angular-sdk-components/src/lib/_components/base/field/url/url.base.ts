import { Directive } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldBase } from '../field.base';
import { PConnFieldProps } from '../../../../_types/PConnProps.interface';

interface URLProps extends PConnFieldProps {
  // If any, enter additional props that only exist on URL here
}

@Directive()
export class UrlBase extends FieldBase {
  configProps$: URLProps;

  override fieldControl = new FormControl('', null);

  /**
   * Updates the component's properties based on the configuration.
   */
  override updateSelf(): void {
    // Resolve config properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as URLProps;

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    // Extract and normalize the value property
    const { value } = this.configProps$;

    // Update component properties
    this.value$ = value;
  }
}
