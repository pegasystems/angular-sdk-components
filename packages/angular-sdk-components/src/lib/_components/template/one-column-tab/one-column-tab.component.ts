import { Component, OnInit, Input, forwardRef, OnChanges, SimpleChanges } from '@angular/core';

import { FormGroup } from '@angular/forms';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-one-column-tab',
  templateUrl: './one-column-tab.component.html',
  styleUrls: ['./one-column-tab.component.scss'],
  imports: [forwardRef(() => ComponentMapperComponent)]
})
export class OneColumnTabComponent implements OnInit, OnChanges {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  arChildren$: any[];

  ngOnInit(): void {
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
