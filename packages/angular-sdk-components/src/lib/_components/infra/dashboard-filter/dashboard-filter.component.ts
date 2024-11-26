import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { getFilterExpression, getFormattedDate, createFilter, combineFilters } from '../../../_helpers/filter-utils';

@Component({
  selector: 'app-dashboard-filter',
  templateUrl: './dashboard-filter.component.html',
  styleUrls: ['./dashboard-filter.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatButtonModule,
    MatNativeDateModule,
    forwardRef(() => ComponentMapperComponent)
  ]
})
export class DashboardFilterComponent implements OnInit {
  @Input() pConn$: typeof PConnect;
  @Input() filtersFormGroup$: FormGroup;
  @Input() inlineProps;
  @Input() children;

  arChildren$: any[];
  private filterChangeSubject = new Subject<string>();

  constructor() {
    this.filterChangeSubject.pipe(debounceTime(500)).subscribe(val => this.fireFilterChange(val));
  }

  ngOnInit() {
    if (this.filtersFormGroup$ != null) {
      this.filtersFormGroup$.addControl('start', new FormControl(null));
      this.filtersFormGroup$.addControl('end', new FormControl(null));
    }
  }

  clearFilters() {
    this.filtersFormGroup$.reset();
    PCore.getPubSubUtils().publish(PCore.getConstants().PUB_SUB_EVENTS.EVENT_DASHBOARD_FILTER_CLEAR_ALL);
  }

  updateTmpData(filterData) {
    this.filterChangeSubject.next(filterData);
  }

  dateRangeChangeHandler(field) {
    const { filterId, name } = field;
    const start = (this.filtersFormGroup$.get('start') as FormControl).value;
    const end = (this.filtersFormGroup$.get('end') as FormControl).value;
    if (start && end) {
      let startDate = getFormattedDate(start);
      let endDate = getFormattedDate(end);

      if (startDate && endDate) {
        startDate = `${startDate}T00:00:00`;
        endDate = `${endDate}T00:00:00`;
        const startFilter = createFilter(startDate, name, 'GT');
        const endFilter = createFilter(endDate, name, 'LT');

        const filterData = {
          filterId,
          filterExpression: combineFilters([startFilter, endFilter], null)
        };
        PCore.getPubSubUtils().publish(PCore.getConstants().PUB_SUB_EVENTS.EVENT_DASHBOARD_FILTER_CHANGE, filterData);
      }
    }
  }

  fireFilterChange(data: any) {
    const { event, field } = data;
    const filterData = {
      filterId: field.filterId,
      filterExpression: getFilterExpression(event.target.value, field.name, field.metadata)
    };

    PCore.getPubSubUtils().publish(PCore.getConstants().PUB_SUB_EVENTS.EVENT_DASHBOARD_FILTER_CHANGE, filterData);
  }
}
