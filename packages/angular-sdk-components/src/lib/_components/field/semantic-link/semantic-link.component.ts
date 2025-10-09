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
    this.value$ = this.configProps$.text ? this.configProps$.text : this.configProps$.value || '';
    this.displayMode$ = this.configProps$.displayMode;
    this.label$ = this.configProps$.label;
    if (this.configProps$.visibility) {
      this.bVisible$ = this.utils.getBooleanValue(this.configProps$.visibility);
    }
    const { resourceParams = {}, dataRelationshipContext = null, contextPage } = this.configProps$;
    this.referenceType = this.configProps$.referenceType;
    this.previewKey = this.configProps$.previewKey;
    this.resourcePayload = this.configProps$.resourcePayload ?? {};
    const { ACTION_OPENWORKBYHANDLE, ACTION_SHOWDATA, ACTION_GETOBJECT } = PCore.getSemanticUrlUtils().getActions() as any;
    this.dataResourcePayLoad = this.resourcePayload?.resourceType === 'DATA' ? this.resourcePayload : null;
    const {
      RESOURCE_TYPES: { DATA },
      WORKCLASS,
      CASE_INFO: { CASE_INFO_CLASSID }
    } = PCore.getConstants();

    this.payload = {};
    let isData = false;
    this.shouldTreatAsDataReference = !this.previewKey && this.resourcePayload?.caseClassName;
    if (contextPage?.classID) {
      this.resourcePayload.caseClassName = contextPage.classID;
    }
    /* TODO : In case of duplicate search case the classID is Work- need to set it to
  the current case class ID */
    if (this.resourcePayload.caseClassName === WORKCLASS) {
      this.resourcePayload.caseClassName = this.pConn$.getValue(CASE_INFO_CLASSID);
    }

    if ((this.referenceType && this.referenceType.toUpperCase() === DATA) || this.shouldTreatAsDataReference) {
      try {
        isData = true;
        const dataRefContext = getDataReferenceInfo(this.pConn$, dataRelationshipContext, contextPage);
        this.dataViewName = dataRefContext.dataContext ?? '';
        this.payload = dataRefContext.dataContextParameters ?? {};
      } catch (error) {
        console.log('Error in getting the data reference info', error);
      }
    } else if (this.resourcePayload && this.resourcePayload.resourceType === 'DATA') {
      isData = true;
      this.dataViewName = PCore.getDataTypeUtils().getLookUpDataPage(this.resourcePayload.className);
      const lookUpDataPageInfo: any = PCore.getDataTypeUtils().getLookUpDataPageInfo(this.resourcePayload.className);
      const { content } = this.resourcePayload;
      if (lookUpDataPageInfo) {
        const { parameters } = lookUpDataPageInfo;
        this.payload = Object.keys(parameters).reduce((acc, param) => {
          const paramValue = parameters[param];
          return {
            ...acc,
            [param]: PCore.getAnnotationUtils().isProperty(paramValue) ? content[PCore.getAnnotationUtils().getPropertyName(paramValue)] : paramValue
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

    if (isData && this.dataViewName && this.payload) {
      this.linkURL = PCore.getSemanticUrlUtils().getResolvedSemanticURL(
        ACTION_SHOWDATA,
        { pageName: 'pyDetails', dataViewName: this.dataViewName },
        {
          ...this.payload
        }
      );
    } else {
      // BUG-678282 fix to handle scenario when workID was not populated.
      // Check renderParentLink in Caseview / CasePreview. comment from constellation
      const isObjectType = (PCore.getCaseUtils() as any).isObjectCaseType(this.resourcePayload.caseClassName);
      resourceParams[isObjectType ? 'objectID' : 'workID'] =
        resourceParams.workID === '' && typeof this.previewKey === 'string' ? this.previewKey.split(' ')[1] : resourceParams.workID;
      if (this.previewKey) {
        resourceParams.id = this.previewKey;
      }

      this.linkURL = PCore.getSemanticUrlUtils().getResolvedSemanticURL(
        isObjectType ? ACTION_GETOBJECT : ACTION_OPENWORKBYHANDLE,
        this.resourcePayload,
        resourceParams
      );
    }
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
}
