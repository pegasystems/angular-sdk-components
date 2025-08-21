import { Component, Input, forwardRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-three-column-page',
  templateUrl: './three-column-page.component.html',
  styleUrls: ['./three-column-page.component.scss'],
  imports: [forwardRef(() => ComponentMapperComponent)]
})
export class ThreeColumnPageComponent {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;
}
