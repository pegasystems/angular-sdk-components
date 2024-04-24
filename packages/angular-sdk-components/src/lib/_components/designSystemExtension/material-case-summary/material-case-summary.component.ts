import { Component, OnInit, Input, forwardRef, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Utils } from '../../../_helpers/utils';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-material-case-summary',
  templateUrl: './material-case-summary.component.html',
  styleUrls: ['./material-case-summary.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class MaterialCaseSummaryComponent implements OnInit, OnChanges {
  @Input() status$: string;
  @Input() bShowStatus$: boolean;
  @Input() primaryFields$: any[];
  @Input() secondaryFields$: any[];

  primaryFieldsWithStatus$: any[];

  constructor(private utils: Utils) {}
  localizedVal = PCore.getLocaleUtils().getLocaleValue;
  localeCategory = 'ModalContainer';
  ngOnInit(): void {
    this.updatePrimaryWithStatus();
    this.updateLabelAndDate(this.primaryFieldsWithStatus$);
    this.updateLabelAndDate(this.secondaryFields$);
  }

  // eslint-disable-next-line sonarjs/no-identical-functions
  ngOnChanges() {
    this.updatePrimaryWithStatus();
    this.updateLabelAndDate(this.primaryFieldsWithStatus$);
    this.updateLabelAndDate(this.secondaryFields$);
  }

  updateLabelAndDate(arData: any[]) {
    for (const field of arData) {
      switch (field.type.toLowerCase()) {
        case 'caseoperator':
          if (field.config.label.toLowerCase() == 'create operator') {
            field.config.displayLabel = field.config.createLabel;
          } else if (field.config.label.toLowerCase() == 'update operator') {
            field.config.displayLabel = field.config.updateLabel;
          }
          break;
        case 'date':
          field.config.value = this.utils.generateDate(field.config.value, 'Date-Long');
          break;
        case 'userreference':
        case 'decimal':
        case 'dropdown':
          field.config.displayLabel = field.config.label;
          break;
        case 'checkbox':
          field.config.displayLabel = field.config.caption;
          break;
        default:
          break;
      }
    }
  }

  updatePrimaryWithStatus() {
    this.primaryFieldsWithStatus$ = [];
    for (const prim of this.primaryFields$) {
      prim.config.value = this.localizedVal(prim.config.value, this.localeCategory);
      this.primaryFieldsWithStatus$.push(prim);
    }

    if (this.bShowStatus$) {
      const oStatus = { type: 'status', config: { value: this.status$, label: 'Status' } };

      const count = this.primaryFieldsWithStatus$.length;
      if (count < 2) {
        this.primaryFieldsWithStatus$.push(oStatus);
      } else {
        this.primaryFieldsWithStatus$.splice(1, 0, oStatus);
      }
    }
  }
}
