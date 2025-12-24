import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Utils } from '../../../_helpers/utils';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-material-summary-item',
  templateUrl: './material-summary-item.component.html',
  styleUrls: ['./material-summary-item.component.scss'],
  imports: [CommonModule, MatButtonModule, MatMenuModule, MatIcon]
})
export class MaterialSummaryItemComponent implements OnInit {
  @Input() item$: any;
  @Input() menuIconOverride$ = '';
  @Input() menuIconOverrideAction$: any;

  settingsSvgIcon$: string;
  imagePath$ = '';

  constructor(private utils: Utils) {}

  ngOnInit(): void {
    this.imagePath$ = this.utils.getIconPath(this.utils.getSDKStaticContentUrl());

    this.settingsSvgIcon$ = this.utils.getImageSrc('more', this.utils.getSDKStaticContentUrl());
    if (this.menuIconOverride$ != '') {
      this.menuIconOverride$ = this.utils.getImageSrc(this.menuIconOverride$, this.utils.getSDKStaticContentUrl());
    }
  }
}
