import { Component, Input, Output, EventEmitter, OnChanges, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { ProgressSpinnerService } from '../../../_messages/progress-spinner.service';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-cancel-alert',
  templateUrl: './cancel-alert.component.html',
  styleUrls: ['./cancel-alert.component.scss'],
  imports: [CommonModule, MatGridListModule, MatButtonModule, forwardRef(() => ComponentMapperComponent)]
})
export class CancelAlertComponent implements OnChanges {
  @Input() pConn$: typeof PConnect;
  @Input() bShowAlert$: boolean;
  @Input() hideDelete: boolean;
  @Input() isDataObject: boolean;
  @Input() skipReleaseLockRequest: any;
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
    this.localizedVal = PCore.getLocaleUtils().getLocaleValue;

    switch (action) {
      case 'continue':
        this.dismissAlertOnly();
        break;
      case 'discard':
        this.psService.sendMessage(true);
        this.handleDiscard();
        break;
      default:
        break;
    }
  }

  // Data objects and local/bulk actions don't have a create-stage case to delete, so each needs its own engine API
  handleDiscard() {
    const actionsAPI = this.pConn$.getActionsApi();
    // @ts-ignore - Property 'options' is private and only accessible within class 'C11nEnv'.
    const isBulkAction = (this.pConn$ as any)?.options?.isBulkAction;
    const isLocalAction = this.pConn$.getValue(PCore.getConstants().CASE_INFO.IS_LOCAL_ACTION);

    if (!this.isDataObject && !isLocalAction && !isBulkAction) {
      actionsAPI
        .deleteCaseInCreateStage(this.itemKey, this.hideDelete)
        .then(() => {
          this.psService.sendMessage(false);
          this.dismissAlert();
          PCore.getPubSubUtils().publish(PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL);
        })
        .catch(() => {
          this.psService.sendMessage(false);
          this.sendMessage(this.localizedVal('Delete failed.', this.localeCategory));
        });
    } else if (isLocalAction) {
      this.psService.sendMessage(false);
      this.dismissAlert();
      actionsAPI.cancelAssignment(this.itemKey, false);
    } else if (isBulkAction) {
      this.psService.sendMessage(false);
      this.dismissAlert();
      actionsAPI.cancelBulkAction(this.itemKey);
    } else {
      this.psService.sendMessage(false);
      this.dismissAlert();
      this.pConn$.getContainerManager().removeContainerItem({ containerItemID: this.itemKey, skipReleaseLockRequest: this.skipReleaseLockRequest });
    }
  }
}
