import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-material-summary-list',
  templateUrl: './material-summary-list.component.html',
  styleUrls: ['./material-summary-list.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class MaterialSummaryListComponent implements OnInit {
  @Input() arItems$: any[];
  @Input() icon$: string;
  @Input() menuIconOverride$ = '';
  @Input() menuIconOverrideAction$: any;

  ngOnInit(): void {}
}
