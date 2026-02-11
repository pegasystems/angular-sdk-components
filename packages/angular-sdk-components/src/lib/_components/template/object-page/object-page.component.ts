import { Component, forwardRef, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'lib-object-page',
  imports: [forwardRef(() => ComponentMapperComponent)],
  templateUrl: './object-page.component.html',
  styleUrl: './object-page.component.scss'
})
export class ObjectPageComponent {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;
}
