import { Component, OnInit, Input } from '@angular/core';
import { Utils } from '../../../_helpers/utils';
import { MaterialUtilityComponent } from '../../designSystemExtension/MaterialUtility/material-utility.component';

@Component({
  selector: 'app-utility',
  templateUrl: './utility.component.html',
  styleUrls: ['./utility.component.scss'],
  standalone: true,
  imports: [MaterialUtilityComponent]
})
export class UtilityComponent implements OnInit {
  @Input() pConn$: any;

  PCore$: any;

  configProps$: any;
  headerIcon$: string;
  headerText$: string;
  headerIconUrl$: string;
  noItemsMessage$: string;

  constructor(private utils: Utils) {}

  ngOnInit(): void {
    if (!this.PCore$) {
      this.PCore$ = window.PCore;
    }

    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());

    this.headerIcon$ = this.configProps$['headerIcon'];
    this.headerIconUrl$ = this.utils.getSDKStaticContentUrl();
    this.headerText$ = this.configProps$['headerText'];
    this.noItemsMessage$ = this.configProps$['noItemsMessage'];
  }
}
