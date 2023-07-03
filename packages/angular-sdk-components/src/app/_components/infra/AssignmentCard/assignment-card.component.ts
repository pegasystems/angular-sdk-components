import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReferenceComponent } from '../Reference/reference.component';
import { ActionButtonsComponent } from '../ActionButtons/action-buttons.component';
import { RegionComponent } from '../Region/region.component';
import { CaseCreateStageComponent } from '../../designSystemExtension/case-create-stage/case-create-stage.component';
import { ViewComponent } from '../View/view.component';

@Component({
  selector: 'app-assignment-card',
  templateUrl: './assignment-card.component.html',
  styleUrls: ['./assignment-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ViewComponent,
    CaseCreateStageComponent,
    RegionComponent,
    ActionButtonsComponent
  ]
})
export class AssignmentCardComponent implements OnInit {
  @Input() pConn$: any;
  @Input() formGroup$: FormGroup;
  @Input() arMainButtons$: Array<any>;
  @Input() arSecondaryButtons$: Array<any>;
  @Input() arChildren$: Array<any>;
  @Input() updateToken$: number;

  @Output() ActionButtonClick: EventEmitter<any> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {
    // Children may contain 'reference' component, so we need to
    //  normalize them
    this.arChildren$ = ReferenceComponent.normalizePConnArray(this.arChildren$);
  }

  ngOnChanges(data: any) {
    // Children may contain 'reference' component, so we need to
    //  normalize them
    this.arChildren$ = ReferenceComponent.normalizePConnArray(this.arChildren$);
  }

  onActionButtonClick(oData: any) {
    this.ActionButtonClick.emit(oData);
  }
}
