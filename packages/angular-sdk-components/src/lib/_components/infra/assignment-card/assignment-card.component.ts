import { Component, OnInit, Input, Output, EventEmitter, forwardRef, OnChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReferenceComponent } from '../reference/reference.component';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { IdleDetectionService } from '../../../_services/idle-detection.service';
import { ServerConfigService } from '../../../_services/server-config.service';

@Component({
  selector: 'app-assignment-card',
  templateUrl: './assignment-card.component.html',
  styleUrls: ['./assignment-card.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, forwardRef(() => ComponentMapperComponent)]
})
export class AssignmentCardComponent implements OnInit, OnChanges, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;
  @Input() arMainButtons$: any[];
  @Input() arSecondaryButtons$: any[];
  @Input() arChildren$: any[];
  @Input() updateToken$: number;

  @Output() actionButtonClick: EventEmitter<any> = new EventEmitter();

  constructor(
    private idleService: IdleDetectionService,
    private scservice: ServerConfigService
  ) {}

  ngOnInit(): void {
    // Children may contain 'reference' component, so we need to normalize them
    this.arChildren$ = ReferenceComponent.normalizePConnArray(this.arChildren$);

    this.checkAndEnableAutoSave();
  }

  ngOnChanges() {
    // Children may contain 'reference' component, so we need to normalize them
    this.arChildren$ = ReferenceComponent.normalizePConnArray(this.arChildren$);
  }

  ngOnDestroy() {
    this.idleService.stopWatching();
  }

  async checkAndEnableAutoSave() {
    const sdkConfig = await this.scservice.getSdkConfig();
    const autoSave = sdkConfig.serverConfig.autoSave;

    if (autoSave) {
      this.idleService.startWatching(() => this.autoSave(), autoSave);
    }
  }

  onActionButtonClick(oData: any) {
    this.actionButtonClick.emit(oData);
  }

  autoSave() {
    const context = this.pConn$.getContextName();
    if (PCore.getFormUtils().isStateModified(context)) {
      this.pConn$.getActionsApi().saveAssignment(context);
    }
  }
}
