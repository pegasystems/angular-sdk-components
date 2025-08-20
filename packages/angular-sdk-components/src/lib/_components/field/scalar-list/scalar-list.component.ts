import { CommonModule } from '@angular/common';
import { Component, forwardRef } from '@angular/core';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { ScalarListBase } from '../../base/field/scalar-list/scalar-list.base';

@Component({
  selector: 'app-scalar-list',
  templateUrl: './scalar-list.component.html',
  styleUrls: ['./scalar-list.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class ScalarListComponent extends ScalarListBase {}
