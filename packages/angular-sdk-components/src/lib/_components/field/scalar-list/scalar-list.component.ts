import { CommonModule } from '@angular/common';
import { Component, forwardRef } from '@angular/core';

import { FieldBase } from '../field.base';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface ScalarListProps extends Omit<PConnFieldProps, 'value'> {
  // If any, enter additional props that only exist on ScalarList here
  displayInModal: boolean;
  value: any[];
  componentType: string;
  restProps?: object;
}

@Component({
  selector: 'app-scalar-list',
  templateUrl: './scalar-list.component.html',
  styleUrls: ['./scalar-list.component.scss'],
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class ScalarListComponent extends FieldBase {
  configProps$: ScalarListProps;

  items: any[];
  isDisplayModeEnabled = false;

  /**
   * Updates the component when there are changes in the state.
   */
  override updateSelf(): void {
    // Resolve config properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as ScalarListProps;

    // Extract properties from config props
    const { componentType, displayMode = '', label, value, restProps } = this.configProps$;

    // Update component properties
    this.label$ = label;
    this.displayMode$ = displayMode;

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

    this.isDisplayModeEnabled = ['STACKED_LARGE_VAL', 'DISPLAY_ONLY'].includes(this.displayMode$ as string);
    this.value$ = this.items;
  }
}
