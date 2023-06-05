import { NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LayoutModule } from '@angular/cdk/layout';
import { NgxMatIntlTelInputComponent } from 'ngx-mat-intl-tel-input';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from './_services/auth.service';
import { ServerConfigService } from './_services/server-config.service';

import { BundleSwatchComponent } from './_samples/mashup/bundle-swatch/bundle-swatch.component';
import { MCMainContentComponent } from './_samples/mashup/mc-main-content/mc-main-content.component';
import { MCNavComponent } from './_samples/mashup/mc-nav/mc-nav.component';
import { MainContentComponent } from './_samples/simple-portal/main-content/main-content.component';
import { MainScreenComponent } from './_samples/mashup/main-screen/main-screen.component';
import { NavigationComponent } from './_samples/simple-portal/navigation/navigation.component';
import { ResolutionScreenComponent } from './_samples/mashup/resolution-screen/resolution-screen.component';
import { SideBarComponent } from './_samples/simple-portal/side-bar/side-bar.component';
import { TopAppMashupComponent } from './_samples/full-portal/top-app-mashup/top-app-mashup.component';

import { ActionButtonsComponent } from './_components/infra/action-buttons/action-buttons.component';
import { AppAnnouncementComponent } from './_components/widget/app-announcement/app-announcement.component';
import { AppShellComponent } from './_components/template/app-shell/app-shell.component';
import { AssignmentCardComponent } from './_components/infra/assignment-card/assignment-card.component';
import { AssignmentComponent } from './_components/infra/assignment/assignment.component';
import { AttachmentComponent } from './_components/widget/attachment/attachment.component';
import { AutoCompleteComponent } from './_components/field/auto-complete/auto-complete.component';
import { CancelAlertComponent } from './_components/field/cancel-alert/cancel-alert.component';
import { CaseCreateStageComponent } from './_components/designSystemExtension/case-create-stage/case-create-stage.component';
import { CaseHistoryComponent } from './_components/widget/case-history/case-history.component';
import { CaseSummaryComponent } from './_components/template/case-summary/case-summary.component';
import { CaseViewComponent } from './_components/template/case-view/case-view.component';
import { CheckBoxComponent } from './_components/field/check-box/check-box.component';
import { CurrencyComponent } from './_components/field/currency/currency.component';
import { DataReferenceComponent } from './_components/template/data-reference/data-reference.component';
import { DateComponent } from './_components/field/date/date.component';
import { DateTimeComponent } from './_components/field/date-time/date-time.component';
import { DecimalComponent } from './_components/field/decimal/decimal.component';
import { DefaultFormComponent } from './_components/template/default-form/default-form.component';
import { DeferLoadComponent } from './_components/infra/defer-load/defer-load.component';
import { DetailsComponent } from './_components/template/details/details.component';
import { DetailsOneColumnComponent } from './_components/template/details-one-column/details-one-column.component';
import { DetailsThreeColumnComponent } from './_components/template/details-three-column/details-three-column.component';
import { DetailsTwoColumnComponent } from './_components/template/details-two-column/details-two-column.component';
import { DropdownComponent } from './_components/field/dropdown/dropdown.component';
import { EmailComponent } from './_components/field/email/email.component';
import { FeedContainerComponent } from './_components/widget/feed-container/feed-container.component';
import { FieldGroupListComponent } from './_components/template/field-group-list/field-group-list.component';
import { FieldGroupTemplateComponent } from './_components/template/field-group-template/field-group-template.component';
import { FileUtilityComponent } from './_components/widget/file-utility/file-utility.component';
import { FlowContainerComponent } from './_components/infra/Containers/flow-container/flow-container.component';
import { HybridViewContainerComponent } from './_components/infra/Containers/hybrid-view-container/hybrid-view-container.component';
import { IntegerComponent } from './_components/field/integer/integer.component';
import { ListPageComponent } from './_components/template/list-page/list-page.component';
import { ListUtilityComponent } from './_components/widget/list-utility/list-utility.component';
import { ListViewComponent } from './_components/template/list-view/list-view.component';
import { ModalViewContainerComponent } from './_components/infra/Containers/modal-view-container/modal-view-container.component';
import { MultiReferenceReadonlyComponent } from './_components/template/multi-reference-readonly/multi-reference-readonly.component';
import { MultiStepComponent } from './_components/infra/multi-step/multi-step.component';
import { NarrowWideFormComponent } from './_components/template/narrow-wide-form/narrow-wide-form.component';
import { NavbarComponent } from './_components/infra/navbar/navbar.component';
import { OneColumnComponent } from './_components/template/one-column/one-column.component';
import { OneColumnPageComponent } from './_components/template/one-column-page/one-column-page.component';
import { OneColumnTabComponent } from './_components/template/one-column-tab/one-column-tab.component';
import { OperatorComponent } from './_components/designSystemExtension/operator/operator.component';
import { PageComponent } from './_components/template/page/page.component';
import { PercentageComponent } from './_components/field/percentage/percentage.component';
import { PhoneComponent } from './_components/field/phone/phone.component';
import { PreviewViewContainerComponent } from './_components/infra/Containers/preview-view-container/preview-view-container.component';
import { PromotedFiltersComponent } from './_components/template/promoted-filters/promoted-filters.component';
import { PulseComponent } from './_components/designSystemExtension/pulse/pulse.component';
import { RadioButtonsComponent } from './_components/field/radio-buttons/radio-buttons.component';
import { ReferenceComponent } from './_components/infra/reference/reference.component';
import { RegionComponent } from './_components/infra/region/region.component';
import { RepeatingStructuresComponent } from './_components/template/repeating-structures/repeating-structures.component';
import { RootContainerComponent } from './_components/infra/root-container/root-container.component';
import { SemanticLinkComponent } from './_components/field/semantic-link/semantic-link.component';
import { SimpleTableComponent } from './_components/template/simple-table/simple-table.component';
import { SimpleTableManualComponent } from './_components/template/simple-table-manual/simple-table-manual.component';
import { SimpleTableSelectComponent } from './_components/template/simple-table-select/simple-table-select.component';
import { SingleReferenceReadonlyComponent } from './_components/template/single-reference-readonly/single-reference-readonly.component';
import { StagesComponent } from './_components/infra/stages/stages.component';
import { TextAreaComponent } from './_components/field/text-area/text-area.component';
import { TextComponent } from './_components/field/text/text.component';
import { TextContentComponent } from './_components/field/text-content/text-content.component';
import { TextInputComponent } from './_components/field/text-input/text-input.component';
import { ThreeColumnComponent } from './_components/template/three-column/three-column.component';
import { ThreeColumnPageComponent } from './_components/template/three-column-page/three-column-page.component';
import { TimeComponent } from './_components/field/time/time.component';
import { TodoComponent } from './_components/widget/todo/todo.component';
import { TopAppComponent } from './_components/designSystemExtension/top-app/top-app.component';
import { TwoColumnComponent } from './_components/template/two-column/two-column.component';
import { TwoColumnPageComponent } from './_components/template/two-column-page/two-column-page.component';
import { UrlComponent } from './_components/field/url/url.component';
import { UserReferenceComponent } from './_components/field/user-reference/user-reference.component';
import { UtilityComponent } from './_components/widget/utility/utility.component';
import { ViewComponent } from './_components/infra/view/view.component';
import { ViewContainerComponent } from './_components/infra/Containers/view-container/view-container.component';
import { WideNarrowFormComponent } from './_components/template/wide-narrow-form/wide-narrow-form.component';
import { WideNarrowPageComponent } from './_components/template/wide-narrow-page/wide-narrow-page.component';

