import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-list-view-action-buttons',
  templateUrl: './list-view-action-buttons.component.html',
  styleUrls: ['./list-view-action-buttons.component.scss'],
  standalone: true,
  imports: [CommonModule, MatGridListModule, MatButtonModule]
})
export class ListViewActionButtonsComponent {
  @Input() pConn$: typeof PConnect;
  @Input() context$: string;
  // @Input() closeActionsDialog: any;
  @Output() closeActionsDialog: EventEmitter<any> = new EventEmitter();

  localizedVal = PCore.getLocaleUtils().getLocaleValue;
  localeCategory = 'Data Object';
  isDisabled: boolean;

  ngOnInit(): void {}

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
      .then(() => {})
      .finally(() => {
        this.isDisabled = false;
      });
    this.closeActionsDialog.emit();
  }
}
