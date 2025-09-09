import { Component, forwardRef, Input, OnChanges, OnInit, TemplateRef, ViewChild } from '@angular/core';
// import { MatDialog } from '@angular/material/dialog';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AngularPConnectService, AngularPConnectData } from '../../../../_bridge/angular-pconnect';
import { getFirstVisibleTabId, getActiveTabId, searchtabsClick } from '../../../../_helpers/tab-utils';
import { MatRadioModule } from '@angular/material/radio';
import { TabsService } from './tabs.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule, MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { ComponentMapperComponent } from '../../../../_bridge/component-mapper/component-mapper.component';
import { getTabCountSources, getData } from './tabsData';
import { getFieldMeta } from '../utils';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatRadioModule,
    MatOptionModule,
    MatSelectModule,
    MatTabsModule,
    MatDialogModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    forwardRef(() => ComponentMapperComponent)
  ]
})
export class SearchFormComponent implements OnInit, OnChanges {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;
  @Input() searchSelectCacheKey;

  // For interaction with AngularPConnect
  angularPConnectData: AngularPConnectData = {};
  configProps$: any;

  currentTabId: string;
  nextTabId: string | null = null;
  openDialog = false;
  tabItems: any[] = [];
  searchCategoriesComp: any;
  propsToUse: any;
  tabData: any = [];
  tabCountSources: any;
  deferLoadedTabs: any;
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  constructor(
    private angularPConnect: AngularPConnectService,
    private tabsService: TabsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    console.log('on Init');
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);

    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());
    this.propsToUse = { ...this.pConn$.getInheritedProps() };
    this.deferLoadedTabs = this.pConn$.getChildren()[2];
    console.log('this.deferLoadedTabs', this.deferLoadedTabs);
    // const tabCountSources = getTabCountSources(deferLoadedTabs);
    // getData(deferLoadedTabs, tabCountSources);
    const cache: any = PCore.getNavigationUtils().getComponentCache(this.searchSelectCacheKey) ?? {};
    const { selectedCategory } = cache;
    const firstTabId = getFirstVisibleTabId(this.deferLoadedTabs, selectedCategory);
    this.currentTabId = getActiveTabId(this.deferLoadedTabs.getPConnect().getChildren(), firstTabId);
    console.log('this.currentTabId updateSelf', this.currentTabId);
    this.checkAndUpdate();
    // this.tabCountSources = getTabCountSources(this.deferLoadedTabs);
    // this.tabData = getData(this.deferLoadedTabs, this.tabCountSources, this.currentTabId, this.tabData);
    // this.tabsService.init(deferLoadedTabs, this.currentTabId, '');
    // this.tabsService.getData$().subscribe(data => {
    //   this.tabData = data;
    //   this.tabItems = this.tabData?.filter(tab => tab.visibility()) || [];
    //   console.log('SearchForm updateSelf tabItems: ', this.tabItems);
    //   this.initializeSearchCategories();
    // });
  }

  ngOnChanges(changes): void {
    console.log('on changes', changes);
    // const firstTabId = getFirstVisibleTabId(this.deferLoadedTabs, selectedCategory);
    // this.currentTabId = getActiveTabId(this.deferLoadedTabs.getPConnect().getChildren(), firstTabId);
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

  // updateSelf
  updateSelf(): void {
    // this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());
    // this.propsToUse = { ...this.pConn$.getInheritedProps() };
    // const deferLoadedTabs = this.pConn$.getChildren()[2];
    // const cache: any = PCore.getNavigationUtils().getComponentCache(this.searchSelectCacheKey) ?? {};
    // const { selectedCategory } = cache;
    // const firstTabId = getFirstVisibleTabId(deferLoadedTabs, selectedCategory);
    // this.currentTabId = getActiveTabId(deferLoadedTabs.getPConnect().getChildren(), firstTabId);
    // console.log('this.currentTabId updateSelf', this.currentTabId);
    // this.tabsService.init(deferLoadedTabs, this.currentTabId, '');

    this.tabCountSources = getTabCountSources(this.deferLoadedTabs);
    this.tabData = getData(this.deferLoadedTabs, this.tabCountSources, this.currentTabId, this.tabData);
    this.tabItems = this.tabData?.filter(tab => tab.visibility()) || [];
    console.log('this.tabItems 2', this.tabItems);
    this.initializeSearchCategories();
    // this.tabData = this.tabsService.getData$();
    // this.tabsService.getData$().subscribe(data => {
    //   this.tabData = data;
    //   this.tabItems = this.tabData?.filter(tab => tab.visibility()) || [];
    //   console.log('SearchForm updateSelf tabItems: ', this.tabItems);
    //   this.initializeSearchCategories();
    // });
  }

  initializeSearchCategories(): void {
    if (this.tabItems.length > 3) {
      this.searchCategoriesComp = 'dropdown';
    } else if (this.tabItems.length > 1) {
      this.searchCategoriesComp = 'radio';
    }
  }

  handleTabClick(tabId: any) {
    console.log('tabId', tabId);
    console.log('this.currentTabId', this.currentTabId);
    // this.currentTabId = tabId;
    const viewName = this.tabData
      .find((tab: any) => tab.id === this.currentTabId)
      ?.getPConnect()
      .getConfigProps().name;

    if (this.checkIfSelectionsExist(this.pConn$)) {
      this.nextTabId = tabId;
      // this.openDialog = true;
      this.dialog.open(this.dialogTemplate, {
        width: '400px'
      });
    } else {
      // @ts-ignore
      this.publishEvent({ viewName, tabId });
      // searchtabsClick(tabId, this.tabData, this.currentTabId);
      this.currentTabId = tabId;
      this.tabData = getData(this.deferLoadedTabs, this.tabCountSources, this.currentTabId, this.tabData);
      this.tabItems = this.tabData?.filter(tab => tab.visibility()) || [];
      // const index = this.tabData.findIndex(tab => tab.id === tabId);
      // console.log('this.tabData after click', this.tabData);
      // const i = this.tabItems.findIndex(tab => tab.id === tabId);
      // this.tabItems[i].content = this.tabData[index].content;
      // // this.tabItems = this.tabData?.filter(tab => tab.visibility()) || [];
      // console.log('this.tabItems', this.tabItems);
      // this.tabsService.updateCurrentTabId(tabId, '');
    }
  }

  getSelectedIndex(): number {
    return this.tabItems.findIndex(tab => tab.id === this.currentTabId);
  }

  clearSelectionAndSwitchTab(): void {
    const viewName = this.tabItems
      .find((tab: any) => tab.id === this.currentTabId)
      .getPConnect()
      .getConfigProps().name;

    this.publishEvent({ clearSelections: true, viewName });
    searchtabsClick(this.nextTabId, this.tabData, this.currentTabId);
    this.openDialog = false;
  }

  onDialogClose(): void {
    this.openDialog = false;
  }

  publishEvent({ clearSelections, viewName }) {
    const payload: any = {};

    if (clearSelections) {
      payload.clearSelections = clearSelections;
    }

    if (viewName) {
      payload.viewName = viewName;
    }

    PCore.getPubSubUtils().publish('update-advanced-search-selections', payload);
  }

  checkIfSelectionsExist(getPConnect) {
    const { MULTI } = PCore.getConstants().LIST_SELECTION_MODE;
    const { selectionMode, readonlyContextList, contextPage, contextClass, name } = getPConnect.getConfigProps();
    const isMultiSelectMode = selectionMode === MULTI;

    const dataRelationshipContext = contextClass && name ? name : null;

    const { compositeKeys } = getFieldMeta(getPConnect, dataRelationshipContext);

    let selectionsExist = false;
    if (isMultiSelectMode) {
      selectionsExist = readonlyContextList?.length > 0;
    } else if (contextPage) {
      selectionsExist = compositeKeys?.filter(key => !['', null, undefined].includes(contextPage[key]))?.length > 0;
    }
    return selectionsExist;
  }
}
