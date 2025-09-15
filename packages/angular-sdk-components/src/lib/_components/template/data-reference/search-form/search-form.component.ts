import { Component, forwardRef, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AngularPConnectData } from '../../../../_bridge/angular-pconnect';
import { getFirstVisibleTabId, getActiveTabId, searchtabsClick } from '../../../../_helpers/tab-utils';
import { MatRadioModule } from '@angular/material/radio';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
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
    MatButtonModule,
    forwardRef(() => ComponentMapperComponent)
  ]
})
export class SearchFormComponent implements OnInit {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;
  @Input() searchSelectCacheKey;

  // For interaction with AngularPConnect
  angularPConnectData: AngularPConnectData = {};
  configProps$: any;

  currentTabId: string;
  nextTabId: string;
  openDialog = false;
  tabItems: any[] = [];
  searchCategoriesComp: any;
  propsToUse: any;
  tabData: any = [];
  tabCountSources: any;
  deferLoadedTabs: any;
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  dialogRef: any;
  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());
    this.propsToUse = { ...this.pConn$.getInheritedProps() };
    this.deferLoadedTabs = this.pConn$.getChildren()[2];
    const cache: any = PCore.getNavigationUtils().getComponentCache(this.searchSelectCacheKey) ?? {};
    const { selectedCategory } = cache;
    const firstTabId = getFirstVisibleTabId(this.deferLoadedTabs, selectedCategory);
    this.currentTabId = getActiveTabId(this.deferLoadedTabs.getPConnect().getChildren(), firstTabId);
    this.updateSelf();
  }

  // updateSelf
  updateSelf(): void {
    this.tabCountSources = getTabCountSources(this.deferLoadedTabs);
    this.tabData = getData(this.deferLoadedTabs, this.tabCountSources, this.currentTabId, this.tabData);
    this.tabItems = this.tabData?.filter(tab => tab.visibility()) || [];
    this.initializeSearchCategories();
  }

  initializeSearchCategories(): void {
    if (this.tabItems.length >= 3) {
      this.searchCategoriesComp = 'dropdown';
    } else if (this.tabItems.length > 1) {
      this.searchCategoriesComp = 'radio';
    }
  }

  handleTabClick(event) {
    const tabId = event.target.value;
    const viewName = this.tabData
      .find((tab: any) => tab.id === this.currentTabId)
      ?.getPConnect()
      .getConfigProps().name;

    if (this.checkIfSelectionsExist(this.pConn$)) {
      event.preventDefault();
      this.nextTabId = tabId;
      this.dialogRef = this.dialog.open(this.dialogTemplate, {
        width: '400px'
      });
    } else {
      // @ts-ignore
      this.publishEvent({ viewName, tabId });
      this.currentTabId = tabId;
      this.tabData = getData(this.deferLoadedTabs, this.tabCountSources, this.currentTabId, this.tabData);
      this.tabItems = this.tabData?.filter(tab => tab.visibility()) || [];
    }
  }

  clearSelectionAndSwitchTab(): void {
    const viewName = this.tabItems
      .find((tab: any) => tab.id === this.currentTabId)
      .getPConnect()
      .getConfigProps().name;

    this.publishEvent({ clearSelections: true, viewName });
    searchtabsClick(this.nextTabId, this.tabData, this.currentTabId);
    this.onDialogClose();
    this.currentTabId = this.nextTabId;
    this.tabData = getData(this.deferLoadedTabs, this.tabCountSources, this.currentTabId, this.tabData);
    this.tabItems = this.tabData?.filter(tab => tab.visibility()) || [];
  }

  onDialogClose(): void {
    this.dialogRef.close();
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
