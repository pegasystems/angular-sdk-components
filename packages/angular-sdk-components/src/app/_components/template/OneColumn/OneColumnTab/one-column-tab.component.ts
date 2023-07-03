import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { OneColumnComponent } from '../OneColumn/one-column.component';

@Component({
  selector: 'app-one-column-tab',
  templateUrl: './one-column-tab.component.html',
  styleUrls: ['./one-column-tab.component.scss'],
  standalone: true,
  imports: [OneColumnComponent]
})
export class OneColumnTabComponent implements OnInit {
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
