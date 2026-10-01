import { Component, forwardRef } from '@angular/core';

import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { DetailsTemplateBase } from '../base/details-template-base';

@Component({
  selector: 'app-details-wide-narrow',
  templateUrl: './details-wide-narrow.component.html',
  styleUrls: ['./details-wide-narrow.component.scss'],
  imports: [forwardRef(() => ComponentMapperComponent)]
})
export class DetailsWideNarrowComponent extends DetailsTemplateBase {}
