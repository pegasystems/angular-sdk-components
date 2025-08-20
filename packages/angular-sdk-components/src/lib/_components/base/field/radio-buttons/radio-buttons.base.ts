import { Directive } from '@angular/core';
import { FormControl } from '@angular/forms';

import { FieldBase } from '../field.base';
import { PConnFieldProps } from '../../../../_types/PConnProps.interface';

interface IOption {
  key: string;
  value: string;
}

interface RadioButtonsProps extends PConnFieldProps {
  // If any, enter additional props that only exist on RadioButtons here
  inline: boolean;
  fieldMetadata?: any;
}

@Directive()
export class RadioButtonsBase extends FieldBase {
  configProps$: RadioButtonsProps;

  override fieldControl = new FormControl('', null);

  bInline$ = false;
  options$: IOption[];
  localeContext = '';
  localeClass = '';
  localeName = '';
  localePath = '';
  localizedValue = '';

  /**
   * Updates the component's properties based on the configuration.
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
    const { inline, fieldMetadata } = configProps;
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

  /**
   * Retrieves the localized value of a given option.
   *
   * @param {IOption} opt - The option to retrieve the localized value for.
   * @returns {string} The localized value of the option.
   */
  getLocalizedOptionValue(opt: IOption) {
    return this.pConn$.getLocalizedValue(
      opt.value,
      this.localePath,
      this.pConn$.getLocaleRuleNameFromKeys(this.localeClass, this.localeContext, this.localeName)
    );
  }
}
