import { CommonModule } from '@angular/common';
import { Component, forwardRef } from '@angular/core';

import { ComponentMapperComponent, GroupBase } from '@pega/angular-sdk-components';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class GroupComponent extends GroupBase {}
