import { Component, OnInit, Input, ChangeDetectorRef, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { interval } from 'rxjs';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { handleEvent } from '../../../_helpers/event-util';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatOptionModule, forwardRef(() => ComponentMapperComponent)]
})
export class DropdownComponent implements OnInit {
  @Input() pConn$: any;
  @Input() formGroup$: FormGroup;

  // Used with AngularPConnect
  angularPConnectData: any = {};
  configProps$: any;

  label$: string = '';
  value$: string = '';
  bRequired$: boolean = false;
  bReadonly$: boolean = false;
  bDisabled$: boolean = false;
  bVisible$: boolean = true;
  displayMode$: string = '';
  controlName$: string;
  bHasForm$: boolean = true;
  options$: Array<any>;
  componentReference: string = '';
  testId: string = '';
  helperText: string;
  hideLabel: any;
  fieldControl = new FormControl('', null);
  fieldMetadata: Array<any>;
  localeContext: string = '';
  localeClass: string = '';
  localeName: string = '';
  localePath: string = '';

  constructor(private angularPConnect: AngularPConnectService, private cdRef: ChangeDetectorRef, private utils: Utils) {}

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    this.controlName$ = this.angularPConnect.getComponentID(this);

    // Then, continue on with other initialization

    // call updateSelf when initializing
    //this.updateSelf();
    this.checkAndUpdate();

    if (this.formGroup$ != null) {
      // add control to formGroup
      this.formGroup$.addControl(this.controlName$, this.fieldControl);
      this.fieldControl.setValue(this.value$);
      // this.fieldControl.setValue(this.pConn$.getLocalizedValue(
      //   this.value$,
      //   this.localePath,
      //   this.pConn$.getLocaleRuleNameFromKeys(this.localeClass, this.localeContext, this.localeName)
      // ));
      this.bHasForm$ = true;
    } else {
      this.bReadonly$ = true;
      this.bHasForm$ = false;
    }
  }

  ngOnDestroy(): void {
    if (this.formGroup$ != null) {
      this.formGroup$.removeControl(this.controlName$);
    }

    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  // Callback passed when subscribing to store change
  onStateChange() {
    this.checkAndUpdate();
  }

  checkAndUpdate() {
    // Should always check the bridge to see if the component should
    // update itself (re-render)
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);

    // ONLY call updateSelf when the component should update
    if (bUpdateSelf) {
      this.updateSelf();
    }
  }

  // updateSelf
  updateSelf(): void {
    // moved this from ngOnInit() and call this from there instead...
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());

    if (this.configProps$['value'] != undefined) {
      this.value$ = this.configProps$['value'];
    }

    this.testId = this.configProps$['testId'];
    this.displayMode$ = this.configProps$['displayMode'];
    this.label$ = this.configProps$['label'];
    this.helperText = this.configProps$['helperText'];
    this.hideLabel = this.configProps$['hideLabel'];
    // timeout and detectChanges to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      if (this.configProps$['required'] != null) {
        this.bRequired$ = this.utils.getBooleanValue(this.configProps$['required']);
      }
      this.cdRef.detectChanges();
    });

    if (this.configProps$['visibility'] != null) {
      this.bVisible$ = this.utils.getBooleanValue(this.configProps$['visibility']);
    }

    // disabled
    if (this.configProps$['disabled'] != undefined) {
      this.bDisabled$ = this.utils.getBooleanValue(this.configProps$['disabled']);
    }

    if (this.bDisabled$) {
      this.fieldControl.disable();
    } else {
      this.fieldControl.enable();
    }

    if (this.configProps$['readOnly'] != null) {
      this.bReadonly$ = this.utils.getBooleanValue(this.configProps$['readOnly']);
    }

    this.componentReference = this.pConn$.getStateProps().value;

    const optionsList = this.utils.getOptionList(this.configProps$, this.pConn$.getDataObject());
    optionsList?.unshift({ key: 'Select', value: this.pConn$.getLocalizedValue('Select...', '', '') });
    this.options$ = optionsList;
    if (this.value$ === '' && !this.bReadonly$) {
      this.value$ = 'Select';
    }

    const propName = this.pConn$.getStateProps().value;
    const className = this.pConn$.getCaseInfo().getClassName();
    const refName = propName?.slice(propName.lastIndexOf('.') + 1);

    this.fieldMetadata = this.configProps$['fieldMetadata'];
    const metaData = Array.isArray(this.fieldMetadata)
    ? this.fieldMetadata.filter(field => field?.classID === className)[0]
    : this.fieldMetadata;

    let displayName = metaData?.datasource?.propertyForDisplayText;
    displayName = displayName?.slice(displayName.lastIndexOf('.') + 1);
    this.localeContext = metaData?.datasource?.tableType === 'DataPage' ? 'datapage' : 'associated';
    this.localeClass = this.localeContext === 'datapage' ? '@baseclass' : className;
    this.localeName = this.localeContext === 'datapage' ? metaData?.datasource?.name : refName;
    this.localePath = this.localeContext === 'datapage' ? displayName : this.localeName;
    // trigger display of error message with field control
    if (this.angularPConnectData.validateMessage != null && this.angularPConnectData.validateMessage != '') {
      let timer = interval(100).subscribe(() => {
        this.fieldControl.setErrors({ message: true });
        this.fieldControl.markAsTouched();

        timer.unsubscribe();
      });
    }
  }

  isSelected(buttonValue: string): boolean {
    if (this.value$ === buttonValue) {
      return true;
    }

    return false;
  }

  fieldOnChange(event: any) {
    if (event?.value === 'Select') {
      event.value = '';
    }
    const actionsApi = this.pConn$?.getActionsApi();
    const propName = this.pConn$?.getStateProps().value;
    handleEvent(actionsApi, 'changeNblur', propName, event.value);
    if (this.configProps$?.onRecordChange) {
      this.configProps$.onRecordChange(event);
    }
  }

  fieldOnClick(event: any) {}

  fieldOnBlur(event: any) {
    // PConnect wants to use eventHandler for onBlur
    this.angularPConnectData.actions.onBlur(this, event);
  }

  getErrorMessage() {
    let errMessage: string = '';

    // look for validation messages for json, pre-defined or just an error pushed from workitem (400)
    if (this.fieldControl.hasError('message')) {
      errMessage = this.angularPConnectData.validateMessage;
      return errMessage;
    } else if (this.fieldControl.hasError('required')) {
      errMessage = 'You must enter a value';
    } else if (this.fieldControl.errors) {
      errMessage = this.fieldControl.errors.toString();
    }

    return errMessage;
  }
}
