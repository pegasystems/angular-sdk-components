import { Component, OnInit, Input, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-simple-table-select',
  templateUrl: './simple-table-select.component.html',
  styleUrls: ['./simple-table-select.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class SimpleTableSelectComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  // Used with AngularPConnect
  angularPConnectData: AngularPConnectData = {};

  label = '';
  renderMode = '';
  showLabel = true;
  viewName = '';
  parameters = {};
  dataRelationshipContext = '';
  propsToUse;
  showSimpleTableManual: boolean;
  isSearchable: boolean;
  filters: any;
  listViewProps: any;
  pageClass: any;

  constructor(private angularPConnect: AngularPConnectService) {}

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    this.updateSelf();
  }

  ngOnDestroy(): void {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  onStateChange() {
    // Should always check the bridge to see if the component should
    // update itself (re-render)
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);

    // ONLY call updateSelf when the component should update
    if (bUpdateSelf) {
      this.updateSelf();
    }
  }

  updateSelf() {
    const theConfigProps: any = this.pConn$.getConfigProps();
    this.label = theConfigProps.label;
    this.renderMode = theConfigProps.renderMode;
    this.showLabel = theConfigProps.showLabel;
    this.viewName = theConfigProps.viewName;
    this.parameters = theConfigProps.parameters;
    this.dataRelationshipContext = theConfigProps.dataRelationshipContext;

    this.propsToUse = { label: this.label, showLabel: this.showLabel, ...this.pConn$.getInheritedProps() };

    if (this.propsToUse.showLabel === false) {
      this.propsToUse.label = '';
    }
    const { MULTI } = PCore.getConstants().LIST_SELECTION_MODE;
    const { selectionMode, selectionList }: any = this.pConn$.getConfigProps();
    const isMultiSelectMode = selectionMode === MULTI;
    if (isMultiSelectMode && this.renderMode === 'ReadOnly') {
      this.showSimpleTableManual = true;
    } else {
      const pageReference = this.pConn$.getPageReference();
      let referenceProp = isMultiSelectMode ? selectionList.substring(1) : pageReference.substring(pageReference.lastIndexOf('.') + 1);
      // Replace here to use the context name instead
      let contextPageReference: string | null = null;
      if (this.dataRelationshipContext !== null && selectionMode === 'single') {
        referenceProp = this.dataRelationshipContext;
        contextPageReference = pageReference.concat('.').concat(referenceProp);
      }
      const metadata = isMultiSelectMode
        ? this.pConn$.getFieldMetadata(`@P .${referenceProp}`)
        : this.pConn$.getCurrentPageFieldMetadata(contextPageReference);

      const { datasource: { parameters: fieldParameters = {} } = {}, pageClass } = metadata;

      this.pageClass = pageClass;
      const compositeKeys: any[] = [];
      Object.values(fieldParameters).forEach((param: any) => {
        if (this.isSelfReferencedProperty(param, referenceProp)) {
          compositeKeys.push(param.substring(param.lastIndexOf('.') + 1));
        }
      });

      this.processFiltrers(theConfigProps, compositeKeys);
    }
  }

  processFiltrers(theConfigProps, compositeKeys) {
    const defaultRowHeight = '2';

    const additionalTableConfig = {
      rowDensity: false,
      enableFreezeColumns: false,
      autoSizeColumns: false,
      resetColumnWidths: false,
      defaultFieldDef: {
        showMenu: false,
        noContextMenu: true,
        grouping: false
      },
      itemKey: '$key',
      defaultRowHeight
    };

    this.listViewProps = {
      ...theConfigProps,
      title: this.propsToUse.label,
      personalization: false,
      grouping: false,
      expandGroups: false,
      reorderFields: false,
      showHeaderIcons: false,
      editing: false,
      globalSearch: true,
      toggleFieldVisibility: false,
      basicMode: true,
      additionalTableConfig,
      compositeKeys,
      viewName: this.viewName,
      parameters: this.parameters
    };

    this.filters = (this.pConn$.getRawMetadata() as any).config.promotedFilters ?? [];

    this.isSearchable = this.filters.length > 0;
  }

  isSelfReferencedProperty(param, referenceProp) {
    const [, parentPropName] = param.split('.');
    return parentPropName === referenceProp;
  }
}
