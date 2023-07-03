import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { RegionComponent } from '../../../infra/Region/region.component';

@Component({
  selector: 'app-narrow-wide-form',
  templateUrl: './narrow-wide-form.component.html',
  styleUrls: ['./narrow-wide-form.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => RegionComponent)]
})
export class NarrowWideFormComponent implements OnInit {
  @Input() pConn$: any;
  @Input() formGroup$: FormGroup;

  configProps$: Object;
  arChildren$: Array<any>;

  constructor() {}

  ngOnInit() {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());
    this.arChildren$ = this.pConn$.getChildren();
  }
}
