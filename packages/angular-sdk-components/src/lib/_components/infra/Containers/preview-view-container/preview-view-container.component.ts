import { Component, OnInit, Input } from '@angular/core';

/**
 * WARNING:  It is not expected that this file should be modified.  It is part of infrastructure code that works with
 * Redux and creation/update of Redux containers and PConnect.  Modifying this code could have undesireable results and
 * is totally at your own risk.
 */

// Right this is a skeleton, as Preview hasn't been implemented

@Component({
  selector: 'app-preview-view-container',
  templateUrl: './preview-view-container.component.html',
  styleUrls: ['./preview-view-container.component.scss'],
  standalone: true
})
export class PreviewViewContainerComponent implements OnInit {
  @Input() pConn$: typeof PConnect;

  ngOnInit(): void {
    const containerMgr: any = this.pConn$.getContainerManager();

    containerMgr.initializeContainers({
      type: 'multiple'
    });
  }

  buildName() {
    const context = this.pConn$.getContextName();
    let viewContainerName = this.pConn$.getComponentName();

    if (!viewContainerName) viewContainerName = '';
    return `${context.toUpperCase()}/${viewContainerName.toUpperCase()}`;
  }
}
