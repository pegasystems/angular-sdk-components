import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ProgressSpinnerService } from '../../../_messages/progress-spinner.service';
import { Utils } from '../../../_helpers/utils';

interface RepeatingStructuresProps {
  referenceList?: Array<any>;
  rowClickAction?: string;
}

@Component({
  selector: 'app-repeating-structures',
  templateUrl: './repeating-structures.component.html',
  styleUrls: ['./repeating-structures.component.scss'],
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule]
})
export class RepeatingStructuresComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Input() pConn$: typeof PConnect;

  configProps$: RepeatingStructuresProps;
  repeatList$: MatTableDataSource<any>;
  fields$: Array<any>;
  displayedColumns$ = Array<string>();

  constructor(
    private psService: ProgressSpinnerService,
    private utils: Utils
  ) {}

  ngOnInit(): void {
    const componentConfig = (this.pConn$.getRawMetadata() as any).config || { fields: [] };
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());
    this.fields$ = this.initializeColumns(componentConfig.fields);

    const refList = this.configProps$.referenceList;
    // @ts-ignore - second parameter pageReference for getValue method should be optional
    const tableDataResults = JSON.parse(JSON.stringify(this.pConn$.getValue(refList)));

    // update elements like date format
    const updatedRefList = this.updateData(tableDataResults, this.fields$);

    this.repeatList$ = new MatTableDataSource(updatedRefList);
    this.displayedColumns$ = this.getDisplayColumns(this.fields$);
    this.repeatList$.paginator = this.paginator;
  }

  ngOnDestroy() {}

  ngAfterViewInit() {
    // paginator has to exist for this to work,
    // so called after init (paginator drawn)
    this.repeatList$.paginator = this.paginator;
    this.repeatList$.sort = this.sort;
  }

  applySearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.repeatList$.filter = filterValue.trim().toLowerCase();

    if (this.repeatList$.paginator) {
      this.repeatList$.paginator.firstPage();
    }
  }

  rowClick(row) {
    switch (this.configProps$.rowClickAction) {
      case 'openAssignment':
        this.psService.sendMessage(true);
        this.openAssignment(row);
        break;
      default:
        break;
    }
  }

  updateData(listData: Array<any>, fieldData: Array<any>): Array<any> {
    const returnList: Array<any> = new Array<any>();
    for (const row in listData) {
      // copy
      const rowData = JSON.parse(JSON.stringify(listData[row]));

      for (const field in fieldData) {
        if (fieldData[field].type == 'date') {
          const fieldName = fieldData[field].name;
          const formattedDate = rowData[fieldName];

          // format date
          // formattedDate = formattedDate.replace("GMT", "+0000");
          this.utils.generateDateTime(formattedDate, 'MMMM D, YYYY h:mm:ss A');

          // update
          rowData[fieldName] = formattedDate;
        }
      }

      returnList.push(rowData);
    }

    return returnList;
  }

  openAssignment(row) {
    const { pxRefObjectClass, pzInsKey } = row;
    const sTarget = this.pConn$.getContainerName();
    const options: any = { containerName: sTarget };
    this.pConn$
      .getActionsApi()
      .openAssignment(pzInsKey, pxRefObjectClass, options)
      .then(() => {});
  }

  initializeData(data) {
    data.forEach((item, idx) => {
      item.__original_index = idx;
      item.__level = 1;
    });

    return data;
  }

  getType(field) {
    const { config = {}, type } = field;
    const { formatType } = config;
    if (formatType === 'datetime' || formatType === 'date') {
      // currently cosmos has only support for date ... it also need to support dateTime
      return 'date';
    }
    return type.toLowerCase();
  }

  initializeColumns(fields = []) {
    return fields.map((field: any, originalColIndex) => ({
      ...field,
      type: this.getType(field),
      name: field.config.value.substring(4),
      label: field.config.label.substring(3),
      id: originalColIndex,
      groupingEnabled: true,
      grouped: false,
      minWidth: 50,
      cellRenderer: this.getType(field) === 'text' ? null : field.type,
      filter: true
    }));
  }

  getDisplayColumns(fields: Array<any> = []): Array<string> {
    return fields.map((field: any) => field.name);
  }
}
