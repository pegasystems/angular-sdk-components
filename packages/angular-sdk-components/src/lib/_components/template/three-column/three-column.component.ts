import { Component, OnInit, Input, forwardRef, OnChanges, SimpleChanges } from '@angular/core';

import { FormGroup } from '@angular/forms';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { FormTemplateBase } from '../base/form-template-base';

@Component({
  selector: 'app-three-column',
  templateUrl: './three-column.component.html',
  styleUrls: ['./three-column.component.scss'],
  imports: [forwardRef(() => ComponentMapperComponent)]
})
export class ThreeColumnComponent extends FormTemplateBase implements OnInit, OnChanges {
  @Input() override pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  arChildren$: any[];

  ngOnInit() {
    this.updateSelf();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { pConn$ } = changes;

    if (pConn$.previousValue && pConn$.previousValue !== pConn$.currentValue) {
      this.updateSelf();
    }
  }

  updateSelf() {
    this.arChildren$ = this.pConn$.getChildren();
  }
}
