import { Component, OnInit, Input, forwardRef, OnDestroy, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { buildView, getReferenceList } from '../../../_helpers/field-group-utils';
import { Utils } from '../../../_helpers/utils';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { evaluateAllowRowAction } from '../utils';

interface FieldGroupTemplateProps {
  // If any, enter additional props that only exist on this component
  label?: string;
  hideLabel?: boolean;
  allowActions?: any;
  allowRowDelete?: any;
  referenceList?: any[];
  contextClass: string;
  renderMode?: string;
  heading?: string;
  lookForChildInConfig?: boolean;
  displayMode?: string;
  fieldHeader?: string;
  allowTableEdit: boolean;
  targetClassLabel?: string;
}

@Component({
  selector: 'app-field-group-template',
  templateUrl: './field-group-template.component.html',
  styleUrls: ['./field-group-template.component.scss'],
  imports: [CommonModule, MatButtonModule, forwardRef(() => ComponentMapperComponent)]
})
export class FieldGroupTemplateComponent implements OnInit, OnDestroy, OnChanges {
  @Input() configProps$: FieldGroupTemplateProps;
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  angularPConnectData: AngularPConnectData = {};

  showLabel$?: boolean = true;
  label$?: string;
  readonlyMode: boolean;
  contextClass: any;
  heading: any;
  children: any;
  menuIconOverride$: any;
  referenceListLength = signal<number | null>(null);
  fieldHeader: any;

  allowAdd = true;
  allowEdit = true;
  allowDelete = true;

  constructor(
    private angularPConnect: AngularPConnectService,
    private utils: Utils
  ) {}

  ngOnInit(): void {
    this.menuIconOverride$ = this.utils.getImageSrc('trash', this.utils.getSDKStaticContentUrl());

    const { allowActions, allowTableEdit, referenceList } = this.configProps$;

    if (allowActions && Object.keys(allowActions).length > 0) {
      this.allowAdd = allowActions.allowAdd ?? allowTableEdit ?? true;
      this.allowEdit = allowActions.allowEdit ?? true;
      this.allowDelete = allowActions.allowDelete ?? allowTableEdit ?? true;
    } else {
      this.allowAdd = allowTableEdit ?? true;
      this.allowDelete = allowTableEdit ?? true;
    }

    if (referenceList?.length === 0 && (this.allowAdd || this.allowEdit)) {
      this.pConn$.getListActions().insert({ classID: this.contextClass }, referenceList.length);
    }
  }

  ngOnDestroy(): void {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  ngOnChanges(changes) {
    if (changes && changes.configProps$) {
      const props = changes.configProps$;
      if (props.currentValue !== props.previousValue) {
        this.configProps$ = props.currentValue;

        if (changes?.pConn$?.currentValue) {
          this.pConn$ = changes?.pConn$?.currentValue;
        }

        this.updateSelf();

        setTimeout(() => {
          this.angularPConnect.shouldComponentUpdate(this);
        }, 100);
      }
    }
  }

  updateSelf() {
    const inheritedProps: any = this.pConn$.getInheritedProps();

    const { label, hideLabel, allowRowDelete, referenceList, fieldHeader, renderMode, displayMode, heading, contextClass, lookForChildInConfig } =
      this.configProps$;

    // label within inheritedProps takes precedence over configProps
    this.label$ = inheritedProps.label || label;

    this.showLabel$ = referenceList?.length === 0 || !hideLabel;

    this.readonlyMode = renderMode === 'ReadOnly' || displayMode === 'DISPLAY_ONLY';

    this.contextClass = contextClass;
    this.heading = heading ?? 'Row';
    this.fieldHeader = fieldHeader;

    const resolvedList = getReferenceList(this.pConn$);
    this.pConn$.setReferenceList(resolvedList);

    if (this.readonlyMode) {
      this.pConn$.setInheritedProp('displayMode', 'DISPLAY_ONLY');
    }

    if (this.referenceListLength() != referenceList?.length) {
      // @ts-ignore - Expected 3 arguments, but got 1
      this.pConn$.getListActions().initDefaultPageInstructions(resolvedList);

      this.children = referenceList?.map((item, index) => {
        return {
          id: index,
          name: this.fieldHeader === 'propertyRef' ? this.getDynamicHeader(item, index) : this.getStaticHeader(this.heading, index),
          children: buildView(this.pConn$, index, lookForChildInConfig),
          allowRowDelete: evaluateAllowRowAction(allowRowDelete, item)
        };
      });
    }
    this.referenceListLength.set(referenceList?.length || 0);
  }

  getStaticHeader = (heading, index) => {
    return `${heading} ${index + 1}`;
  };

  getDynamicHeader = (item, index) => {
    if (this.heading && item[this.heading.substring(1)]) {
      return item[this.heading.substring(1)];
    }
    return `Row ${index + 1}`;
  };

  addFieldGroupItem() {
    this.pConn$.getListActions().insert({ classID: this.contextClass }, this.referenceListLength() as number);
  }

  deleteFieldGroupItem(index) {
    this.pConn$.getListActions().deleteEntry(index);
  }

  getAddBtnLabel() {
    const { targetClassLabel } = this.configProps$;
    return targetClassLabel ? `+ Add ${targetClassLabel}` : '+ Add';
  }
}
