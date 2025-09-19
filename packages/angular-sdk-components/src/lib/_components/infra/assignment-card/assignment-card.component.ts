import { Component, OnInit, Input, Output, EventEmitter, forwardRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReferenceComponent } from '../reference/reference.component';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

function isChildrenUpdated(children) {
  if (!children || children.firstChange) {
    return false;
  }
  for (let i = 0; i < children.previousValue.length; i++) {
    if (!PCore.isDeepEqual(children.previousValue[i].getPConnect().getConfigProps(), children.currentValue[i].getPConnect().getConfigProps())) {
      return true;
    }
  }
  return false;
}
@Component({
  selector: 'app-assignment-card',
  templateUrl: './assignment-card.component.html',
  styleUrls: ['./assignment-card.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, forwardRef(() => ComponentMapperComponent)]
})
export class AssignmentCardComponent implements OnInit, OnChanges {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;
  @Input() arMainButtons$: any[];
  @Input() arSecondaryButtons$: any[];
  @Input() arChildren$: any[];
  @Input() updateToken$: number;

  childrenArray: any[] = [];

  @Output() actionButtonClick: EventEmitter<any> = new EventEmitter();

  ngOnInit(): void {
    // Children may contain 'reference' component, so we need to
    //  normalize them
    this.childrenArray = ReferenceComponent.normalizePConnArray(this.arChildren$);
  }

  ngOnChanges(changes: SimpleChanges) {
    // Children may contain 'reference' component, so we need to
    //  normalize them

    const { arChildren$ } = changes;
    if (isChildrenUpdated(arChildren$)) {
      this.childrenArray = ReferenceComponent.normalizePConnArray(this.arChildren$);
    }
  }

  onActionButtonClick(oData: any) {
    this.actionButtonClick.emit(oData);
  }
}
