import { Directive } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldBase } from '../field.base';
import { PConnFieldProps } from '../../../../_types/PConnProps.interface';

interface ScalarListProps extends Omit<PConnFieldProps, 'value'> {
  // If any, enter additional props that only exist on ScalarList here
  displayInModal: boolean;
  value: any[];
  componentType: string;
  restProps?: object;
}

@Directive()
export class ScalarListBase extends FieldBase {
  configProps$: ScalarListProps;

  override fieldControl = new FormControl('', null);

  items: any[];
  isDisplayModeEnabled = false;

  /**
   * Updates the component's properties based on the configuration.
   */
  override updateSelf(): void {
    // Resolve config properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as ScalarListProps;

    // Extract properties from config props
    const { componentType, displayMode = '', label, value, restProps } = this.configProps$;

    // Update component properties
    this.label$ = label;
    this.displayMode$ = displayMode;

    // Create items based on scalar values
    this.items = value?.map(scalarValue => {
      return this.pConn$.createComponent(
        {
          type: componentType,
          config: {
            value: scalarValue,
            displayMode: 'DISPLAY_ONLY',
            label: this.label$,
            ...restProps,
            readOnly: true
          }
        },
        '',
        0,
        {}
      ); // 2nd, 3rd, and 4th args empty string/object/null until typedef marked correctly as optional;
    });

    this.value$ = this.items;
    this.isDisplayModeEnabled = ['STACKED_LARGE_VAL', 'DISPLAY_ONLY'].includes(this.displayMode$ as string);
  }
}
