import { Component, Input, forwardRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
    selector: 'app-single-reference-readonly',
    templateUrl: './single-reference-readonly.component.html',
    styleUrls: ['./single-reference-readonly.component.scss'],
    imports: [forwardRef(() => ComponentMapperComponent)]
})
export class SingleReferenceReadonlyComponent {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;
}
