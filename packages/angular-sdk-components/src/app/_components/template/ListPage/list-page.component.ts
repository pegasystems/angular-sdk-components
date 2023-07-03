import { Component, OnInit, Input } from '@angular/core';
import { ListViewComponent } from '../ListView/list-view.component';

@Component({
  selector: 'app-list-page',
  templateUrl: './list-page.component.html',
  styleUrls: ['./list-page.component.scss'],
  standalone: true,
  imports: [ListViewComponent]
})
export class ListPageComponent implements OnInit {
  @Input() pConn$: any;

  constructor() {}

  ngOnInit(): void {}
}
