import { Component, Input, forwardRef } from '@angular/core';

import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-field-group-list',
  templateUrl: './field-group-list.component.html',
  styleUrls: ['./field-group-list.component.scss'],
  imports: [forwardRef(() => ComponentMapperComponent)]
})
export class FieldGroupListComponent {
  @Input() item;
  @Input() heading;
  @Input() formGroup$;

  fields: any = [];
}
