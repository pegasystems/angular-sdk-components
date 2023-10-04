import { Component, OnInit, Input, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ProgressSpinnerService } from '../../../_messages/progress-spinner.service';
import { ErrorMessagesService } from '../../../_messages/error-messages.service';
import { Utils } from '../../../_helpers/utils';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss'],
  providers: [Utils],
  standalone: true,
  imports: [CommonModule, MatButtonModule]
})
export class TodoComponent implements OnInit {
  @Input() pConn$: any;
  @Input() caseInfoID$: string;
  @Input() datasource$: any;
  @Input() headerText$: string;
  @Input() itemKey$: string;
  @Input() showTodoList$: boolean = true;
  @Input() target$: string;
  @Input() type$: string = 'worklist';
  @Input() context$: string;
  @Input() myWorkList$: any;
  @Input() isConfirm;

  PCore$: any;

  configProps$: Object;
  currentUser$: string;
  currentUserInitials$: string = '--';
  assignmentCount$: number;
  bShowMore$: boolean = true;
  arAssignments$: Array<any>;
  assignmentsSource$: any;
  CONSTS: any;
  bLogging = true;

  constructor(private psService: ProgressSpinnerService, private erService: ErrorMessagesService, private ngZone: NgZone, private utils: Utils) {}

  ngOnInit() {
    if (!this.PCore$) {
      this.PCore$ = window.PCore;
    }
    this.CONSTS = this.PCore$.getConstants();
    const { CREATE_STAGE_SAVED, CREATE_STAGE_DELETED } = this.PCore$.getEvents().getCaseEvent();

    this.PCore$.getPubSubUtils().subscribe(
      this.PCore$.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL,
      () => {
        this.updateToDo();
      },
      'updateToDo'
    );

    this.PCore$.getPubSubUtils().subscribe(
      CREATE_STAGE_SAVED,
      () => {
        this.updateList();
      },
      CREATE_STAGE_SAVED
    );

    this.PCore$.getPubSubUtils().subscribe(
      CREATE_STAGE_DELETED,
      () => {
        this.updateList();
      },
      CREATE_STAGE_DELETED
    );

    this.updateToDo();
  }

  ngOnDestroy() {
    const { CREATE_STAGE_SAVED, CREATE_STAGE_DELETED } = this.PCore$.getEvents().getCaseEvent();

    this.PCore$.getPubSubUtils().unsubscribe(this.PCore$.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL, 'updateToDo');

    this.PCore$.getPubSubUtils().unsubscribe(CREATE_STAGE_SAVED, CREATE_STAGE_SAVED);

    this.PCore$.getPubSubUtils().unsubscribe(CREATE_STAGE_DELETED, CREATE_STAGE_DELETED);
  }

  ngOnChanges(data: any) {
    // don't update until we'va had an init
    if (this.PCore$) {
      this.updateToDo();
    }
  }

  updateWorkList(key) {
    this.PCore$.getDataApiUtils()
      .getData(key)
      .then((responseData) => {
        const dataObject = {};
        dataObject[key] = {
          pxResults: responseData.data.data
        };

        this.pConn$.updateState(dataObject);
        this.updateToDo();
      })
      .catch((err) => {
        console.error(err?.stack);
      });
  }

  updateList() {
    this.updateWorkList('D_pyMyWorkList');
  }

  updateToDo() {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());

    if (this.headerText$ == undefined) {
      this.headerText$ = this.configProps$['headerText'];
    }

    this.datasource$ = this.configProps$['datasource'] ? this.configProps$['datasource'] : this.datasource$;
    this.myWorkList$ = this.configProps$['myWorkList'] ? this.configProps$['myWorkList'] : this.myWorkList$;

    this.assignmentsSource$ = this.datasource$?.source || this.myWorkList$?.source;

    if (this.showTodoList$) {
      this.assignmentCount$ = this.assignmentsSource$ != null ? this.assignmentsSource$.length : 0;
      this.arAssignments$ = this.topThreeAssignments(this.assignmentsSource$);
    } else {
      // get caseInfoId assignment.
      if (this.caseInfoID$ != undefined) {
        this.arAssignments$ = this.getCaseInfoAssignment(this.assignmentsSource$, this.caseInfoID$);
      }
    }

    this.currentUser$ = this.PCore$.getEnvironmentInfo().getOperatorName();
    this.currentUserInitials$ = this.utils.getInitials(this.currentUser$);
  }

  getID(assignment: any) {
    if (assignment.value) {
      const refKey = assignment.value;
      return refKey.substring(refKey.lastIndexOf(' ') + 1);
    } else {
      const refKey = assignment.ID;
      const arKeys = refKey.split('!')[0].split(' ');
      return arKeys[2];
    }
  }

  topThreeAssignments(assignmentsSource: Array<any>): Array<any> {
    return Array.isArray(assignmentsSource) ? assignmentsSource.slice(0, 3) : [];
  }

  getAssignmentId(assignment) {
    return this.type$ === this.CONSTS.TODO ? assignment.ID : assignment.id;
  };

  getPriority(assignment) {
    return this.type$ === this.CONSTS.TODO ? assignment.urgency : assignment.priority;
  };

  getAssignmentName(assignment) {
    return this.type$ === this.CONSTS.TODO ? assignment.name : assignment.stepName;
  };

  initAssignments(): Array<any> {
    if (this.assignmentsSource$) {
      this.assignmentCount$ = this.assignmentsSource$.length;
      return this.topThreeAssignments(this.assignmentsSource$);
    } else {
      // turn off todolist
      return [];
    }
  }

  getCaseInfoAssignment(assignmentsSource: Array<any>, caseInfoID: string) {
    const result: Array<any> = [];
    for (const source of assignmentsSource) {
      if (source.ID.indexOf(caseInfoID) >= 0) {
        const listRow = JSON.parse(JSON.stringify(source));
        // urgency becomes priority
        listRow['priority'] = listRow.urgency || undefined;
        // mimic regular list
        listRow['id'] = listRow['ID'] || undefined;
        result.push(listRow);
      }
    }
  
    return result;
  }
  
  _showMore() {
    this.ngZone.run(() => {
      this.bShowMore$ = false;
      this.arAssignments$ = this.assignmentsSource$;
    });
  }

  _showLess() {
    this.ngZone.run(() => {
      this.bShowMore$ = true;

      this.arAssignments$ = this.topThreeAssignments(this.assignmentsSource$);
    });
  }

  isChildCase(assignment) {
    return assignment.isChild;
  };

  clickGo(assignment) {
    const id = this.getAssignmentId(assignment);
    let { classname = '' } = assignment;
    const sTarget = this.pConn$.getContainerName();
    const sTargetContainerName = sTarget;

    const options = { containerName: sTargetContainerName };

    if (classname === null || classname === '') {
      classname = this.pConn$.getCaseInfo().getClassName();
    }

    if (sTarget === 'workarea') {
      options['isActionFromToDoList'] = true;
      options['target'] = '';
      options['context'] = null;
      options['isChild'] = this.isChildCase(assignment);
    } else {
      options['isActionFromToDoList'] = false;
      options['target'] = sTarget;
    }

    this.psService.sendMessage(true);

    this.pConn$
      .getActionsApi()
      .openAssignment(id, classname, options)
      .then(() => {
        this.psService.sendMessage(false);
        if (this.bLogging) {
          console.log(`openAssignment completed`);
        }
      })
      .catch(() => {
      this.psService.sendMessage(false);
      this.erService.sendMessage('show', "Failed to open");
      });
  }
}
