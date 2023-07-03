import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ThreeColumnComponent } from '../ThreeColumn/three-column.component';

@Component({
  selector: 'app-three-column-page',
  templateUrl: './three-column-page.component.html',
  styleUrls: ['./three-column-page.component.scss'],
  standalone: true,
  imports: [ThreeColumnComponent]
})
export class ThreeColumnPageComponent implements OnInit {
  @Input() pConn$: any;
  @Input() formGroup$: FormGroup;

  constructor() {}

  ngOnInit(): void {}
}
