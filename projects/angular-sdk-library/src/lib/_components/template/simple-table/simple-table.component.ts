import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

interface SimpleTableProps {
  // If any, enter additional props that only exist on this component
  multiRecordDisplayAs: string;
  contextClass: any;
  visibility: boolean;
}

@Component({
  selector: 'app-simple-table',
  templateUrl: './simple-table.component.html',
  styleUrls: ['./simple-table.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class SimpleTableComponent implements OnInit {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  angularPConnectData: AngularPConnectData = {};

  bVisible$: boolean = true;
  configProps$: SimpleTableProps;
  fieldGroupProps: any;

  constructor(
    private angularPConnect: AngularPConnectService,
    private utils: Utils
  ) {}

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    // Then, continue on with other initialization

    // call checkAndUpdate when initializing
    this.checkAndUpdate();
  }

  ngOnDestroy(): void {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
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
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as SimpleTableProps;

    if (this.configProps$.visibility != null) {
      // eslint-disable-next-line no-multi-assign
      this.bVisible$ = this.bVisible$ = this.utils.getBooleanValue(this.configProps$.visibility);
    }

    const { multiRecordDisplayAs } = this.configProps$;
    let { contextClass } = this.configProps$;
    if (!contextClass) {
      // @ts-ignore - Property 'getComponentConfig' is private and only accessible within class 'C11nEnv'
      let listName = this.pConn$.getComponentConfig().referenceList;
      listName = PCore.getAnnotationUtils().getPropertyName(listName);
      // @ts-ignore - Property 'getFieldMetadata' is private and only accessible within class 'C11nEnv'
      contextClass = this.pConn$.getFieldMetadata(listName)?.pageClass;
    }
    if (multiRecordDisplayAs === 'fieldGroup') {
      this.fieldGroupProps = { ...this.configProps$, contextClass };
    }
  }

  // Callback passed when subscribing to store change
  onStateChange() {
    this.checkAndUpdate();
  }
}
