import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { RegionComponent } from '../../infra/region/region.component';

@Component({
  selector: 'app-wide-narrow-form',
  templateUrl: './wide-narrow-form.component.html',
  styleUrls: ['./wide-narrow-form.component.scss'],
  standalone: true,
  imports: [CommonModule, RegionComponent]
})
export class WideNarrowFormComponent implements OnInit {
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
