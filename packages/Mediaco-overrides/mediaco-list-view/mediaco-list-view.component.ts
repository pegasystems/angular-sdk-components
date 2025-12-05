import { Component, OnInit, Input, ViewChild, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DragDropModule, CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { ProgressSpinnerService } from 'packages/angular-sdk-components/src/public-api';
import { Utils } from 'packages/angular-sdk-components/src/public-api';
import { ComponentMapperComponent } from 'packages/angular-sdk-components/src/public-api';
import { getCurrencyOptions } from 'packages/angular-sdk-components/src/public-api';
import { getLocale, getSeconds } from 'packages/angular-sdk-components/src/public-api';
import { formatters } from 'packages/angular-sdk-components/src/public-api';

import { init } from 'packages/angular-sdk-components/src/lib/_components/template/list-view/listViewHelpers';
import { CarouselComponent } from "../Carousel-component/carousel.component";

const SELECTION_MODE = { SINGLE: 'single', MULTI: 'multi' };

interface ListViewProps {
  inheritedProps: any;
  title: string | undefined;
  // If any, enter additional props that only exist on this component
  globalSearch?: boolean;
  referenceList?: any;
  rowClickAction?: any;
  selectionMode?: string;
  referenceType?: string;
  compositeKeys?: any;
  showDynamicFields?: boolean;
  presets?: any;
  reorderFields: string | boolean;
  grouping: string | boolean;
  value: any;
  readonlyContextList: any;
  label?: string;
  displayAs?: string;
  showRecords: boolean;
  viewName?: string;
}

@Component({
  selector: 'app-mediaco-list-view',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    DragDropModule,
    CdkDropList,
    CdkDrag,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatRadioModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    forwardRef(() => ComponentMapperComponent),
    CarouselComponent
],
  templateUrl: './mediaco-list-view.component.html',
  styleUrl: './mediaco-list-view.component.scss'
})
export class MediacoListViewComponent implements OnInit {

  @Input() pConn$: typeof PConnect;
  @Input() bInForm$ = true;
  @Input() payload;
  configProps$: ListViewProps;
  template: string;
  sourceList: any[];
  referenceDataPage: string;

  ngOnInit(): void {
    this.configProps$ = this.pConn$.getConfigProps() as ListViewProps;
    this.template = this.configProps$.presets[0]?.template;
    this.getListData();
  }

  getListData() {
    this.referenceDataPage = this.configProps$.referenceList;
    PCore.getDataPageUtils().getDataAsync(this.referenceDataPage, this.pConn$.getContextName()).then(({data}) => {
      this.modifyListData(data);
      console.log(data);
    });
  }

  modifyListData(data: any[]) {
    if(this.referenceDataPage === 'D_CarouselitemList') {
      this.sourceList = data.map(item => {
        return {
          Carouselheading: item.Carouselheading,
          ImageURL: item.ImageURL
        }
      });
    }
    console.log(this.sourceList);
  }
  // modifyListData(data: any[]) {
  //   if(this.referenceDataPage === 'D_AccountHistoryList') {
  //     this.sourceList = data.map(item => {
  //       return {
  //         ActivityType: item.ActivityType,
  //         ActivityDate: item.pxUpdateDateTime,
  //         Description: item.Description
  //       }
  //     });
  //   }
  //   console.log(this.sourceList);
  // }
}