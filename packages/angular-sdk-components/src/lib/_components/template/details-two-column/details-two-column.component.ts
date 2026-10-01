import { Component, forwardRef } from '@angular/core';

import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { DetailsTemplateBase } from '../base/details-template-base';

@Component({
  selector: 'app-details-two-column',
  templateUrl: './details-two-column.component.html',
  styleUrls: ['./details-two-column.component.scss'],
  imports: [forwardRef(() => ComponentMapperComponent)]
})
export class DetailsTwoColumnComponent extends DetailsTemplateBase {}
