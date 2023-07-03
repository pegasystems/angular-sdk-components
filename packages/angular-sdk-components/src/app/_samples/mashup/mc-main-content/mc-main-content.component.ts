import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewContainerComponent } from '../../../_components/infra/Containers/ViewContainer/view-container.component';

@Component({
  selector: 'app-mc-main-content',
  templateUrl: './mc-main-content.component.html',
  styleUrls: ['./mc-main-content.component.scss'],
  standalone: true,
  imports: [CommonModule, ViewContainerComponent]
})
export class MCMainContentComponent implements OnInit {
  @Input() pConn$: any;

  sComponentName$: string;

  constructor() {}

  ngOnInit(): void {
    if (this.pConn$) {
      this.sComponentName$ = this.pConn$.getComponentName();
    }
  }
}
