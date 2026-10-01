import { Component, Input, Output, EventEmitter } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-action-buttons',
  templateUrl: './action-buttons.component.html',
  styleUrls: ['./action-buttons.component.scss'],
  imports: [MatButtonModule]
})
export class ActionButtonsComponent {
  @Input() arMainButtons$: any[];
  @Input() arSecondaryButtons$: any[];

  @Output() actionButtonClick: EventEmitter<any> = new EventEmitter();

  localizedVal = PCore.getLocaleUtils().getLocaleValue;
  localeCategory = 'Assignment';

  buttonClick(sAction, sButtonType) {
    this.actionButtonClick.emit({ action: sAction, buttonType: sButtonType });
  }
}
