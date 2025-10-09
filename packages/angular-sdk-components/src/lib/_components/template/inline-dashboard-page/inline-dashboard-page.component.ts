import { Component, OnInit, Input, forwardRef, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder } from '@angular/forms';
import { buildFilterComponents } from '../../../_helpers/filter-utils';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

interface InlineDashboardPageProps {
  // If any, enter additional props that only exist on this component
  title: string;
  icon?: string;
  filterPosition?: string;
}

@Component({
  selector: 'app-inline-dashboard-page',
  templateUrl: './inline-dashboard-page.component.html',
  styleUrls: ['./inline-dashboard-page.component.scss'],
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class InlineDashboardPageComponent implements OnInit, OnChanges {
  @Input() pConn$: typeof PConnect;

  configProps$: InlineDashboardPageProps;
  filterComponents: any;
  inlineProps: any;
  children: any = [];
  filtersFormGroup$: FormGroup;

  constructor(private fb: FormBuilder) {
    this.filtersFormGroup$ = this.fb.group({ hideRequired: false });
  }

  ngOnInit() {
    this.updateSelf();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { pConn$ } = changes;

    if (pConn$.previousValue && pConn$.previousValue !== pConn$.currentValue) {
      this.updateSelf();
    }
  }

  updateSelf() {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as InlineDashboardPageProps;
    const arChildren$ = this.pConn$.getChildren();
    const allFilters = this.pConn$.getRawMetadata()?.children?.[1];
    const filterComponents = buildFilterComponents(this.pConn$, allFilters);
    this.inlineProps = this.configProps$;
    this.children[0] = arChildren$[0];
    this.children[1] = filterComponents;
  }
}
