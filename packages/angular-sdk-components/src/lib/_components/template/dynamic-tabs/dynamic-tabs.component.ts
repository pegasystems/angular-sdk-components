import { Component, Input, OnDestroy, OnInit, forwardRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { buildView } from '../../../_helpers/field-group-utils';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

interface DynamicTabsProps {
  referenceList: string;
  template: string;
}

@Component({
  selector: 'app-dynamic-tabs',
  templateUrl: './dynamic-tabs.component.html',
  styleUrls: ['./dynamic-tabs.component.scss'],
  standalone: true,
  imports: [CommonModule, MatTabsModule, forwardRef(() => ComponentMapperComponent)]
})
export class DynamicTabsComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  angularPConnectData: AngularPConnectData = {};
  tabsItems: any[];

  constructor(private angularPConnect: AngularPConnectService) {}

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    this.checkAndUpdate();
  }

  ngOnDestroy() {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  onStateChange() {
    this.checkAndUpdate();
  }

  checkAndUpdate() {
    // Should always check the bridge to see if the component should update itself (re-render)
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);

    // ONLY call updateSelf when the component should update
    if (bUpdateSelf) {
      this.updateSelf();
    }
  }

  updateSelf() {
    const { referenceList } = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as DynamicTabsProps;

    const { tablabel } = this.pConn$.getComponentConfig();
    const tablabelProp = PCore.getAnnotationUtils().getPropertyName(tablabel);

    this.pConn$.setInheritedProp('displayMode', 'LABELS_LEFT');
    this.pConn$.setInheritedProp('readOnly', true);

    const referenceListData = this.pConn$.getValue(`${referenceList}.pxResults`, ''); // 2nd arg empty string until typedefs properly allow optional

    this.tabsItems =
      referenceListData?.map((item, i) => {
        const currentTabLabel = item[tablabelProp] || PCore.getLocaleUtils().getLocaleValue('No label specified in config', 'Generic');
        return {
          id: i,
          name: currentTabLabel,
          content: buildView(this.pConn$, i, '')
        };
      }) || [];
  }
}
