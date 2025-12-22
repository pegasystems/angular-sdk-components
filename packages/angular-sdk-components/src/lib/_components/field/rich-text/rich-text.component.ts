import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldBase } from '../field.base';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { handleEvent } from '../../../_helpers/event-util';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface RichTextProps extends PConnFieldProps {
  // If any, enter additional props that only exist on RichText here
}

@Component({
  selector: 'app-rich-text',
  templateUrl: './rich-text.component.html',
  styleUrls: ['./rich-text.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, forwardRef(() => ComponentMapperComponent)]
})
export class RichTextComponent extends FieldBase {
  configProps$: RichTextProps;
  info: any;
  error: boolean;
  status: any;

  /**
   * Updates the component when there are changes in the state.
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

  fieldOnChange(editorValue: any) {
    const oldVal = this.value$ ?? '';
    const newVal = editorValue?.editor?.getBody()?.innerHTML ?? '';

    const isValueChanged = newVal.toString() !== oldVal.toString();

    if (isValueChanged || this.status === 'error') {
      const property = this.propName;
      this.pConn$.clearErrorMessages({
        property,
        category: '',
        context: ''
      });
    }
  }

  fieldOnBlur(editorValue: any) {
    const oldVal = this.value$ ?? '';
    if (editorValue.toString() !== oldVal.toString()) {
      handleEvent(this.actionsApi, 'changeNblur', this.propName, editorValue);
    }
  }
}
