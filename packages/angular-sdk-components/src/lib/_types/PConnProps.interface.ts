// PConnFieldProps extends PConnProps to bring in the common properties that are
// associated with most field components (ex: Dropdown, TextInput, etc.) in the
//  components/field directory
export interface PConnFieldProps {
  label: string;
  required: boolean;
  disabled: boolean;
  value?: string;
  validatemessage: string;
  status?: string;
  readOnly: boolean;
  testId: string;
  helperText: string;
  displayMode?: string;
  hideLabel: boolean;
  placeholder?: string;
  visibility?: boolean;
  onChange: any;
  onBlur?: any;
}
