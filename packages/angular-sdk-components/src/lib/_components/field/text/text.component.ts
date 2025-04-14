import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TextBase } from '../../base/field/text/text.base';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class TextComponent extends TextBase {}
