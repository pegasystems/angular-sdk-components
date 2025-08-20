/* eslint-disable @typescript-eslint/no-use-before-define */
import { Directive, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';

import { FieldBase } from '../field.base';
import { PConnFieldProps } from '../../../../_types/PConnProps.interface';

interface UserReferenceProps extends Omit<PConnFieldProps, 'value'> {
  // If any, enter additional props that only exist on UserReference here
  displayAs?: string;
  value?: any;
  showAsFormattedText?: boolean;
  additionalProps?: object;
  onRecordChange?: any;
}

const OPERATORS_DP = 'D_pyGetOperatorsForCurrentApplication';
const DROPDOWN_LIST = 'Drop-down list';
const SEARCH_BOX = 'Search box';

@Directive()
export class UserReferenceBase extends FieldBase implements OnInit, OnDestroy {
  override fieldControl = new FormControl('', null);

  configProps$: UserReferenceProps;
  userName$: string;
  userID$: string;
  options$: any;
  showAsFormattedText$?: boolean;
  displayAs$?: string;
  filteredOptions: Observable<any[]>;
  filterValue = '';
  onRecordChange: any;

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    this.filteredOptions = this.fieldControl.valueChanges.pipe(
      startWith(this.getValue(this.value$) || ''),
      map(value => this._filter(value || ''))
    );
  }

  /**
   * Updates the component's properties based on the configuration.
   */
  override updateSelf() {
    // Resolve configuration properties
    this.configProps$ = this.pConn$.getConfigProps() as UserReferenceProps;

    // Update component common properties
    this.updateComponentCommonProperties(this.configProps$);

    // Set component specific properties
    this.updateUserReferenceProperties(this.configProps$);
  }

  /**
   * Updates the User Referemce component's specific properties based on the configuration.
   */
  updateUserReferenceProperties(configProps: UserReferenceProps) {
    const { displayAs, value, showAsFormattedText, onRecordChange } = configProps;

    this.onRecordChange = onRecordChange;
    this.showAsFormattedText$ = showAsFormattedText;
    this.displayAs$ = displayAs;

    if (value && typeof value === 'object') {
      this.value$ = value.userName ? value.userName : '';
    } else {
      this.value$ = value || '';
    }

    this.userID$ = this.utils.getUserId(value);

    if (this.userID$ && this.bReadonly$ && this.showAsFormattedText$) {
      if (this.isUserNameAvailable(value)) {
        this.userName$ = value.userName;
      } else {
        // if same user ref field is referred in view as editable & readonly formatted text
        // referenced users won't be available, so get user details from dx api

        getUserName(this.pConn$, this.userID$).then(name => {
          this.userName$ = name;
        });
      }
    } else if (displayAs === DROPDOWN_LIST || displayAs === SEARCH_BOX) {
      const queryPayload = {
        dataViewName: OPERATORS_DP
      };
      try {
        PCore.getRestClient()
          .invokeRestApi('getListData', { queryPayload }, '') // 3rd arg empty string until typedef marked correctly
          .then(resp => {
            if (resp?.data) {
              const ddDataSource = resp.data.data.map(listItem => ({
                key: listItem.pyUserIdentifier,
                value: listItem.pyUserName
              }));
              this.options$ = ddDataSource;
            }
          });
      } catch (error) {
        console.log(error);
      }
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

  private _filter(value: string): string[] {
    const filterVal = (value || this.filterValue).toLowerCase();
    return this.options$?.filter(option => option.value?.toLowerCase().includes(filterVal));
  }

  private isUserNameAvailable = user => {
    return typeof user === 'object' && user !== null && user.userName;
  };

  getUserName = user => {
    return user.userName;
  };

  getValue = user => {
    if (this.displayAs$ === DROPDOWN_LIST) {
      return this.utils.getUserId(user) || this.getUserName(user);
    }
    return this.isUserNameAvailable(user) ? this.getUserName(user) : this.utils.getUserId(user);
  };
}

const buildColumnForDisplayValue = dataObj => {
  if (dataObj.columns) {
    dataObj.columns = dataObj.columns.map(column => {
      const tempColObj = { ...column };
      if (tempColObj.key === 'true') {
        tempColObj.useForSearch = true;
      } else {
        tempColObj.useForSearch = false;
      }
      return tempColObj;
    });
  }
};

function getUserName(pConn, userId = ''): Promise<string> {
  return new Promise(resolve => {
    const { parameters = {}, referenceList } = pConn.getConfigProps();
    const contextName = pConn.getContextName();

    // eslint-disable-next-line @typescript-eslint/no-shadow
    const OPERATORS_DP = referenceList || PCore.getEnvironmentInfo().getDefaultOperatorDP() || '';

    const columns = [
      {
        value: 'pyUserName',
        display: 'true',
        useForSearch: true,
        primary: 'true'
      },
      {
        value: 'pyUserIdentifier',
        setProperty: 'Associated property',
        key: 'true',
        display: 'true',
        secondary: 'true',
        useForSearch: true
      }
    ];

    const dataConfig: any = {
      dataSource: OPERATORS_DP,
      parameters,
      matchPosition: 'equals',
      listType: 'datapage',
      columns,
      cacheLifeSpan: 'form',
      deferDatasource: false,
      maxResultsDisplay: '1',
      ignoreCase: true
    };

    PCore.getDataApi()
      .init(dataConfig, contextName)
      .then(dataApiObj => {
        buildColumnForDisplayValue(dataApiObj);
        dataApiObj.registerForBufferedCall({ waitTime: 50 });
        dataApiObj.fetchData(userId).then((response: any) => {
          resolve(response.data?.[0]?.pyUserName || userId);
        });
      });
  });
}
