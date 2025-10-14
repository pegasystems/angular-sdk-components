import { Component, OnInit, Input, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { buildMetaForListView, getContext } from '../simple-table-manual/helpers';

interface SimpleTableProps {
  // If any, enter additional props that only exist on this component
  multiRecordDisplayAs: string;
  contextClass: any;
  visibility: boolean;
  label: string;
  propertyLabel: string;
  displayMode: string;
  fieldMetadata: any;
  hideLabel: boolean;
  parameters: any;
  isDataObject: boolean;
  type: string;
  ruleClass: string;
  authorContext: string;
  name: string;
}

@Component({
  selector: 'app-simple-table',
  templateUrl: './simple-table.component.html',
  styleUrls: ['./simple-table.component.scss'],
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class SimpleTableComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  angularPConnectData: AngularPConnectData = {};

  bVisible$ = true;
  configProps$: SimpleTableProps;
  fieldGroupProps: any;
  listViewProps: any;
  refToPConnect: any;

  constructor(
    private angularPConnect: AngularPConnectService,
    private utils: Utils
  ) {}

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    // Then, continue on with other initialization

    // call checkAndUpdate when initializing
    this.checkAndUpdate();
  }

  ngOnDestroy(): void {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  checkAndUpdate() {
    // Should always check the bridge to see if the component should
    // update itself (re-render)
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);

    // ONLY call updateSelf when the component should update
    if (bUpdateSelf) {
      this.updateSelf();
    }
  }

  // updateSelf
  updateSelf(): void {
    // moved this from ngOnInit() and call this from there instead...
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as SimpleTableProps;

    if (this.configProps$.visibility != null) {
      this.bVisible$ = this.bVisible$ = this.utils.getBooleanValue(this.configProps$.visibility);
    }

    const { multiRecordDisplayAs } = this.configProps$;
    let { contextClass } = this.configProps$;
    if (!contextClass) {
      let listName = this.pConn$.getComponentConfig().referenceList;
      listName = PCore.getAnnotationUtils().getPropertyName(listName);
      contextClass = this.pConn$.getFieldMetadata(listName)?.pageClass;
    }
    if (multiRecordDisplayAs === 'fieldGroup') {
      this.fieldGroupProps = { ...this.configProps$, contextClass };
    }

    const {
      label: labelProp,
      propertyLabel,
      displayMode,
      fieldMetadata,
      hideLabel,
      parameters,
      isDataObject,
      type,
      ruleClass,
      authorContext,
      name
    } = this.configProps$;

    const label = labelProp || propertyLabel;

    const propsToUse = { label, ...this.pConn$.getInheritedProps() };
    const isDisplayModeEnabled = displayMode === 'DISPLAY_ONLY';

    if (fieldMetadata && fieldMetadata.type === 'Page List' && fieldMetadata.dataRetrievalType === 'refer') {
      const {
        children: [{ children: rawFields }],
        parameters: rawParams
      } = (this.pConn$.getRawMetadata() as any).config;

      if (isDisplayModeEnabled && hideLabel) {
        propsToUse.label = '';
      }

      const metaForListView = buildMetaForListView(
        fieldMetadata,
        rawFields,
        type,
        ruleClass,
        name,
        propsToUse.label,
        isDataObject,
        parameters // resolved params
      );

      const metaForPConnect = JSON.parse(JSON.stringify(metaForListView));
      // @ts-ignore - PCore.getMetadataUtils().getPropertyMetadata - An argument for 'currentClassID' was not provided.
      metaForPConnect.config.parameters = rawParams ?? PCore.getMetadataUtils().getPropertyMetadata(name)?.datasource?.parameters;

      const { referenceListStr: referenceList } = getContext(this.pConn$);
      let requiredContextForQueryInDisplayMode = {};
      if (isDisplayModeEnabled) {
        requiredContextForQueryInDisplayMode = {
          referenceList
        };
      }
      const options = {
        context: this.pConn$.getContextName(),
        pageReference: this.pConn$.getPageReference(),
        ...requiredContextForQueryInDisplayMode
      };

      this.refToPConnect = PCore.createPConnect({ meta: metaForPConnect, options }).getPConnect();

      this.listViewProps = {
        ...metaForListView.config,
        displayMode,
        fieldName: authorContext
      };
    }
  }

  // Callback passed when subscribing to store change
  onStateChange() {
    this.checkAndUpdate();
  }
}
