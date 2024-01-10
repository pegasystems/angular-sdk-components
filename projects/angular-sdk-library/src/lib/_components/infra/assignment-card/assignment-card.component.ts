import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReferenceComponent } from '../reference/reference.component';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-assignment-card',
  templateUrl: './assignment-card.component.html',
  styleUrls: ['./assignment-card.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, forwardRef(() => ComponentMapperComponent)]
})
export class AssignmentCardComponent implements OnInit {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;
  @Input() arMainButtons$: any[];
  @Input() arSecondaryButtons$: any[];
  @Input() arChildren$: any[];
  @Input() updateToken$: number;

  @Output() actionButtonClick: EventEmitter<any> = new EventEmitter();

  ngOnInit(): void {
    // Children may contain 'reference' component, so we need to
    //  normalize them
    this.arChildren$ = ReferenceComponent.normalizePConnArray(this.arChildren$);
  }

  ngOnChanges() {
    // Children may contain 'reference' component, so we need to
    //  normalize them
    this.arChildren$ = ReferenceComponent.normalizePConnArray(this.arChildren$);
  }

  onActionButtonClick(oData: any) {
    this.actionButtonClick.emit(oData);
  }
}
