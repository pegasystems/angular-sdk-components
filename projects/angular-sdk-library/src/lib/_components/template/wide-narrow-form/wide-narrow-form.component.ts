import { Component, OnInit, Input, forwardRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-wide-narrow-form',
  templateUrl: './wide-narrow-form.component.html',
  styleUrls: ['./wide-narrow-form.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class WideNarrowFormComponent implements OnInit, OnChanges {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  arChildren$: Array<any>;

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
    this.arChildren$ = this.pConn$.getChildren() as Array<any>;
  }
}
