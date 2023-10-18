import { Component, Input, SimpleChanges, forwardRef } from '@angular/core';
import { Utils } from '../../../_helpers/utils';
import { CommonModule } from '@angular/common';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

declare const PCore: any;

@Component({
  selector: 'lib-quick-create',
  templateUrl: './quick-create.component.html',
  styleUrls: ['./quick-create.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class QuickCreateComponent {
  @Input() pConn$: any;
  @Input() formGroup$: any;

  configProps$: Object;
  arChildren$: Array<any>;
  heading$: string;
  showCaseIcons$: boolean;
  classFilter$: any;
  cases$: any = [];

  constructor(private utils: Utils) {}

  createCase(className) {
    this.pConn$
      .getActionsApi()
      .createWork(className, {})
      .catch((error) => {
        console.log('Error in case creation: ', error?.message);
      });
  }

  initComponent() {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());

    this.heading$ = this.configProps$['heading'];
    this.showCaseIcons$ = this.configProps$['showCaseIcons'];
    this.classFilter$ = this.configProps$['classFilter'];

    const envInfo = PCore.getEnvironmentInfo();
    if (
      this.classFilter$ &&
      envInfo.environmentInfoObject &&
      envInfo.environmentInfoObject.pyCaseTypeList &&
      envInfo.environmentInfoObject.pyCaseTypeList.length > 0
    ) {
      this.classFilter$.forEach((item) => {
        let icon = this.utils.getImageSrc('polaris-solid', this.utils.getSDKStaticContentUrl());
        let label = '';
        envInfo.environmentInfoObject.pyCaseTypeList.forEach((casetype) => {
          if (casetype.pyWorkTypeImplementationClassName === item) {
            icon = casetype.pxIcon && this.utils.getImageSrc(casetype?.pxIcon, this.utils.getSDKStaticContentUrl());
            label = casetype.pyWorkTypeName ?? '';
          }
        });
        if (label !== '') {
          this.cases$.push({
            label,
            onClick: () => {
              this.createCase(item);
            },
            ...(this.showCaseIcons$ && { icon })
          });
        }
      });
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
