import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface ScalarListProps extends Omit<PConnFieldProps, 'value'> {
  // If any, enter additional props that only exist on ScalarList here
  displayInModal: boolean;
  value: any[];
  componentType: string;
  restProps?: object;
}

@Component({
  selector: 'app-scalar-list',
  templateUrl: './scalar-list.component.html',
  styleUrls: ['./scalar-list.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class ScalarListComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  angularPConnectData: AngularPConnectData = {};
  configProps$: ScalarListProps;

  label$ = '';
  value$: any;
  displayMode$?: string = '';
  items: any[];
  isDisplayModeEnabled = false;
  controlName$: string;
  fieldControl = new FormControl('', null);
  bHasForm$ = true;
  bReadonly$ = false;

  constructor(private angularPConnect: AngularPConnectService) {}

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    this.controlName$ = this.angularPConnect.getComponentID(this);
    // Then, continue on with other initialization

    // call updateSelf when initializing
    // this.updateSelf();
    this.checkAndUpdate();

    if (this.formGroup$) {
      // add control to formGroup
      this.formGroup$.addControl(this.controlName$, this.fieldControl);
      this.fieldControl.setValue(this.value$);
      this.bHasForm$ = true;
    } else {
      this.bReadonly$ = true;
      this.bHasForm$ = false;
    }
  }

  ngOnDestroy(): void {
    if (this.formGroup$) {
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
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as ScalarListProps;
    this.label$ = this.configProps$.label;
    const componentType = this.configProps$.componentType;
    const scalarValues = this.configProps$.value;
    this.displayMode$ = this.configProps$.displayMode;
    const restProps = this.configProps$.restProps;
    console.log('scalar values: ', scalarValues);
    this.items = scalarValues?.map(scalarValue => {
      console.log('scalar value: ', scalarValue);
      return this.pConn$.createComponent(
        {
          type: componentType,
          config: {
            value: scalarValue,
            displayMode: 'DISPLAY_ONLY',
            label: this.label$,
            ...restProps,
            readOnly: true
          }
        },
        '',
        0,
        {}
      ); // 2nd, 3rd, and 4th args empty string/object/null until typedef marked correctly as optional;
    });
    this.isDisplayModeEnabled = ['STACKED_LARGE_VAL', 'DISPLAY_ONLY'].includes(this.displayMode$ as string);
    this.value$ = this.items;
  }
}
