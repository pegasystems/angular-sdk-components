import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { ReferenceComponent } from '../reference/reference.component';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-region',
  templateUrl: './region.component.html',
  styleUrls: ['./region.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class RegionComponent implements OnInit {
  @Input() pConn$: any;
  @Input() formGroup$: FormGroup;

  configProps$: Object;
  arChildren$: Array<any>;

  constructor() {}

  ngOnInit() {
    // console.log(`ngOnInit (no registerAndSubscribe!): Region`);

    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());

    // The children may contain 'reference' components, so normalize the children...
    this.arChildren$ = ReferenceComponent.normalizePConnArray(this.pConn$.getChildren());
  }
}
