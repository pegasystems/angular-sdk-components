import { Component, OnInit, Input } from '@angular/core';

/**
 * WARNING: This file is part of the infrastructure component responsible for working with Redux and managing the creation and update of Redux containers and PConnect.
 * You may override Material components within this component if needed, but do not modify any container-related logic. Changing this logic can lead to unexpected behavior.
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
    const containerMgr = this.pConn$.getContainerManager();

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
