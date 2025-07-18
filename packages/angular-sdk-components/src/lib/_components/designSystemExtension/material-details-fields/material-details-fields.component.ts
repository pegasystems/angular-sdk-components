import { Component, Input, forwardRef } from '@angular/core';
import { Utils } from '../../../_helpers/utils';
import { CommonModule } from '@angular/common';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-material-details-fields',
  templateUrl: './material-details-fields.component.html',
  styleUrls: ['./material-details-fields.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class MaterialDetailsFieldsComponent {
  constructor(private utils: Utils) {}

  @Input() arFields$: any[];
  @Input() arHighlightedFields: any[];

  _getValue(configValue, field: any = {}) {
    if (field?.type === 'userreference') {
      return configValue.userName;
    }
    if (configValue && configValue != '') {
      return configValue;
    }
    return '---';
  }

  _formatDate(dateValue: string, dateFormat: string): string {
    return this.utils.generateDate(dateValue, dateFormat);
  }

  getVisibility(config): boolean {
    const { visibility = true } = config;

    return this.utils.getBooleanValue(visibility);
  }
}
