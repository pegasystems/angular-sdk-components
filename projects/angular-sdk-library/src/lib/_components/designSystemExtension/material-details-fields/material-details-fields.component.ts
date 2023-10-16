import { Component, Input, forwardRef } from '@angular/core';
import { Utils } from '../../../_helpers/utils';
import { CommonModule } from '@angular/common';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-material-details-fields',
  templateUrl: './material-details-fields.component.html',
  styleUrls: ['./material-details-fields.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent) ]
})
export class MaterialDetailsFieldsComponent {

  PCore$: any;
  angularPConnect: any;
  constructor(private utils: Utils) {}

  @Input() arFields$: Array<any>;
  @Input() arHighlightedFields: Array<any>;

  ngOnInit(): void {}


  _getValue(configValue) {
    if (configValue && configValue != '') {
      return configValue;
    } else {
      return '---';
    }
  }

  _formatDate(dateValue: string, dateFormat: string): string {
    return this.utils.generateDate(dateValue, dateFormat);
  }
  
}
