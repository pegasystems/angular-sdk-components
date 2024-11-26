import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Utils } from '../../../_helpers/utils';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-list-utility',
  templateUrl: './list-utility.component.html',
  styleUrls: ['./list-utility.component.scss'],
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatMenuModule, MatProgressSpinnerModule, forwardRef(() => ComponentMapperComponent)]
})
export class ListUtilityComponent implements OnInit {
  @Input() name$ = '';
  @Input() icon$ = '';
  @Input() bLoading$ = false;
  @Input() count$ = 0;
  @Input() arActions$: any[] = [];
  @Input() arItems$: any[] = [];
  @Input() menuIconOverrideAction$: any[] = [];

  // function to all
  @Input() onViewAll$: any;

  headerSvgIcon$: string;
  settingsSvgIcon$: string;

  noItemsMessage$ = 'No Items';

  imagePath$ = '';

  constructor(private utils: Utils) {}

  ngOnInit(): void {
    this.imagePath$ = this.getIconPath();

    this.headerSvgIcon$ = this.utils.getImageSrc(this.icon$, this.utils.getSDKStaticContentUrl());
    this.settingsSvgIcon$ = this.utils.getImageSrc('more', this.utils.getSDKStaticContentUrl());
  }

  getIconPath(): string {
    return `${this.utils.getSDKStaticContentUrl()}assets/icons/`;
  }
}
