import { CommonModule } from '@angular/common';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-field-value-list',
  templateUrl: './field-value-list.component.html',
  styleUrls: ['./field-value-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule]
})
export class FieldValueListComponent {
  @Input() label$: any;
  @Input() value$: any;
  @Input() displayMode$: any;
  @Input() isHtml$ = false;
}
