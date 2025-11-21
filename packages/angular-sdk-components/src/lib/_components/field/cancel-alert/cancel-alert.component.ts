import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { ProgressSpinnerService } from '../../../_messages/progress-spinner.service';

@Component({
  selector: 'app-cancel-alert',
  templateUrl: './cancel-alert.component.html',
  styleUrls: ['./cancel-alert.component.scss'],
  imports: [CommonModule, MatGridListModule, MatButtonModule]
})
export class CancelAlertComponent implements OnChanges {
  @Input() pConn$: typeof PConnect;
  @Input() bShowAlert$: boolean;
  @Output() onAlertState$: EventEmitter<boolean> = new EventEmitter<boolean>();

  itemKey: string;
  localizedVal: Function;
  localeCategory = 'ModalContainer';

  constructor(private psService: ProgressSpinnerService) {}
  ngOnChanges() {
    if (this.bShowAlert$) {
      this.psService.sendMessage(false);
      const contextName = this.pConn$.getContextName();
      this.localizedVal = PCore.getLocaleUtils().getLocaleValue;
      this.itemKey = contextName;
    }
  }

  dismissAlertOnly() {
    this.bShowAlert$ = false;
    this.onAlertState$.emit(false);
  }

  dismissAlert() {
    this.bShowAlert$ = false;
    this.onAlertState$.emit(true);
  }

  sendMessage(sMessage: string) {
    alert(sMessage);
  }

  buttonClick(sAction) {
    const actionsAPI = this.pConn$.getActionsApi();
    this.localizedVal = PCore.getLocaleUtils().getLocaleValue;

    switch (sAction) {
      case 'continue':
        this.dismissAlertOnly();
        break;
      case 'discard':
        this.psService.sendMessage(true);

        // eslint-disable-next-line no-case-declarations
        const deletePromise = actionsAPI.deleteCaseInCreateStage(this.itemKey);

        deletePromise
          .then(() => {
            this.psService.sendMessage(false);
            this.dismissAlert();
            PCore.getPubSubUtils().publish(PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL);
          })
          .catch(() => {
            this.psService.sendMessage(false);
            this.sendMessage(this.localizedVal('Delete failed.', this.localeCategory));
          });
        break;
      default:
        break;
    }
  }
}
