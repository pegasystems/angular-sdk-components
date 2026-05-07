import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy, forwardRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

interface EmbeddedDataMultiProps {
  addEditAction?: string;
  addEditView?: string;
  displayAs?: string;
  editAction?: string;
  editMode?: string;
  editType?: string;
  editView?: string;
  readOnly?: boolean;
  repeatingView?: string;
  targetObjectClass?: string;
  useSeparateActionForEdit?: boolean;
  useSeparateViewForEdit?: boolean;
  visibility?: boolean;
}

@Component({
  selector: 'app-embedded-data-multi',
  templateUrl: './embedded-data-multi.component.html',
  styleUrls: ['./embedded-data-multi.component.scss'],
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class EmbeddedDataMultiComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  angularPConnectData: AngularPConnectData = {};
  simpleTablePConn: typeof PConnect;
  simpleTableComponentName = '';
  bVisible$ = true;

  constructor(private angularPConnect: AngularPConnectService) {}

  ngOnInit(): void {
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    this.checkAndUpdate();
  }

  ngOnDestroy(): void {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  onStateChange = () => {
    this.checkAndUpdate();
  };

  checkAndUpdate() {
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);
    if (bUpdateSelf) {
      this.updateSelf();
    }
  }

  updateSelf() {
    const configProps = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as EmbeddedDataMultiProps;
    const {
      addEditAction,
      addEditView,
      displayAs,
      editAction,
      editMode,
      editType,
      editView,
      readOnly = false,
      repeatingView,
      targetObjectClass,
      useSeparateActionForEdit,
      useSeparateViewForEdit,
      visibility = true
    } = configProps;

    this.bVisible$ = visibility !== false;

    const rawMetadata = this.pConn$.getRawMetadata();
    const rawMetadataConfig = rawMetadata?.config as any;

    if (!rawMetadataConfig) {
      return;
    }

    const renderMode = readOnly ? 'ReadOnly' : 'Editable';

    let columnsChildren;
    if (displayAs === 'table' || displayAs === 'simpleTable') {
      columnsChildren = [
        {
          children: rawMetadataConfig.columns || [],
          name: 'Columns',
          type: 'Region'
        }
      ];
    }

    let regionWithView: any[] = [];
    if (displayAs === 'repeatingView') {
      regionWithView = [
        {
          children: [
            {
              type: 'reference',
              config: {
                type: 'view',
                name: repeatingView
              }
            }
          ],
          name: 'view',
          type: 'Region'
        }
      ];
    }

    const { pagelistValue } = rawMetadataConfig;
    const authorContext = pagelistValue?.startsWith('@P') ? pagelistValue?.substring(3) : pagelistValue;

    const componentConfig = {
      type: 'View',
      config: {
        template: 'SimpleTable',
        type: 'multirecordlist',
        authorContext,
        name: authorContext?.substring(1),
        renderMode,
        multiRecordDisplayAs: displayAs === 'repeatingView' ? 'fieldGroup' : displayAs,
        referenceList: pagelistValue,
        contextClass: targetObjectClass,
        editMode,
        editModeConfig: {
          editType,
          defaultView: addEditView,
          defaultAction: addEditAction,
          useSeparateViewForEdit,
          useSeparateActionForEdit,
          editView,
          editAction
        },
        label: rawMetadataConfig.label,
        hideLabel: rawMetadataConfig.hideLabel,
        children: columnsChildren,
        displayField: rawMetadataConfig.displayField,
        uniqueField: rawMetadataConfig.uniqueField,
        targetClassLabel: rawMetadataConfig.targetClassLabel,
        targetClassLabelOption: rawMetadataConfig.targetClassLabelOption,
        fieldHeader: rawMetadataConfig.repeatingViewHeadingSource,
        heading: rawMetadataConfig.repeatingViewHeading,
        allowActions: {
          allowAdd: rawMetadataConfig.allowAdd ?? true,
          allowEdit: rawMetadataConfig.allowEdit ?? true,
          allowDelete: rawMetadataConfig.allowDelete ?? true,
          allowDragDrop: rawMetadataConfig.allowDragDrop ?? true
        },
        allowRowDelete: rawMetadataConfig.allowRowDelete ?? true,
        allowRowEdit: rawMetadataConfig.allowRowEdit ?? true
      },
      children: regionWithView
    };

    const component = this.pConn$.createComponent(componentConfig as any, '', 0, {});
    if (component) {
      this.simpleTablePConn = component.getPConnect();
      this.simpleTableComponentName = this.simpleTablePConn.getComponentName() ?? '';
    }
  }
}
