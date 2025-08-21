import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

interface InlineDashboardProps {
  // If any, enter additional props that only exist on this component
  title: string;
  filterPosition?: string;
}

@Component({
  selector: 'app-inline-dashboard',
  templateUrl: './inline-dashboard.component.html',
  styleUrls: ['./inline-dashboard.component.scss'],
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class InlineDashboardComponent {
  @Input() pConn$: typeof PConnect;
  @Input() filtersFormGroup$: FormGroup;
  @Input() inlineProps: InlineDashboardProps;
  @Input() children: any[];
}
