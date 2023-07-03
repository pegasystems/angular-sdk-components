import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';
import { getAllFields } from '../../template/utils';
import { ReferenceComponent } from '../Reference/reference.component';
import { AppShellComponent } from '../../template/AppShell/app-shell.component';
import { FeedContainerComponent } from '../../widget/feed-container/feed-container.component';
import { StagesComponent } from '../Stages/stages.component';
import { PageComponent } from '../../template/Page/page.component';
import { ViewContainerComponent } from '../Containers/ViewContainer/view-container.component';
import { RegionComponent } from '../Region/region.component';
import { FlowContainerComponent } from '../Containers/FlowContainer/flow-container.component';
import { DataReferenceComponent } from '../../template/DataReference/data-reference.component';
import { ListPageComponent } from '../../template/ListPage/list-page.component';
import { CaseViewComponent } from '../../template/CaseView/case-view.component';
import { OneColumnTabComponent } from '../../template/OneColumn/OneColumnTab/one-column-tab.component';
import { SimpleTableComponent } from '../../template/SimpleTable/SimpleTable/simple-table.component';
import { ListViewComponent } from '../../template/ListView/list-view.component';
import { DetailsThreeColumnComponent } from '../../template/Details/DetailsThreeColumn/details-three-column.component';
import { DetailsTwoColumnComponent } from '../../template/Details/DetailsTwoColumn/details-two-column.component';
import { DetailsOneColumnComponent } from '../../template/Details/DetailsOneColumn/details-one-column.component';
import { DetailsNarrowWideComponent } from '../../template/NarrowWide/NarrowWideDetails/details-narrow-wide.component';
import { DetailsWideNarrowComponent } from '../../template/WideNarrow/WideNarrowDetails/details-wide-narrow.component';
import { DetailsComponent } from '../../template/Details/Details/details.component';
import { CaseSummaryComponent } from '../../template/CaseSummary/case-summary.component';
import { ThreeColumnPageComponent } from '../../template/ThreeColumn/ThreeColumnPage/three-column-page.component';
import { ThreeColumnComponent } from '../../template/ThreeColumn/ThreeColumn/three-column.component';
import { TwoColumnPageComponent } from '../../template/TwoColumn/TwoColumnPage/two-column-page.component';
import { TwoColumnComponent } from '../../template/TwoColumn/TwoColumn/two-column.component';
import { OneColumnPageComponent } from '../../template/OneColumn/OneColumnPage/one-column-page.component';
import { OneColumnComponent } from '../../template/OneColumn/OneColumn/one-column.component';
import { WideNarrowPageComponent } from '../../template/WideNarrow/WideNarrowPage/wide-narrow-page.component';
import { WideNarrowFormComponent } from '../../template/WideNarrow/WideNarrowForm/wide-narrow-form.component';
import { NarrowWideFormComponent } from '../../template/NarrowWide/NarrowWideForm/narrow-wide-form.component';
import { DefaultFormComponent } from '../../template/DefaultForm/default-form.component';
import { ConfirmationComponent } from '../../template/Confirmation/confirmation.component';

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
  inheritedProps$: Object;
  arChildren$: Array<any>;
  templateName$: string;
  title$: string = '';
  label$: string = '';
  showLabel$: boolean = true;

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
    this.inheritedProps$ = this.pConn$.getInheritedProps();

    // NOTE: this.configProps$['visibility'] is used in view.component.ts such that
    //  the View will only be rendered when this.configProps$['visibility'] is false.
    //  It WILL render if true or undefined.

    this.templateName$ = 'template' in this.configProps$ ? (this.configProps$['template'] as string) : '';
    this.title$ = 'title' in this.configProps$ ? (this.configProps$['title'] as string) : '';
    this.label$ = 'label' in this.configProps$ ? (this.configProps$['label'] as string) : '';
    this.showLabel$ = 'showLabel' in this.configProps$ ? (this.configProps$['showLabel'] as boolean) : this.showLabel$;
    // label & showLabel within inheritedProps takes precedence over configProps
    this.label$ = 'label' in this.inheritedProps$ ? (this.inheritedProps$['label'] as string) : this.label$;
    this.showLabel$ = 'showLabel' in this.inheritedProps$ ? (this.inheritedProps$['showLabel'] as boolean) : this.showLabel$;
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
