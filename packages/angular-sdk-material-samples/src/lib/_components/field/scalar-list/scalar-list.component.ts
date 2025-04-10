import { CommonModule } from '@angular/common';
import { Component, forwardRef } from '@angular/core';

import { ComponentMapperComponent, ScalarListBase } from '@pega/angular-sdk-components';

@Component({
  selector: 'app-scalar-list',
  templateUrl: './scalar-list.component.html',
  styleUrls: ['./scalar-list.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class ScalarListComponent extends ScalarListBase {}
