import { Directive, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';
import { FieldBase } from './field.base';
import { handleEvent } from '../../../_helpers/event-util';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

const OPERATORS_DP = 'D_pyGetOperatorsForCurrentApplication';
const DROPDOWN_LIST = 'Drop-down list';
const SEARCH_BOX = 'Search box';

const DISPLAY_TYPES = {
  [DROPDOWN_LIST]: 'dropdown',
  [SEARCH_BOX]: 'searchbox'
};

function isUserNameAvailable(user) {
  return typeof user === 'object' && user !== null && user.userName;
}

function getUserName(user) {
  return user.userName;
}

interface UserReferenceProps extends Omit<PConnFieldProps, 'value'> {
  // If any, enter additional props that only exist on UserReference here
  displayAs?: string;
  value?: any;
  showAsFormattedText?: boolean;
  additionalProps?: object;
  onRecordChange?: any;
}

@Directive()
export abstract class UserReferenceBase extends FieldBase implements OnInit, OnDestroy {
  configProps$: UserReferenceProps;

  override fieldControl = new FormControl('', null);

  displayAs$?: string;
  userName$: string;
  userID$: string;
  options$: any;
  showAsFormattedText$?: boolean;
  filteredOptions: Observable<any[]>;
  filterValue = '';

  override ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);

    this.controlName$ = this.angularPConnect.getComponentID(this);

    this.checkAndUpdate();

    if (this.formGroup$) {
      // add control to formGroup
      this.formGroup$.addControl(this.controlName$, this.fieldControl);
      this.fieldControl.setValue(this.getValue(this.value$));
    }

    this.filteredOptions = this.fieldControl.valueChanges.pipe(
      startWith(this.getValue(this.value$) || ''),
      map(value => this._filter(value || ''))
    );

    this.actionsApi = this.pConn$.getActionsApi();
    this.propName = this.pConn$.getStateProps().value;
  }

  override async updateSelf() {
    // Resolve configuration properties
    this.configProps$ = this.pConn$.getConfigProps() as UserReferenceProps;

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    // Set component specific properties
    await this.updateUserReferenceProperties(this.configProps$);
  }

  /**
   * Updates the User Referemce component's specific properties based on the configuration.
   */
  async updateUserReferenceProperties(configProps: UserReferenceProps) {
    const { displayAs, value, showAsFormattedText } = configProps;

    this.showAsFormattedText$ = showAsFormattedText;
    this.displayAs$ = displayAs;

    this.value$ = this.pConn$.getConfigProps()?.value;
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
      try {
        const resp = await PCore.getRestClient().invokeRestApi('getListData', { queryPayload }, ''); // 3rd arg empty string until typedef marked correctly
        if (resp?.data) {
          const ddDataSource = resp.data.data.map(listItem => ({
            key: listItem.pyUserIdentifier,
            value: listItem.pyUserName
          }));
          this.options$ = ddDataSource;
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  get type(): string {
    if (this.bReadonly$ && this.showAsFormattedText$) {
      return 'operator';
    }

    return DISPLAY_TYPES[this.displayAs$ ?? ''] || '';
  }

  getValue = user => {
    if (this.displayAs$ === DROPDOWN_LIST) {
      return this.utils.getUserId(user) || getUserName(user);
    }
    return isUserNameAvailable(user) ? getUserName(user) : this.utils.getUserId(user);
  };

  private _filter(value: string): string[] {
    const filterVal = (value || this.filterValue).toLowerCase();
    return this.options$?.filter(option => option.value?.toLowerCase().includes(filterVal));
  }

  /**
   * Handles the change event of a field.
   *
   * @param event The event object.
   */
  override fieldOnChange(event?: any) {
    // Normalize the event value to an empty string if it's 'Select'
    const normalizedValue = event?.value === 'Select' ? '' : event?.value;

    // Update the filter value
    if (event?.target) {
      this.filterValue = (event.target as HTMLInputElement).value;
    }

    // Handle the change event
    handleEvent(this.actionsApi, 'change', this.propName, normalizedValue);
  }

  /**
   * Handles the change event by calling the handleEvent function with the selected option value.
   *
   * @param event The event object containing the selected option.
   */
  optionChanged(event: any) {
    const value = event?.option?.value;
    handleEvent(this.actionsApi, 'change', this.propName, value);
  }

  /**
   * Handles the blur event on a field.
   *
   * @param {Event} event - The blur event.
   *
   * @override
   */
  override fieldOnBlur(event: any) {
    const targetValue = event?.target?.value;

    const matchingOption = this.options$?.find(option => option.value === targetValue);
    const key = matchingOption?.key ?? targetValue;

    // Trigger the change and blur event
    handleEvent(this.actionsApi, 'changeNblur', this.propName, key);

    // Call the onRecordChange callback if it exists
    if (this.configProps$?.onRecordChange) {
      event.target.value = key;
      this.configProps$.onRecordChange(event);
    }
  }
}
