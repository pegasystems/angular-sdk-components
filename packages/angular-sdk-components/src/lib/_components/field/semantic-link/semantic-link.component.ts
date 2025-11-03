import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { getDataReferenceInfo, isLinkTextEmpty } from '../../../_helpers/semanticLink-utils';
import { Utils } from '../../../_helpers/utils';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface SemanticLinkProps extends PConnFieldProps {
  // If any, enter additional props that only exist on SemanticLink here
  text: string;
  resourcePayload: any;
  resourceParams: any;
  previewKey: string;
  referenceType: string;
  dataRelationshipContext: string;
  contextPage: any;
}

@Component({
  selector: 'app-semantic-link',
  templateUrl: './semantic-link.component.html',
  styleUrls: ['./semantic-link.component.scss'],
  imports: [CommonModule]
})
export class SemanticLinkComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  angularPConnectData: AngularPConnectData = {};
  configProps$: SemanticLinkProps;

  label$ = '';
  value$ = '';
  displayMode$?: string = '';
  bVisible$ = true;
  linkURL = '';
  dataResourcePayLoad: any;
  referenceType: string;
  shouldTreatAsDataReference: boolean;
  previewKey: string;
  resourcePayload: any = {};
  payload: object;
  dataViewName = '';
  isLinkTextEmpty = false;

  constructor(
    private angularPConnect: AngularPConnectService,
    private utils: Utils
  ) {}

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    this.checkAndUpdate();
  }

  ngOnDestroy(): void {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  onStateChange() {
    this.updateSelf();
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

  updateSelf() {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as SemanticLinkProps;
    const { text, value, displayMode, label, visibility, contextPage } = this.configProps$;

    this.value$ = text || value || '';
    this.displayMode$ = displayMode;
    this.label$ = label;
    if (visibility) {
      this.bVisible$ = this.utils.getBooleanValue(visibility);
    }

    this.referenceType = this.configProps$.referenceType;
    this.previewKey = this.configProps$.previewKey;
    this.resourcePayload = this.configProps$.resourcePayload ?? {};
    this.dataResourcePayLoad = this.resourcePayload?.resourceType === 'DATA' ? this.resourcePayload : null;

    const {
      RESOURCE_TYPES: { DATA },
      WORKCLASS,
      CASE_INFO: { CASE_INFO_CLASSID }
    } = PCore.getConstants();

    this.shouldTreatAsDataReference = !this.previewKey && !!this.resourcePayload?.caseClassName;

    if (contextPage?.classID) {
      this.resourcePayload.caseClassName = contextPage.classID;
    }
    if (this.resourcePayload.caseClassName === WORKCLASS) {
      this.resourcePayload.caseClassName = this.pConn$.getValue(CASE_INFO_CLASSID);
    }

    let isData = false;
    this.payload = {};

    const isDataReference = this.referenceType?.toUpperCase() === DATA || this.shouldTreatAsDataReference;

    if (isDataReference) {
      isData = this.setDataReferenceInfo();
    } else if (this.dataResourcePayLoad) {
      isData = true;
      this.setDataPayloadFromResource();
    }

    this.linkURL = this.getLinkURL(isData);
    this.isLinkTextEmpty = isLinkTextEmpty(this.value$);
  }

  showDataAction() {
    if (this.dataResourcePayLoad && this.dataResourcePayLoad.resourceType === 'DATA') {
      const { content } = this.dataResourcePayLoad;
      const lookUpDataPageInfo = PCore.getDataTypeUtils().getLookUpDataPageInfo(this.dataResourcePayLoad?.className);
      const lookUpDataPage = PCore.getDataTypeUtils().getLookUpDataPage(this.dataResourcePayLoad?.className);
      if (lookUpDataPageInfo) {
        const { parameters } = lookUpDataPageInfo as any;
        this.payload = Object.keys(parameters).reduce((acc, param) => {
          const paramValue = parameters[param];
          return {
            ...acc,
            [param]: PCore.getAnnotationUtils().isProperty(paramValue) ? content[PCore.getAnnotationUtils().getPropertyName(paramValue)] : paramValue
          };
        }, {});
      }
      this.pConn$.getActionsApi().showData('pyDetails', lookUpDataPage, {
        ...this.payload
      });
    }
    if ((this.referenceType && this.referenceType.toUpperCase() === 'DATA') || this.shouldTreatAsDataReference) {
      this.pConn$.getActionsApi().showData('pyDetails', this.dataViewName, {
        ...this.payload
      });
    }
  }

  openLinkClick(e) {
    if (!e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      if (
        (this.dataResourcePayLoad && this.dataResourcePayLoad.resourceType === 'DATA') ||
        (this.referenceType && this.referenceType.toUpperCase() === 'DATA') ||
        this.shouldTreatAsDataReference
      ) {
        this.showDataAction();
      } else if (this.previewKey) {
        this.pConn$.getActionsApi().openWorkByHandle(this.previewKey, this.resourcePayload.caseClassName);
      }
    }
  }

  private setDataReferenceInfo() {
    const { dataRelationshipContext = null, contextPage } = this.configProps$;
    try {
      const dataRefContext = getDataReferenceInfo(this.pConn$, dataRelationshipContext, contextPage);
      this.dataViewName = dataRefContext.dataContext ?? '';
      this.payload = dataRefContext.dataContextParameters ?? {};
      return true;
    } catch (error) {
      console.log('Error in getting the data reference info', error);
      return false;
    }
  }

  private setDataPayloadFromResource() {
    this.dataViewName = PCore.getDataTypeUtils().getLookUpDataPage(this.resourcePayload.className);
    const lookUpDataPageInfo: any = PCore.getDataTypeUtils().getLookUpDataPageInfo(this.resourcePayload.className);
    const { content } = this.resourcePayload;

    if (lookUpDataPageInfo) {
      const { parameters } = lookUpDataPageInfo;
      this.payload = Object.keys(parameters).reduce((acc, param) => {
        const paramValue = parameters[param];
        const propertyName = PCore.getAnnotationUtils().getPropertyName(paramValue);
        return {
          ...acc,
          [param]: PCore.getAnnotationUtils().isProperty(paramValue) ? content[propertyName] : paramValue
        };
      }, {});
    } else {
      const keysInfo = PCore.getDataTypeUtils().getDataPageKeys(this.dataViewName) ?? [];
      this.payload = keysInfo.reduce((acc, curr) => {
        return {
          ...acc,
          [curr.keyName]: content[curr.isAlternateKeyStorage ? curr.linkedField : curr.keyName]
        };
      }, {});
    }
  }

  private getLinkURL(isData: boolean) {
    const { ACTION_OPENWORKBYHANDLE, ACTION_SHOWDATA, ACTION_GETOBJECT } = PCore.getSemanticUrlUtils().getActions() as any;
    const { resourceParams = {} } = this.configProps$;

    if (isData && this.dataViewName && this.payload) {
      return PCore.getSemanticUrlUtils().getResolvedSemanticURL(
        ACTION_SHOWDATA,
        { pageName: 'pyDetails', dataViewName: this.dataViewName },
        { ...this.payload }
      );
    }

    const isObjectType = (PCore.getCaseUtils() as any).isObjectCaseType(this.resourcePayload.caseClassName);
    const workIDKey = isObjectType ? 'objectID' : 'workID';
    if (resourceParams.workID === '' && typeof this.previewKey === 'string') {
      resourceParams[workIDKey] = this.previewKey.split(' ')[1];
    } else {
      resourceParams[workIDKey] = resourceParams.workID;
    }

    if (this.previewKey) {
      resourceParams.id = this.previewKey;
    }

    return PCore.getSemanticUrlUtils().getResolvedSemanticURL(
      isObjectType ? ACTION_GETOBJECT : ACTION_OPENWORKBYHANDLE,
      this.resourcePayload,
      resourceParams
    );
  }
}
