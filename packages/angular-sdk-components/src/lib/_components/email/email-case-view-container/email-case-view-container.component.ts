import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { ReferenceComponent } from 'packages/angular-sdk-components/src/public-api';

@Component({
  selector: 'lib-email-case-view-container',
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)],
  templateUrl: './email-case-view-container.component.html',
  styleUrl: './email-case-view-container.component.scss'
})
export class EmailCaseViewContainerComponent implements OnInit {
  @Input() pConn$: typeof PConnect;

  children: any = [];

  ngOnInit() {
    this.children = ReferenceComponent.normalizePConnArray(this.pConn$.getChildren());
    console.log('children', this.children);
  }
}
