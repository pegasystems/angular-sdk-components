import { Component, Input, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-list-page',
  templateUrl: './list-page.component.html',
  styleUrls: ['./list-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [forwardRef(() => ComponentMapperComponent)]
})
export class ListPageComponent {
  @Input() pConn$: typeof PConnect;
}
