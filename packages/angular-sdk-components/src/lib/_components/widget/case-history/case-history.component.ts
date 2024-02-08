import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Utils } from '../../../_helpers/utils';

interface CaseHistoryProps {
  label?: string;
}

@Component({
  selector: 'app-case-history',
  templateUrl: './case-history.component.html',
  styleUrls: ['./case-history.component.scss'],
  standalone: true,
  imports: [CommonModule, MatTableModule]
})
export class CaseHistoryComponent implements OnInit {
  @Input() pConn$: typeof PConnect;

  configProps$: CaseHistoryProps;

  repeatList$: MatTableDataSource<any>;
  fields$: any[];
  displayedColumns$ = Array<any>();
  waitingForData = false;

  constructor(private utils: Utils) {}

  ngOnInit(): void {
    this.configProps$ = this.pConn$.getConfigProps();

    // @ts-ignore - second parameter pageReference for getValue method should be optional
    const caseID = this.pConn$.getValue(PCore.getConstants().CASE_INFO.CASE_INFO_ID);
    const dataViewName = 'D_pyWorkHistory';
    const context = this.pConn$.getContextName();

    this.waitingForData = true;

    const caseHistoryData = PCore.getDataApiUtils().getData(
      dataViewName,
      { dataViewParameters: [{ CaseInstanceKey: caseID }] } as any,
      context
    ) as Promise<any>;

    caseHistoryData.then((historyJSON: any) => {
      this.fields$ = [
        { label: this.pConn$.getLocalizedValue('Date', '', ''), type: 'DateTime', fieldName: 'pxTimeCreated' },
        { label: this.pConn$.getLocalizedValue('Description', '', ''), type: 'TextInput', fieldName: 'pyMessageKey' },
        { label: this.pConn$.getLocalizedValue('User', '', ''), type: 'TextInput', fieldName: 'pyPerformer' }
      ];

      const tableDataResults = this.updateData(historyJSON.data.data, this.fields$);

      this.displayedColumns$ = this.getDisplayColumns(this.fields$);

      this.repeatList$ = new MatTableDataSource(tableDataResults);

      this.waitingForData = false;
    });
  }
  // This method isn't being used anywhere, keeping it as a reference for now
  // updateFields(arFields, arColumns): any[] {
  //   const arReturn = arFields;
  //   for (const i in arReturn) {
  //     arReturn[i].config.name = arColumns[i];
  //   }

  //   return arReturn;
  // }

  updateData(listData: any[], fieldData: any[]): any[] {
    const returnList: any[] = new Array<any>();
    listData.forEach(row => {
      // copy
      const rowData = JSON.parse(JSON.stringify(row));

      for (const field of fieldData) {
        const fieldName = field.fieldName;
        let formattedDate;

        switch (field.type) {
          case 'Date':
            formattedDate = this.utils.generateDate(rowData[fieldName], 'Date-Short-YYYY');
            rowData[fieldName] = formattedDate;
            break;
          case 'DateTime':
            formattedDate = this.utils.generateDateTime(rowData[fieldName], 'DateTime-Short-YYYY');
            rowData[fieldName] = formattedDate;
            break;
          default:
            break;
        }
      }
      returnList.push(rowData);
    });
    return returnList;
  }

  getDisplayColumns(fields: any[] = []) {
    return fields.map(field => {
      return field.fieldName;
    });
  }
}
