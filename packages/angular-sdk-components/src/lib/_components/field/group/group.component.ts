import { CommonModule } from '@angular/common';
import { Component, forwardRef } from '@angular/core';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { GroupBase } from '../../base/field/group/group.base';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class GroupComponent extends GroupBase {}
