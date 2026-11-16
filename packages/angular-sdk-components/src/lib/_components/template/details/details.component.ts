import { Component, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { DetailsTemplateBase } from '../base/details-template-base';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class DetailsComponent extends DetailsTemplateBase {}
