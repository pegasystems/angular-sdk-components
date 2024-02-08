import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';

/**
 * WARNING:  It is not expected that this file should be modified.  It is part of infrastructure code that works with
 * Redux and creation/update of Redux containers and PConnect.  Modifying this code could have undesireable results and
 * is totally at your own risk.
 */

// Right this is a skeleton, as Hybrid ViewContainer hasn't been implemented

@Component({
  selector: 'app-hybrid-view-container',
  templateUrl: './hybrid-view-container.component.html',
  styleUrls: ['./hybrid-view-container.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class HybridViewContainerComponent {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;
  @Input() displayOnlyFA$: boolean;
}
