import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { FieldBase } from '../field.base';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { Utils } from '../../../_helpers/utils';
import { handleEvent } from '../../../_helpers/event-util';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface IOption {
  key: string;
  value: string;
}

interface RadioButtonsProps extends PConnFieldProps {
  // If any, enter additional props that only exist on RadioButtons here
  inline: boolean;
  fieldMetadata?: any;
  variant?: string;
}

@Component({
  selector: 'app-radio-buttons',
  templateUrl: './radio-buttons.component.html',
  styleUrls: ['./radio-buttons.component.scss'],
  providers: [Utils],
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatRadioModule, forwardRef(() => ComponentMapperComponent)]
})
export class RadioButtonsComponent extends FieldBase {
  configProps$: RadioButtonsProps;

  bInline$ = false;

  options$: IOption[];
  componentReference = '';
  fieldMetadata: any[];
  localeContext = '';
  localeClass = '';
  localeName = '';
  localePath = '';
  localizedValue = '';
  variant?: string;

  /**
   * Updates the component when there are changes in the state.
   */
  override updateSelf(): void {
    // Resolve config properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as RadioButtonsProps;

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    // Extract and normalize the value property
    const { value } = this.configProps$;
    this.value$ = value;

    // Set component specific properties
    this.updateRadioButtonsProperties(this.configProps$);
  }

  /**
   * Updates radio buttons properties based on the provided config props.
   * @param configProps Configuration properties.
   */
  protected updateRadioButtonsProperties(configProps) {
    const { inline, fieldMetadata, variant } = configProps;

    this.variant = variant;
    this.bInline$ = this.utils.getBooleanValue(inline);

    // Get options from config props and data object
    this.options$ = this.utils.getOptionList(configProps, this.pConn$.getDataObject());

    // Extract metadata and locale information
    const className = this.pConn$.getCaseInfo().getClassName();
    const refName = this.propName?.slice(this.propName.lastIndexOf('.') + 1);
    const metaData = Array.isArray(fieldMetadata) ? fieldMetadata.filter(field => field?.classID === className)[0] : fieldMetadata;

    // Determine display name and locale context
    let displayName = metaData?.datasource?.propertyForDisplayText;
    displayName = displayName?.slice(displayName.lastIndexOf('.') + 1);
    this.localeContext = metaData?.datasource?.tableType === 'DataPage' ? 'datapage' : 'associated';
    this.localeClass = this.localeContext === 'datapage' ? '@baseclass' : className;
    this.localeName = this.localeContext === 'datapage' ? metaData?.datasource?.name : refName;
    this.localePath = this.localeContext === 'datapage' ? displayName : this.localeName;

    // Get localized value
    this.localizedValue = this.pConn$.getLocalizedValue(
      this.value$,
      this.localePath,
      this.pConn$.getLocaleRuleNameFromKeys(this.localeClass, this.localeContext, this.localeName)
    );
  }

  isSelected(buttonValue: string): boolean {
    return this.value$ === buttonValue;
  }

  fieldOnChange(event: any) {
    handleEvent(this.actionsApi, 'changeNblur', this.propName, event.value);
  }

  getLocalizedOptionValue(opt: IOption) {
    return this.pConn$.getLocalizedValue(
      opt.value,
      this.localePath,
      this.pConn$.getLocaleRuleNameFromKeys(this.localeClass, this.localeContext, this.localeName)
    );
  }
}
