import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { CaseCreateStageComponent } from '../../designSystemExtension/case-create-stage/case-create-stage.component';
import { RegionComponent } from '../../infra/region/region.component';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-one-column',
  templateUrl: './one-column.component.html',
  styleUrls: ['./one-column.component.scss'],
  standalone: true,
  imports: [CommonModule, ComponentMapperComponent, CaseCreateStageComponent, forwardRef(() => RegionComponent)]
})
export class OneColumnComponent implements OnInit {
  @Input() pConn$: any;
  @Input() formGroup$: FormGroup;

  configProps$: Object;
  arChildren$: Array<any>;

  constructor() {}

  ngOnInit(): void {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());
    this.arChildren$ = this.pConn$.getChildren();
  }
}
