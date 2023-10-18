import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { ProgressSpinnerService } from '../../../_messages/progress-spinner.service';
import { ErrorMessagesService } from '../../../_messages/error-messages.service';

declare const window: any;

@Component({
  selector: 'app-cancel-alert',
  templateUrl: './cancel-alert.component.html',
  styleUrls: ['./cancel-alert.component.scss'],
  standalone: true,
  imports: [CommonModule, MatGridListModule, MatButtonModule]
})
export class CancelAlertComponent implements OnInit {
  @Input() pConn$: any;
  @Input() bShowAlert$: boolean;
  @Output() onAlertState$ = new EventEmitter<boolean>();

  PCore$: any;

  heading$: string;
  body1$: string;
  body2$: string;
  itemKey: string;
  snackBarRef: any;
  localizedVal: any;
  localeCategory = 'ModalContainer';

  constructor(private erService: ErrorMessagesService, private psService: ProgressSpinnerService) {}

  ngOnInit(): void {
    if (!this.PCore$) {
      this.PCore$ = window.PCore;
    }
  }

  ngOnChanges(changes) {
    if (this.bShowAlert$) {
      this.psService.sendMessage(false);

      const contextName = this.pConn$.getContextName();
      const caseInfo = this.pConn$.getCaseInfo();
      const caseName = caseInfo.getName();
      const ID = caseInfo.getID();
      this.localizedVal = this.PCore$.getLocaleUtils().getLocaleValue;

      this.itemKey = contextName;
      this.heading$ = 'Delete ' + caseName + ' (' + ID + ')';
      this.body1$ = this.localizedVal('Are you sure you want to delete ', this.localeCategory) + caseName + ' (' + ID + ')?';
      this.body2$ = this.localizedVal('Alternatively, you can continue working or save your work for later.', this.localeCategory);

      //this.onAlertState$.emit(true);
    }
  }

  ngOnDestroy() {}

  dismissAlert() {
    this.bShowAlert$ = false;
    this.onAlertState$.emit(false);
  }

  dismissAlertOnly() {
    this.bShowAlert$ = false;
    this.onAlertState$.emit(true);
  }

  sendMessage(sMessage: string) {
    //this.snackBarRef = this.snackBar.open(sMessage,"Ok", { duration: 3000});
    //this.erService.sendMessage("show", sMessage);
    alert(sMessage);
  }

  buttonClick(sAction) {
    const dispatchInfo = {
      context: this.itemKey,
      semanticURL: ''
    };

    const actionsAPI = this.pConn$.getActionsApi();
    this.localizedVal = this.PCore$.getLocaleUtils().getLocaleValue;

    switch (sAction) {
      case 'save':
        this.psService.sendMessage(true);
        // eslint-disable-next-line no-case-declarations
        const savePromise = actionsAPI.saveAndClose(this.itemKey);
        savePromise
          .then(() => {
            this.psService.sendMessage(false);
            this.dismissAlert();

            this.PCore$.getPubSubUtils().publish(this.PCore$.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.CASE_CREATED);
          })
          .catch(() => {
            this.psService.sendMessage(false);
            this.sendMessage(this.localizedVal('Save failed', this.localeCategory));
          });
        break;
      case 'continue':
        this.dismissAlertOnly();
        break;
      case 'delete':
        this.psService.sendMessage(true);

        // eslint-disable-next-line no-case-declarations
        const deletePromise = actionsAPI.deleteCaseInCreateStage(this.itemKey);

        deletePromise
          .then(() => {
            this.psService.sendMessage(false);
            this.dismissAlert();
            this.PCore$.getPubSubUtils().publish(this.PCore$.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL);
          })
          .catch(() => {
            this.psService.sendMessage(false);
            this.sendMessage(this.localizedVal('Delete failed.', this.localeCategory));
          });
        break;
    }
  }
}
