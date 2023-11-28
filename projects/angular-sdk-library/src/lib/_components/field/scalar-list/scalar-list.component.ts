import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-scalar-list',
  templateUrl: './scalar-list.component.html',
  styleUrls: ['./scalar-list.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class ScalarListComponent {
  @Input() pConn$: any;
  @Input() formGroup$: FormGroup;

  configProps$: Object;
  label$: string = '';
  value$: any;
  displayMode$: string = '';
  items: Array<any>;
  isDisplayModeEnabled: Boolean = false;
  angularPConnectData: any = {};
  controlName$: string;
  fieldControl = new FormControl('', null);
  bHasForm$: boolean = true;
  bReadonly$: boolean = false;

  constructor(private angularPConnect: AngularPConnectService) {}

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
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());
    this.label$ = this.configProps$['label'];
    const componentType = this.configProps$['componentType'];
    const scalarValues = this.configProps$['value'];
    this.displayMode$ = this.configProps$['displayMode'];
    const restProps = this.configProps$['restProps'];
    console.log('scalar values: ', scalarValues);
    this.items = scalarValues?.map((scalarValue) => {
      console.log('scalar value: ', scalarValue);
      return this.pConn$.createComponent(
        {
          type: componentType,
          config: {
            value: scalarValue,
            displayMode: 'LABELS_LEFT',
            label: this.label$,
            ...restProps,
            readOnly: 'true'
          }
        },
        '',
        '',
        {}
      ); // 2nd, 3rd, and 4th args empty string/object/null until typedef marked correctly as optional;
    });
    this.isDisplayModeEnabled = ['LABELS_LEFT', 'STACKED_LARGE_VAL', 'DISPLAY_ONLY'].includes(this.displayMode$);
    this.value$ = this.items;
  }
}
