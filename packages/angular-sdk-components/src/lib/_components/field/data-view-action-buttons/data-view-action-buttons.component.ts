import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-data-view-action-buttons',
  templateUrl: './data-view-action-buttons.component.html',
  imports: [CommonModule, MatGridListModule, MatButtonModule]
})
export class DataViewActionButtonsComponent {
  @Input() pConn$: typeof PConnect;
  @Input() context$: string;
  @Input() dataObjectAction$: string;
  @Input() actionID$ = '';
  // The container item publishes the record keys JSON-serialised.
  @Input() dataRecordKeys$ = '';
  @Input() classID$ = '';

  localizedVal = PCore.getLocaleUtils().getLocaleValue;
  localeCategory = 'Data Object';
  bDisabled$ = false;

  constructor(private cdRef: ChangeDetectorRef) {}

  get primaryLabel$(): string {
    return this.dataObjectAction$ === PCore.getConstants().RESOURCE_STATUS.UPDATE ? 'Update' : 'Submit';
  }

  onCancel() {
    // The engine drops the container item, which collapses the modal.
    this.pConn$.getActionsApi().cancelDataObject(this.context$);
  }

  onSubmit() {
    const { RESOURCE_STATUS, PUB_SUB_EVENTS } = PCore.getConstants();
    const { DATA_OBJECT_CREATED, DATA_OBJECT_UPDATED } = PUB_SUB_EVENTS.DATA_EVENTS;
    const actionsApi = this.pConn$.getActionsApi();
    const { publish } = PCore.getPubSubUtils();

    let submitAction: Promise<any>;
    let publishCompleted: (data?: any) => void;

    switch (this.dataObjectAction$) {
      case RESOURCE_STATUS.UPDATE:
        submitAction = actionsApi.updateDataObject(this.context$, this.getRecordKeys());
        publishCompleted = () => publish(DATA_OBJECT_UPDATED, { classId: this.classID$ });
        break;
      case RESOURCE_STATUS.OPEN_FLOW_ACTION:
        submitAction = actionsApi.submitDataObjectAction(this.context$, this.getRecordKeys(), this.actionID$);
        publishCompleted = () => publish(DATA_OBJECT_UPDATED, { classId: this.classID$, actionID: this.actionID$ });
        break;
      default:
        submitAction = actionsApi.createDataObject(this.context$);
        publishCompleted = data => publish(DATA_OBJECT_CREATED, { classId: this.classID$, data });
    }

    this.bDisabled$ = true;

    submitAction
      .then(data => {
        publishCompleted(data);
      })
      .catch(() => {
        // Keep the modal open so the server error banner is visible and the edit can be corrected.
      })
      .finally(() => {
        this.bDisabled$ = false;
        // Change detection is zoneless, so this async reset needs to be flagged explicitly.
        this.cdRef.markForCheck();
      });
  }

  private getRecordKeys(): Record<string, any> {
    return this.dataRecordKeys$ ? JSON.parse(this.dataRecordKeys$) : {};
  }
}
