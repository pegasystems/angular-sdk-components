import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-list-page',
  templateUrl: './list-page.component.html',
  styleUrls: ['./list-page.component.scss'],
  standalone: true,
  imports: [forwardRef(() => ComponentMapperComponent)]
})
export class ListPageComponent implements OnInit {
  @Input() pConn$: any;

  constructor() {}

  ngOnInit(): void {}
}
