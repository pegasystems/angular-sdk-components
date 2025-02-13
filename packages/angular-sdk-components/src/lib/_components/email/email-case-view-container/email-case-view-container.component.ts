import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ComponentMapperComponent, ReferenceComponent } from 'packages/angular-sdk-components/src/public-api';

@Component({
  selector: 'lib-email-case-view-container',
  standalone: true,
  imports: [CommonModule, ComponentMapperComponent],
  templateUrl: './email-case-view-container.component.html',
  styleUrl: './email-case-view-container.component.scss'
})
export class EmailCaseViewContainerComponent {
  @Input() pConn$: typeof PConnect;

  children: any = [];

  ngOnInit() {
    this.children = ReferenceComponent.normalizePConnArray(this.pConn$.getChildren());
    console.log('children', this.children);
  }
}
