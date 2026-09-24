import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { DetailsTemplateBase } from '../base/details-template-base';

@Component({
  selector: 'app-details-one-column',
  templateUrl: './details-one-column.component.html',
  styleUrls: ['./details-one-column.component.scss'],
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class DetailsOneColumnComponent extends DetailsTemplateBase {}
