import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-inline-dashboard',
  templateUrl: './inline-dashboard.component.html',
  styleUrls: ['./inline-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class InlineDashboardComponent implements OnInit {
  @Input() pConn$: typeof PConnect;
  @Input() filtersFormGroup$: FormGroup;
  @Input() inlineProps;
  @Input() children;

  ngOnInit() {}
}
