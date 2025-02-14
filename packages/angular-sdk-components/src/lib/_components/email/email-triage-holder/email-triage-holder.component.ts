import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ReferenceComponent } from 'packages/angular-sdk-components/src/public-api';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'lib-email-triage-holder',
  standalone: true,
  imports: [MatTabsModule, CommonModule, forwardRef(() => ComponentMapperComponent)],
  templateUrl: './email-triage-holder.component.html',
  styleUrl: './email-triage-holder.component.scss'
})
export class EmailTriageHolderComponent implements OnInit {
  @Input() pConn$: typeof PConnect;
  currentTabId = 0;

  tabs: any = [];
  children: any = [];

  ngOnInit() {
    this.children = ReferenceComponent.normalizePConnArray(this.pConn$.getChildren());

    this.tabs = this.generateTabs(this.children.slice(1));
    console.log(this.tabs);
  }

  generateTabs(children) {
    return children.map((child, index) => ({
      name: child.getPConnect().getConfigProps().label,
      id: index,
      pConn: child.getPConnect()
    }));
  }

  handleTabClick(event) {
    this.currentTabId = event.index;
  }
}
