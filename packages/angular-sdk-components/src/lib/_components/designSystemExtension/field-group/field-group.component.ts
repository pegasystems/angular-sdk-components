import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, TemplateRef } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-field-group',
  templateUrl: './field-group.component.html',
  styleUrls: ['./field-group.component.scss'],
  imports: [CommonModule, MatGridListModule, MatIconModule]
})
export class FieldGroupComponent implements OnChanges {
  @Input() name?: string;
  @Input() collapseOnLoad: 'none' | 'expanded' | 'collapsed' = 'none';
  @Input() instructions: string;
  @Input() childrenTemplate: TemplateRef<any>;

  collapsible = false;
  collapsed = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['collapseOnLoad']) {
      this.collapsible = this.collapseOnLoad !== 'none';
      this.collapsed = this.collapseOnLoad === 'collapsed';
    }
  }

  headerClickHandler() {
    this.collapsed = !this.collapsed;
  }
}
