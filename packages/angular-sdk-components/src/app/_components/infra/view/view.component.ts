import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';
import { getAllFields } from '../../template/utils';
import { ReferenceComponent } from '../reference/reference.component';
import { AppShellComponent } from '../../template/app-shell/app-shell.component';
import { FeedContainerComponent } from '../../widget/feed-container/feed-container.component';
import { StagesComponent } from '../stages/stages.component';
import { PageComponent } from '../../template/page/page.component';
import { ViewContainerComponent } from '../Containers/view-container/view-container.component';
import { RegionComponent } from '../region/region.component';
import { FlowContainerComponent } from '../Containers/flow-container/flow-container.component';
import { DataReferenceComponent } from '../../template/data-reference/data-reference.component';
import { ListPageComponent } from '../../template/list-page/list-page.component';
import { CaseViewComponent } from '../../template/case-view/case-view.component';
import { OneColumnTabComponent } from '../../template/one-column-tab/one-column-tab.component';
import { SimpleTableComponent } from '../../template/simple-table/simple-table.component';
import { ListViewComponent } from '../../template/list-view/list-view.component';
import { DetailsThreeColumnComponent } from '../../template/details-three-column/details-three-column.component';
import { DetailsTwoColumnComponent } from '../../template/details-two-column/details-two-column.component';
import { DetailsOneColumnComponent } from '../../template/details-one-column/details-one-column.component';
import { DetailsNarrowWideComponent } from '../../template/details-narrow-wide/details-narrow-wide.component';
import { DetailsWideNarrowComponent } from '../../template/details-wide-narrow/details-wide-narrow.component';
import { DetailsComponent } from '../../template/details/details.component';
import { CaseSummaryComponent } from '../../template/case-summary/case-summary.component';
import { ThreeColumnPageComponent } from '../../template/three-column-page/three-column-page.component';
import { ThreeColumnComponent } from '../../template/three-column/three-column.component';
import { TwoColumnPageComponent } from '../../template/two-column-page/two-column-page.component';
import { TwoColumnComponent } from '../../template/two-column/two-column.component';
import { OneColumnPageComponent } from '../../template/one-column-page/one-column-page.component';
import { OneColumnComponent } from '../../template/one-column/one-column.component';
import { WideNarrowPageComponent } from '../../template/wide-narrow-page/wide-narrow-page.component';
import { WideNarrowFormComponent } from '../../template/wide-narrow-form/wide-narrow-form.component';
import { NarrowWideFormComponent } from '../../template/narrow-wide-form/narrow-wide-form.component';
import { DefaultFormComponent } from '../../template/default-form/default-form.component';
import { ConfirmationComponent } from '../../template/confirmation/confirmation.component';

/**
 * WARNING:  It is not expected that this file should be modified.  It is part of infrastructure code that works with
 * Redux and creation/update of Redux containers and PConnect.  Modifying this code could have undesireable results and
 * is totally at your own risk.
 */

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DefaultFormComponent,
    NarrowWideFormComponent,
    WideNarrowFormComponent,
    WideNarrowPageComponent,
    OneColumnComponent,
    OneColumnPageComponent,
    TwoColumnComponent,
    TwoColumnPageComponent,
    ThreeColumnComponent,
    ThreeColumnPageComponent,
    CaseSummaryComponent,
    DetailsComponent,
    DetailsOneColumnComponent,
    DetailsTwoColumnComponent,
    DetailsThreeColumnComponent,
    DetailsNarrowWideComponent,
    DetailsWideNarrowComponent,
    ListViewComponent,
    SimpleTableComponent,
    OneColumnTabComponent,
    CaseViewComponent,
    ListPageComponent,
    DataReferenceComponent,
    FlowContainerComponent,
    ViewContainerComponent,
    PageComponent,
    StagesComponent,
    FeedContainerComponent,
    AppShellComponent,
    ConfirmationComponent,
    forwardRef(() => RegionComponent)
  ]
})
export class ViewComponent implements OnInit {
  @Input() pConn$: any;
  @Input() formGroup$: FormGroup;
  @Input() displayOnlyFA$: boolean;
  //@Input() updateToken$: number;

  angularPConnectData: any = {};

  configProps$: Object;
  arChildren$: Array<any>;
  templateName$: string;
  title$: string = '';

  constructor(private angularPConnect: AngularPConnectService, private utils: Utils) {}

  ngOnInit() {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);

    // Then, continue on with other initialization

    // const bUpdateSelf = this.angularPConnect.shouldComponentUpdate( this );

    // // ONLY call updateSelf when the component should update
    // if (bUpdateSelf) {
    //   this.updateSelf();
    // }
    this.checkAndUpdate();
  }

  // Callback passed when subscribing to store change
  onStateChange() {
    this.checkAndUpdate();
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

  ngOnChanges(data: any) {
    this.checkAndUpdate();
  }

  updateSelf() {
    if (this.angularPConnect.getComponentID(this) === undefined) {
      return;
    }

    //debugger;

    // normalize this.pConn$ in case it contains a 'reference'
    this.pConn$ = ReferenceComponent.normalizePConn(this.pConn$);

    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());

    // NOTE: this.configProps$['visibility'] is used in view.component.ts such that
    //  the View will only be rendered when this.configProps$['visibility'] is false.
    //  It WILL render if true or undefined.

    this.templateName$ = 'template' in this.configProps$ ? (this.configProps$['template'] as string) : '';
    this.title$ = 'title' in this.configProps$ ? (this.configProps$['title'] as string) : '';
    // children may have a 'reference' so normalize the children array
    this.arChildren$ = ReferenceComponent.normalizePConnArray(this.pConn$.getChildren());
    // was:  this.arChildren$ = this.pConn$.getChildren();

    // debug
    // let  kidList: string = "";
    // for (let i in this.arChildren$) {
    //   kidList = kidList.concat(this.arChildren$[i].getPConnect().getComponentName()).concat(",");
    // }
    //console.log("-->view update: " + this.angularPConnect.getComponentID(this) + ", template: " + this.templateName$ + ", kids: " + kidList);
  }

  // JA - adapting additionalProps from Nebula/Constellation version which uses static methods
  //    on the component classes stored in PComponents (that Angular doesn't have)...
  additionalProps(state: any, getPConnect: any) {
    let propObj = {};

    // We already have the template name in this.templateName$
    if (this.templateName$ !== '') {
      let allFields = {};

      // These uses are adapted from Nebula/Constellation CaseSummary.additionalProps
      switch (this.templateName$) {
        case 'CaseSummary':
          allFields = getAllFields(getPConnect);
          // eslint-disable-next-line no-case-declarations
          const unresFields = {
            primaryFields: allFields[0],
            secondaryFields: allFields[1]
          };
          propObj = getPConnect.resolveConfigProps(unresFields);
          break;

        case 'Details':
          allFields = getAllFields(getPConnect);
          propObj = { fields: allFields[0] };
          break;
      }
    }

    return propObj;
  }

  ngOnDestroy(): void {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }
}
