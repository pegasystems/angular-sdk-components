import { Component, OnInit, OnDestroy, Input, forwardRef } from '@angular/core';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-email-container',
  templateUrl: './email-container.component.html',
  standalone: true,
  imports: [forwardRef(() => ComponentMapperComponent)],
  styleUrls: ['./email-container.component.scss']
})
export class EmailContainerComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;

  constructor() {
    console.log('EmailContainerComponent: constructor');
  }

  ngOnInit(): void {
    console.log('EmailContainerComponent: ngOnInit');
  }

  ngOnDestroy(): void {
    console.log('EmailContainerComponent: ngOnDestroy');
  }
}
