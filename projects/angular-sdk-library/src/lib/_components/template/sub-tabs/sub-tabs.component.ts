import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { getTransientTabs, getVisibleTabs, tabClick } from '../../../_helpers/tab-utils';
import { CommonModule } from '@angular/common';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-sub-tabs',
  templateUrl: './sub-tabs.component.html',
  styleUrls: ['./sub-tabs.component.scss'],
  standalone: true,
  imports: [MatTabsModule, CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class SubTabsComponent implements OnInit {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  angularPConnectData: AngularPConnectData = {};

  arChildren$: Array<any>;
  defaultTabIndex = 0;
  currentTabId = this.defaultTabIndex.toString();
  tabItems: Array<any>;
  availableTabs: any;

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
    // Should always check the bridge to see if the component should
    // update itself (re-render)
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);

    // ONLY call updateSelf when the component should update
    if (bUpdateSelf) {
      this.updateSelf();
    }
  }

  updateSelf() {
    const children = this.pConn$?.getChildren();
    const deferLoadedTabs = children[0];
    this.availableTabs = getVisibleTabs(deferLoadedTabs, 'tabsSubs');
    this.updateTabContent();
  }

  updateTabContent() {
    const tempTabItems = getTransientTabs(this.availableTabs, this.currentTabId, this.tabItems);
    this.tabItems = tempTabItems;
  }

  handleTabClick(event) {
    const { index } = event;
    this.currentTabId = index.toString();
    tabClick(index, this.availableTabs, this.currentTabId, this.tabItems);
    const tempTabItems = getTransientTabs(this.availableTabs, this.currentTabId, this.tabItems);
    this.tabItems[index].content = tempTabItems[index].content;
  }
}
