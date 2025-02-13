import { Component, OnInit, OnDestroy, Input } from '@angular/core';

@Component({
  selector: 'app-email-container',
  templateUrl: './email-container.component.html',
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
