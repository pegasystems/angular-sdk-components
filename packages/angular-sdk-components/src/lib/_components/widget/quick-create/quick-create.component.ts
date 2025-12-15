import { Component, Input, OnChanges, OnInit, SimpleChanges, forwardRef } from '@angular/core';
import { Utils } from '../../../_helpers/utils';
import { CommonModule } from '@angular/common';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

interface QuickCreateProps {
  // If any, enter additional props that only exist on this component
  heading?: string;
  showCaseIcons?: boolean;
  classFilter?: any;
}

@Component({
  selector: 'app-quick-create',
  templateUrl: './quick-create.component.html',
  styleUrls: ['./quick-create.component.scss'],
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class QuickCreateComponent implements OnInit, OnChanges {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: any;

  configProps$: QuickCreateProps;
  arChildren$: any[];
  heading$?: string;
  showCaseIcons$?: boolean;
  classFilter$: any;
  cases$: any = [];

  constructor(private utils: Utils) {}

  createCase(className) {
    this.pConn$
      .getActionsApi()
      .createWork(className, {} as any)
      .catch(error => {
        console.log('Error in case creation: ', error?.message);
      });
  }

  initComponent() {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as QuickCreateProps;
    this.heading$ = this.configProps$.heading;
    this.showCaseIcons$ = this.configProps$.showCaseIcons;
    this.classFilter$ = this.configProps$.classFilter;
    const cases: any = [];
    const defaultCases: any = [];
    const envInfo = PCore.getEnvironmentInfo();
    if (envInfo?.environmentInfoObject?.pyCaseTypeList) {
      envInfo.environmentInfoObject.pyCaseTypeList.forEach((casetype: any) => {
        if (casetype.pyWorkTypeName && casetype.pyWorkTypeImplementationClassName) {
          defaultCases.push({
            classname: casetype.pyWorkTypeImplementationClassName,
            onClick: () => {
              this.createCase(casetype.pyWorkTypeImplementationClassName);
            },
            ...(this.showCaseIcons$ && { icon: this.utils.getImageSrc(casetype?.pxIcon, this.utils.getSDKStaticContentUrl()) }),
            label: casetype.pyWorkTypeName
          });
        }
      });
    } else {
      const pConnectInAppContext = PCore.createPConnect({
        options: { context: PCore.getConstants().APP.APP }
      }).getPConnect();
      const pyPortalInAppContext = pConnectInAppContext.getValue('pyPortal') as any;
      pyPortalInAppContext?.pyCaseTypesAvailableToCreate?.forEach(casetype => {
        if (casetype.pyClassName && casetype.pyLabel) {
          defaultCases.push({
            classname: casetype.pyClassName,
            onClick: () => {
              this.createCase(casetype.pyClassName);
            },
            ...(this.showCaseIcons$ && { icon: this.utils.getImageSrc(casetype?.pxIcon, this.utils.getSDKStaticContentUrl()) }),
            label: casetype.pyLabel
          });
        }
      });
    }

    /* If classFilter is not empty - filter from the list of defaultCases */
    if (this.classFilter$?.length > 0) {
      this.classFilter$.forEach(item => {
        defaultCases.forEach(casetype => {
          if (casetype.classname === item) {
            cases.push(casetype);
          }
        });
      });
      this.cases$ = cases;
    } else {
      this.cases$ = defaultCases;
    }
  }

  ngOnInit() {
    // console.log(`ngOnInit (no registerAndSubscribe!): Region`);
    // this.updateSelf();

    this.initComponent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { pConn$ } = changes;

    if (pConn$.previousValue && pConn$.previousValue !== pConn$.currentValue) {
      this.updateSelf();
    }
  }

  updateSelf() {
    this.initComponent();
  }
}
