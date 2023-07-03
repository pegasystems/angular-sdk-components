import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialSummaryItemComponent } from '../SummaryItem/summary-item.component';

@Component({
  selector: 'app-summary-list',
  templateUrl: './summary-list.component.html',
  styleUrls: ['./summary-list.component.scss'],
  standalone: true,
  imports: [CommonModule, MaterialSummaryItemComponent]
})
export class MaterialSummaryListComponent implements OnInit {
  @Input() arItems$: Array<any>;
  @Input() icon$: string;
  @Input() menuIconOverride$: string = '';
  @Input() menuIconOverrideAction$: any;

  PCore$: any;

  constructor() {}

  ngOnInit(): void {
    if (!this.PCore$) {
      this.PCore$ = window.PCore;
    }
  }
}
