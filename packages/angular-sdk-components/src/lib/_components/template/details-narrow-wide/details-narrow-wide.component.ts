import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { DetailsTemplateBase } from '../base/details-template-base';

@Component({
  selector: 'app-details-narrow-wide',
  templateUrl: './details-narrow-wide.component.html',
  styleUrls: ['./details-narrow-wide.component.scss'],
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class DetailsNarrowWideComponent extends DetailsTemplateBase {}
