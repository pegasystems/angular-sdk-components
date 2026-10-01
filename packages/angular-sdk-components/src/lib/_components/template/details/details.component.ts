import { Component, forwardRef } from '@angular/core';

import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { DetailsTemplateBase } from '../base/details-template-base';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  imports: [forwardRef(() => ComponentMapperComponent)]
})
export class DetailsComponent extends DetailsTemplateBase {}
