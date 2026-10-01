import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-list-view-action-buttons',
  templateUrl: './list-view-action-buttons.component.html',
  styleUrls: ['./list-view-action-buttons.component.scss'],
  imports: [MatGridListModule, MatButtonModule]
})
export class ListViewActionButtonsComponent {
  @Input() pConn$: typeof PConnect;
  @Input() context$: string;
  // @Input() closeActionsDialog: any;
  @Output() closeActionsDialog: EventEmitter<any> = new EventEmitter();

  localizedVal = PCore.getLocaleUtils().getLocaleValue;
  localeCategory = 'Data Object';
  isDisabled: boolean;

  onCancel() {
    // this.closeActionsDialog();
    this.closeActionsDialog.emit();
    this.pConn$.getActionsApi().cancelDataObject(this.context$);
  }

  onSubmit() {
    this.isDisabled = true;
    this.pConn$
      .getActionsApi()
      .submitEmbeddedDataModal(this.context$)
      .then(() => {
        this.closeActionsDialog.emit();
      })
      // A rejected submit (for example a validation or server error) must not surface as an unhandled promise
      // rejection. The engine reports the error itself; here the dialog simply stays open so the user can correct
      // the input and retry, and `finally` below re-enables the buttons.
      .catch(error => {
        console.error('ListViewActionButtons: submitEmbeddedDataModal failed', error);
      })
      .finally(() => {
        this.isDisabled = false;
      });
  }
}
