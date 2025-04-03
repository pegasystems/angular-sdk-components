// Statically load all "local" components that aren't yet in the npm package

import {
  AutoCompleteComponent,
  CheckBoxComponent,
  CurrencyComponent,
  DateComponent,
  DateTimeComponent,
  DecimalComponent,
  EmailComponent,
  IntegerComponent,
  PercentageComponent,
  TextAreaComponent,
  TextInputComponent
} from '@pega/angular-sdk-material-samples';

/* import end - DO NOT REMOVE */

// localSdkComponentMap is the JSON object where we'll store the components that are
// found locally. If not found here, we'll look in the Pega-provided component map

const localSdkComponentMap = {
  /* map end - DO NOT REMOVE */

  AutoComplete: AutoCompleteComponent,
  Checkbox: CheckBoxComponent,
  Currency: CurrencyComponent,
  Date: DateComponent,
  DateTime: DateTimeComponent,
  Decimal: DecimalComponent,
  Email: EmailComponent,
  Integer: IntegerComponent,
  Percentage: PercentageComponent,
  TextInput: TextInputComponent,
  TextArea: TextAreaComponent
};

export default localSdkComponentMap;
