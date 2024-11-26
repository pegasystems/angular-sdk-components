import { Component, Input, forwardRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-one-column-page',
  templateUrl: './one-column-page.component.html',
  styleUrls: ['./one-column-page.component.scss'],
  standalone: true,
  imports: [forwardRef(() => ComponentMapperComponent)]
})
export class OneColumnPageComponent {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;
}
