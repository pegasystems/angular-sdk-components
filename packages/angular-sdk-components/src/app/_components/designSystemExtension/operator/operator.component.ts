import { Component, OnInit, Input, Renderer2, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Utils } from '../../../_helpers/utils';

@Component({
  selector: 'app-operator',
  templateUrl: './operator.component.html',
  styleUrls: ['./operator.component.scss'],
  standalone: true,
  imports: [CommonModule, MatButtonModule]
})
export class OperatorComponent implements OnInit {
  @Input() date$: string;
  @Input() name$: string;

  @Input() label$: string;
  @Input() helperText$: string;
  @Input() id$: string;

  PCore$: any;

  fields$: Array<any> = [];
  bShowPopover$: boolean;

  constructor(private renderer: Renderer2, private cdRef: ChangeDetectorRef, private utils: Utils) {}

  ngOnInit(): void {
    if (!this.PCore$) {
      this.PCore$ = window.PCore;
    }

    this.renderer.listen('window', 'click', (e: Event) => {
      if (this.bShowPopover$) {
        this.bShowPopover$ = false;
      }
    });

    this.date$ = this.utils.generateDate(this.date$, 'DateTime-Since');
    this.bShowPopover$ = false;
  }

  ngOnDestroy(): void {
    this.renderer.destroy();
  }

  showOperator() {
    const operatorPreviewPromise = this.PCore$.getUserApi().getOperatorDetails(this.id$);
    const localizedVal = this.PCore$.getLocaleUtils().getLocaleValue;
    const localeCategory = 'Operator';
    const fillerString = '---';

    operatorPreviewPromise.then((res) => {
      if (res.data && res.data.pyOperatorInfo && res.data.pyOperatorInfo.pyUserName) {
        this.fields$ = [
          {
            id: 'pyPosition',
            name: localizedVal("Position", localeCategory),
            value: res.data.pyOperatorInfo.pyPosition != '' ? res.data.pyOperatorInfo.pyPosition : fillerString
          },
          {
            id: 'pyOrganization',
            name: localizedVal("Organization", localeCategory),
            value: res.data.pyOperatorInfo.pyOrganization != '' ? res.data.pyOperatorInfo.pyOrganization : fillerString
          },
          {
            id: 'ReportToUserName',
            name: localizedVal('Reports to', localeCategory),
            value: res.data.pyOperatorInfo.pyReportToUserName != '' ? res.data.pyOperatorInfo.pyReportToUserName : fillerString
          },
          {
            id: 'pyTelephone',
            name: localizedVal('Telephone', localeCategory),
            value: res.data.pyOperatorInfo.pyTelephone != '' ? res.data.pyOperatorInfo.pyTelephone : fillerString
          },
          {
            id: 'pyEmailAddress',
            name: localizedVal('Email address', localeCategory),
            value: res.data.pyOperatorInfo.pyEmailAddress != '' ? res.data.pyOperatorInfo.pyEmailAddress : fillerString
          }
        ];

        this.bShowPopover$ = true;
        this.cdRef.detectChanges();
      }else {
        // eslint-disable-next-line no-console
        console.log(`Operator: PCore.getUserApi().getOperatorDetails(${this.id$}); returned empty res.data.pyOperatorInfo.pyUserName - adding default`);
        this.fields$ = [
          {
            id: "pyPosition",
            name: localizedVal("Position", localeCategory),
            value: fillerString
          },
          {
            id: "pyOrganization",
            name: localizedVal("Organization", localeCategory),
            value: fillerString
          },
          {
            id: "ReportToUserName",
            name: localizedVal('Reports to', localeCategory),
            value: fillerString
          },
          {
            id: "pyTelephone",
            name: localizedVal('Telephone', localeCategory),
            value: fillerString
          },
          {
            id: "pyEmailAddress",
            name: localizedVal('Email address', localeCategory),
            value: fillerString
          }
        ];
      }
    });
  }
}
