import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { getTransientTabs, getVisibleTabs, tabClick } from '../../../_helpers/tabUtils';
import { CommonModule } from '@angular/common';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

declare const window: any;

@Component({
  selector: 'app-sub-tabs',
  templateUrl: './sub-tabs.component.html',
  styleUrls: ['./sub-tabs.component.scss'],
  standalone: true,
  imports: [MatTabsModule, CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class SubTabsComponent implements OnInit {
  @Input() pConn$: any;
  @Input() formGroup$: FormGroup;

  configProps$: Object;
  arChildren$: Array<any>;
  angularPConnectData: any = {};
  PCore$: any;
  defaultTabIndex = 0;
  currentTabId = this.defaultTabIndex.toString();
  tabItems: Array<any>;
  availableTabs: any;
  constructor(private angularPConnect: AngularPConnectService) {}

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    if (!this.PCore$) {
      this.PCore$ = window.PCore;
    }
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
