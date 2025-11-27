import { Component, Input, Output, EventEmitter, OnChanges, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { ProgressSpinnerService } from '../../../_messages/progress-spinner.service';
import { ComponentMapperComponent } from 'packages/angular-sdk-components/src/public-api';

@Component({
  selector: 'app-cancel-alert',
  templateUrl: './cancel-alert.component.html',
  styleUrls: ['./cancel-alert.component.scss'],
  imports: [CommonModule, MatGridListModule, MatButtonModule, forwardRef(() => ComponentMapperComponent)]
})
export class CancelAlertComponent implements OnChanges {
  @Input() pConn$: typeof PConnect;
  @Input() bShowAlert$: boolean;
  @Output() onAlertState$: EventEmitter<boolean> = new EventEmitter<boolean>();

  itemKey: string;
  localizedVal: Function;
  localeCategory = 'ModalContainer';
  discardButton: any;
  goBackButton: any;

  constructor(private psService: ProgressSpinnerService) {}
  ngOnChanges() {
    if (this.bShowAlert$) {
      this.psService.sendMessage(false);
      const contextName = this.pConn$.getContextName();
      this.localizedVal = PCore.getLocaleUtils().getLocaleValue;
      this.itemKey = contextName;
      this.createCancelAlertButtons();
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

  createCancelAlertButtons() {
    this.discardButton = {
      actionID: 'discard',
      jsAction: 'discard',
      name: this.pConn$.getLocalizedValue('Discard', '', '')
    };
    this.goBackButton = {
      actionID: 'continue',
      jsAction: 'continue',
      name: this.pConn$.getLocalizedValue('Go back', '', '')
    };
  }

  buttonClick({ action }) {
    const actionsAPI = this.pConn$.getActionsApi();
    this.localizedVal = PCore.getLocaleUtils().getLocaleValue;

    switch (action) {
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
