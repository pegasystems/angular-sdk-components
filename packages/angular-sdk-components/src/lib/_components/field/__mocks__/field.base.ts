export class FieldBase {
  pConn$: any;
  formGroup$: any;
  fieldControl: any;
  actionsApi: any;
  propName: string = '';
  value$: string = '';
  displayMode$: string = '';
  label$: string = '';
  testId: string = '';
  placeholder$: string = '';
  helperText$: string = '';
  required$: boolean = false;
  disabled$: boolean = false;
  readOnly$: boolean = false;
  validatemessage$: string = '';
  hideLabel$: boolean = false;
  utils = { getOptionList: jest.fn().mockReturnValue([]) };

  ngOnInit() {}
  updateComponentCommonProperties() {}
}
