import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { getTransientTabs, getVisibleTabs, tabClick } from '../../../_helpers/tab-utils';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { DetailsTemplateBase } from '../base/details-template-base';

@Component({
  selector: 'app-details-sub-tabs',
  templateUrl: './details-sub-tabs.component.html',
  styleUrls: ['./details-sub-tabs.component.scss'],
  imports: [MatTabsModule, CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class DetailsSubTabsComponent extends DetailsTemplateBase {
  override pConn$: typeof PConnect;

  currentTabId = '0';
  tabItems: any[];
  availableTabs: any[];

  override updateSelf() {
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