import { MaterialCaseSummaryComponent } from './_components/designSystemExtension/material-case-summary/material-case-summary.component';
import { MaterialDetailsComponent } from './_components/designSystemExtension/material-details/material-details.component';
import { MaterialSummaryItemComponent } from './_components/designSystemExtension//material-summary-item/material-summary-item.component';
import { MaterialSummaryListComponent } from './_components/designSystemExtension//material-summary-list/material-summary-list.component';
import { MaterialUtilityComponent } from './_components/designSystemExtension//material-utility/material-utility.component';
import { MaterialVerticalTabsComponent } from './_components/designSystemExtension//material-vertical-tabs/material-vertical-tabs.component';

import { FieldGroupUtils } from './_helpers/field-group-utils';
import { Utils } from './_helpers/utils';

@NgModule({
  declarations: [
    AppComponent,
    TopAppComponent,
    AppShellComponent,
    ViewContainerComponent,
    ViewComponent,
    PageComponent,
    TwoColumnComponent,
    RegionComponent,
    PulseComponent,
    TodoComponent,
    FlowContainerComponent,
    NavbarComponent,
    CaseViewComponent,
    CaseSummaryComponent,
    UtilityComponent,
    MaterialCaseSummaryComponent,
    MaterialUtilityComponent,
    StagesComponent,
    OneColumnComponent,
    TextInputComponent,
    TextAreaComponent,
    CheckBoxComponent,
    RepeatingStructuresComponent,
    MaterialVerticalTabsComponent,
    IntegerComponent,
    DateComponent,
    EmailComponent,
    UrlComponent,
    CurrencyComponent,
    DecimalComponent,
    PhoneComponent,
    RadioButtonsComponent,
    DropdownComponent,
    DeferLoadComponent,
    FeedContainerComponent,
    AutoCompleteComponent,
    TextComponent,
    TextContentComponent,
    ActionButtonsComponent,
    AssignmentCardComponent,
    MultiStepComponent,
    NavigationComponent,
    SideBarComponent,
    MainContentComponent,
    BundleSwatchComponent,
    MCMainContentComponent,
    MCNavComponent,
    MainScreenComponent,
    ResolutionScreenComponent,
    RootContainerComponent,
    HybridViewContainerComponent,
    PreviewViewContainerComponent,
    ModalViewContainerComponent,
    AppAnnouncementComponent,
    TwoColumnPageComponent,
    OneColumnPageComponent,
    ThreeColumnComponent,
    ThreeColumnPageComponent,
    ListPageComponent,
    ListViewComponent,
    CaseCreateStageComponent,
    AssignmentComponent,
    CancelAlertComponent,
    UserReferenceComponent,
    OperatorComponent,
    MaterialSummaryItemComponent,
    FileUtilityComponent,
    ListUtilityComponent,
    MaterialSummaryListComponent,
    AttachmentComponent,
    TopAppMashupComponent,
    DefaultFormComponent,
    DateTimeComponent,
    TimeComponent,
    DetailsComponent,
    DetailsTwoColumnComponent,
    MaterialDetailsComponent,
    DetailsOneColumnComponent,
    DetailsThreeColumnComponent,
    PercentageComponent,
    CaseHistoryComponent,
    NarrowWideFormComponent,
    WideNarrowFormComponent,
    WideNarrowPageComponent,
    SimpleTableComponent,
    ReferenceComponent,
    OneColumnTabComponent,
    DataReferenceComponent,
    SimpleTableSelectComponent,
    PromotedFiltersComponent,
    SingleReferenceReadonlyComponent,
    SemanticLinkComponent,
    MultiReferenceReadonlyComponent,
    FieldGroupTemplateComponent,
    FieldGroupListComponent,
    SimpleTableManualComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    LayoutModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    DragDropModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatTableModule,
    MatBadgeModule,
    MatPaginatorModule,
    MatRippleModule,
    MatSortModule,
    MatSelectModule,
    MatTabsModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatDialogModule,
    MatStepperModule,
    NgxMatIntlTelInputComponent,
  ],
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { floatLabel: 'auto' } },
    { provide: APP_BASE_HREF, useValue: '/' },
    Utils,
    ServerConfigService,
    AuthService,
    FieldGroupUtils,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
