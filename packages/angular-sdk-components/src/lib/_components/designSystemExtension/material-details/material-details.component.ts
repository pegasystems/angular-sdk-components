import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Utils } from '../../../_helpers/utils';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
    selector: 'app-material-details',
    templateUrl: './material-details.component.html',
    styleUrls: ['./material-details.component.scss'],
    imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class MaterialDetailsComponent {
  constructor(private utils: Utils) {}

  @Input() arFields$: any[];
  @Input() arFields2$: any[];
  @Input() arFields3$: any[];
  @Input() arHighlightedFields: any[];
  @Input() layout: any;

  _getValue(configValue) {
    if (configValue && configValue != '') {
      return configValue;
    }
    return '---';
  }

  _formatDate(dateValue: string, dateFormat: string): string {
    return this.utils.generateDate(dateValue, dateFormat);
  }
}
