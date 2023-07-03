import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { OneColumnComponent } from '../OneColumn/one-column.component';

@Component({
  selector: 'app-one-column-page',
  templateUrl: './one-column-page.component.html',
  styleUrls: ['./one-column-page.component.scss'],
  standalone: true,
  imports: [OneColumnComponent]
})
export class OneColumnPageComponent implements OnInit {
  @Input() pConn$: any;
  @Input() formGroup$: FormGroup;

  constructor() {}

  ngOnInit(): void {}
}
