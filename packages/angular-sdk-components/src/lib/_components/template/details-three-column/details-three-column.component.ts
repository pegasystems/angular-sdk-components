import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { DetailsTemplateBase } from '../base/details-template-base';

@Component({
  selector: 'app-details-three-column',
  templateUrl: './details-three-column.component.html',
  styleUrls: ['./details-three-column.component.scss'],
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class DetailsThreeColumnComponent extends DetailsTemplateBase {}
