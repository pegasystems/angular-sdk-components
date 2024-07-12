import { Component, OnInit, Input, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';
import { map, Observable, startWith } from 'rxjs';

const OPERATORS_DP = 'D_pyGetOperatorsForCurrentApplication';
const DROPDOWN_LIST = 'Drop-down list';
const SEARCH_BOX = 'Search box';

interface UserReferenceProps extends Omit<PConnFieldProps, 'value'> {
  // If any, enter additional props that only exist on UserReference here
  displayAs?: string;
  value?: any;
  showAsFormattedText?: boolean;
  additionalProps?: object;
}

@Component({
  selector: 'app-user-reference',
  templateUrl: './user-reference.component.html',
  styleUrls: ['./user-reference.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatAutocompleteModule,
    forwardRef(() => ComponentMapperComponent)
  ]
})
export class UserReferenceComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  angularPConnectData: AngularPConnectData = {};
  controlName$: string;
  value$;
  userName$: string;
  label$: string;
  userID$: string;
  options$: any;
  bReadonly$: boolean;
  bRequired$: boolean;
  showAsFormattedText$?: boolean;
  displayAs$?: string;
  testId: string;
  helperText: string;
  placeholder: string;
  displayMode$?: string;
  filteredOptions: Observable<any[]>;
  filterValue = '';

  fieldControl = new FormControl('', null);

  constructor(
    private angularPConnect: AngularPConnectService,
    private utils: Utils
  ) {}

  async ngOnInit(): Promise<void> {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);

    this.controlName$ = this.angularPConnect.getComponentID(this);

    await this.checkAndUpdate();

    if (this.formGroup$) {
      // add control to formGroup
      this.formGroup$.addControl(this.controlName$, this.fieldControl);
      this.fieldControl.setValue(this.value$);
    }

    this.filteredOptions = this.fieldControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );
  }

  ngOnDestroy() {
    if (this.formGroup$) {
      this.formGroup$.removeControl(this.controlName$);
    }

    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  get type(): string {
    if (this.bReadonly$ && this.showAsFormattedText$) {
      return 'operator';
    }
    if (this.displayAs$ === DROPDOWN_LIST) {
      return 'dropdown';
    }
    if (this.displayAs$ === SEARCH_BOX) {
      return 'searchbox';
    }

    return '';
  }

  // Callback passed when subscribing to store change
  async onStateChange() {
    await this.checkAndUpdate();
  }

  private _filter(value: string): string[] {
    const filterVal = (value || this.filterValue).toLowerCase();
    return this.options$?.filter(option => option.value?.toLowerCase().includes(filterVal));
  }

  async checkAndUpdate() {
    // Should always check the bridge to see if the component should
    // update itself (re-render)
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);

    // ONLY call updateSelf when the component should update
    if (bUpdateSelf) {
      await this.updateSelf();
    }
  }

  async updateSelf() {
    const props = this.pConn$.getConfigProps() as UserReferenceProps;
    this.testId = props.testId;

    const { label, displayAs, value, showAsFormattedText, helperText, placeholder, displayMode } = props;

    this.label$ = label;
    this.showAsFormattedText$ = showAsFormattedText;
    this.displayAs$ = displayAs;
    this.helperText = helperText;
    this.placeholder = placeholder || '';
    this.displayMode$ = displayMode;

    const { readOnly, required } = props;
    [this.bReadonly$, this.bRequired$] = [readOnly, required].map(prop => prop === true || (typeof prop === 'string' && prop === 'true'));

    const isUserNameAvailable = user => {
      return typeof user === 'object' && user !== null && user.userName;
    };

    this.userID$ = this.utils.getUserId(value);

    if (this.userID$ && this.bReadonly$ && this.showAsFormattedText$) {
      if (isUserNameAvailable(value)) {
        this.userName$ = value.userName;
      } else {
        // if same user ref field is referred in view as editable & readonly formatted text
        // referenced users won't be available, so get user details from dx api
        const { getOperatorDetails } = PCore.getUserApi();
        getOperatorDetails(this.userID$).then((resp: any) => {
          if (resp.data && resp.data.pyOperatorInfo && resp.data.pyOperatorInfo.pyUserName) {
            this.userName$ = resp.data.pyOperatorInfo.pyUserName;
          }
        });
      }
    } else if (displayAs === DROPDOWN_LIST || displayAs === SEARCH_BOX) {
      const queryPayload = {
        dataViewName: OPERATORS_DP
      };
      const resp: any = await PCore.getRestClient().invokeRestApi('getListData', { queryPayload } as any, ''); // 3rd arg empty string until typedef marked correctly
      if (resp?.data) {
        const ddDataSource = resp.data.data.map(listItem => ({
          key: listItem.pyUserIdentifier,
          value: listItem.pyUserName
        }));
        this.options$ = ddDataSource;
      }
    }
  }

  fieldOnChange(event: any) {
    if (event?.value === 'Select') {
      event.value = '';
    }
    if (event?.target) {
      this.filterValue = (event.target as HTMLInputElement).value;
    }
    this.angularPConnectData.actions?.onChange(this, event);
  }

  fieldOnBlur(event: any) {
    let key = '';
    if (event?.target?.value) {
      const index = this.options$?.findIndex(element => element.value === event.target.value);
      key = index > -1 ? (key = this.options$[index].key) : event.target.value;
    }

    const eve = {
      value: key
    };
    // PConnect wants to use eventHandler for onBlur
    this.angularPConnectData.actions?.onChange(this, eve);
  }

  getErrorMessage() {
    let errMessage = '';

    // look for validation messages for json, pre-defined or just an error pushed from workitem (400)
    if (this.fieldControl.hasError('message')) {
      errMessage = this.angularPConnectData.validateMessage ?? '';
      return errMessage;
    }
    if (this.fieldControl.hasError('required')) {
      errMessage = 'You must enter a value';
    } else if (this.fieldControl.errors) {
      errMessage = this.fieldControl.errors.toString();
    }

    return errMessage;
  }
}
