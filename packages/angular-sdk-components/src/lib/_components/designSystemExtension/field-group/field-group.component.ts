import { CommonModule } from '@angular/common';
import { Component, Input, TemplateRef } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-field-group',
  templateUrl: './field-group.component.html',
  styleUrls: ['./field-group.component.scss'],
  standalone: true,
  imports: [CommonModule, MatGridListModule, MatIconModule]
})
export class FieldGroupComponent {
  @Input() name?: string;
  @Input() collapsible = false;
  @Input() instructions: string;
  @Input() childrenTemplate: TemplateRef<any>;

  collapsed = false;

  headerClickHandler() {
    this.collapsed = !this.collapsed;
  }
}
