import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentMapperComponent } from '../../../../../../../packages/angular-sdk-components/src/lib/_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.scss'],
  standalone: true,
  imports: [CommonModule, ComponentMapperComponent]
})
export class MainContentComponent implements OnInit {
  @Input() pConn$: typeof PConnect;

  sComponentName$: string;

  ngOnInit(): void {
    if (this.pConn$) {
      this.sComponentName$ = this.pConn$.getComponentName();
    }
  }
}
