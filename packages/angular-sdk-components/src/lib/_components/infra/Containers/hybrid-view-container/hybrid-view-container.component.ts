import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';

/**
 * WARNING: This file is part of the infrastructure component responsible for working with Redux and managing the creation and update of Redux containers and PConnect.
 * You may override Material components within this component if needed, but do not modify any container-related logic. Changing this logic can lead to unexpected behavior.
 */

// Right this is a skeleton, as Hybrid ViewContainer hasn't been implemented

@Component({
  selector: 'app-hybrid-view-container',
  templateUrl: './hybrid-view-container.component.html',
  styleUrls: ['./hybrid-view-container.component.scss'],
  imports: [CommonModule]
})
export class HybridViewContainerComponent {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;
  @Input() displayOnlyFA$: boolean;
}
