import { forwardRef } from '@angular/core';
import { AutoCompleteComponent } from './app/_components/field/auto-complete/auto-complete.component';
import { CancelAlertComponent } from './app/_components/field/cancel-alert/cancel-alert.component';
import { CheckBoxComponent } from './app/_components/field/check-box/check-box.component';
import { CurrencyComponent } from './app/_components/field/currency/currency.component';
import { DateTimeComponent } from './app/_components/field/date-time/date-time.component';
import { DateComponent } from './app/_components/field/date/date.component';
import { DecimalComponent } from './app/_components/field/decimal/decimal.component';
import { DropdownComponent } from './app/_components/field/dropdown/dropdown.component';
import { EmailComponent } from './app/_components/field/email/email.component';
import { IntegerComponent } from './app/_components/field/integer/integer.component';
import { PercentageComponent } from './app/_components/field/percentage/percentage.component';
import { PhoneComponent } from './app/_components/field/phone/phone.component';
import { RadioButtonsComponent } from './app/_components/field/radio-buttons/radio-buttons.component';
import { SemanticLinkComponent } from './app/_components/field/semantic-link/semantic-link.component';
import { TextAreaComponent } from './app/_components/field/text-area/text-area.component';
import { TextComponent } from './app/_components/field/text/text.component';
import { TextContentComponent } from './app/_components/field/text-content/text-content.component';
import { TextInputComponent } from './app/_components/field/text-input/text-input.component';
import { ThreeColumnComponent } from './app/_components/template/three-column/three-column.component';
import { ThreeColumnPageComponent } from './app/_components/template/three-column-page/three-column-page.component';
import { TimeComponent } from './app/_components/field/time/time.component';
import { UrlComponent } from './app/_components/field/url/url.component';
import { UserReferenceComponent } from './app/_components/field/user-reference/user-reference.component';
import { FlowContainerComponent } from './app/_components/infra/Containers/flow-container/flow-container.component';
import { ModalViewContainerComponent } from './app/_components/infra/Containers/modal-view-container/modal-view-container.component';
import { ViewContainerComponent } from './app/_components/infra/Containers/view-container/view-container.component';
import { ActionButtonsComponent } from './app/_components/infra/action-buttons/action-buttons.component';
import { AssignmentCardComponent } from './app/_components/infra/assignment-card/assignment-card.component';
import { AssignmentComponent } from './app/_components/infra/assignment/assignment.component';
import { DeferLoadComponent } from './app/_components/infra/defer-load/defer-load.component';
import { ErrorBoundaryComponent } from './app/_components/infra/error-boundary/error-boundary.component';
import { MultiStepComponent } from './app/_components/infra/multi-step/multi-step.component';
import { NavbarComponent } from './app/_components/infra/navbar/navbar.component';
import { ReferenceComponent } from './app/_components/infra/reference/reference.component';
import { RegionComponent } from './app/_components/infra/region/region.component';
import { RootContainerComponent } from './app/_components/infra/root-container/root-container.component';
import { StagesComponent } from './app/_components/infra/stages/stages.component';
import { SubTabsComponent } from './app/_components/template/sub-tabs/sub-tabs.component';
import { ViewComponent } from './app/_components/infra/view/view.component';
import { AppShellComponent } from './app/_components/template/app-shell/app-shell.component';
import { CaseSummaryComponent } from './app/_components/template/case-summary/case-summary.component';
import { CaseViewComponent } from './app/_components/template/case-view/case-view.component';
import { ConfirmationComponent } from './app/_components/template/confirmation/confirmation.component';
import { DataReferenceComponent } from './app/_components/template/data-reference/data-reference.component';
import { DefaultFormComponent } from './app/_components/template/default-form/default-form.component';
import { DetailsComponent } from './app/_components/template/details/details.component';
import { DetailsNarrowWideComponent } from './app/_components/template/details-narrow-wide/details-narrow-wide.component';
import { DetailsOneColumnComponent } from './app/_components/template/details-one-column/details-one-column.component';
import { DetailsThreeColumnComponent } from './app/_components/template/details-three-column/details-three-column.component';
import { DetailsTwoColumnComponent } from './app/_components/template/details-two-column/details-two-column.component';
import { DetailsWideNarrowComponent } from './app/_components/template/details-wide-narrow/details-wide-narrow.component';
import { DetailsSubTabsComponent } from './app/_components/template/details-sub-tabs/details-sub-tabs.component';
import { FieldGroupListComponent } from './app/_components/template/field-group-list/field-group-list.component';
import { FieldGroupTemplateComponent } from './app/_components/template/field-group-template/field-group-template.component';
import { FieldValueListComponent } from './app/_components/template/field-value-list/field-value-list.component';
import { ListPageComponent } from './app/_components/template/list-page/list-page.component';
import { ListViewComponent } from './app/_components/template/list-view/list-view.component';
import { MultiReferenceReadonlyComponent } from './app/_components/template/multi-reference-readonly/multi-reference-readonly.component';
import { NarrowWideFormComponent } from './app/_components/template/narrow-wide-form/narrow-wide-form.component';
import { OneColumnPageComponent } from './app/_components/template/one-column-page/one-column-page.component';
import { OneColumnTabComponent } from './app/_components/template/one-column-tab/one-column-tab.component';
import { OneColumnComponent } from './app/_components/template/one-column/one-column.component';
import { PageComponent } from './app/_components/template/page/page.component';
import { PromotedFiltersComponent } from './app/_components/template/promoted-filters/promoted-filters.component';
import { SimpleTableManualComponent } from './app/_components/template/simple-table-manual/simple-table-manual.component';
import { SimpleTableSelectComponent } from './app/_components/template/simple-table-select/simple-table-select.component';
import { SimpleTableComponent } from './app/_components/template/simple-table/simple-table.component';
import { SingleReferenceReadonlyComponent } from './app/_components/template/single-reference-readonly/single-reference-readonly.component';
import { TwoColumnPageComponent } from './app/_components/template/two-column-page/two-column-page.component';
import { TwoColumnComponent } from './app/_components/template/two-column/two-column.component';
import { TwoColumnTabComponent } from './app/_components/template/two-column-tab/two-column-tab.component';
import { WideNarrowFormComponent } from './app/_components/template/wide-narrow-form/wide-narrow-form.component';
import { WideNarrowPageComponent } from './app/_components/template/wide-narrow-page/wide-narrow-page.component';
import { AppAnnouncementComponent } from './app/_components/widget/app-announcement/app-announcement.component';
import { AttachmentComponent } from './app/_components/widget/attachment/attachment.component';
import { CaseHistoryComponent } from './app/_components/widget/case-history/case-history.component';
import { FileUtilityComponent } from './app/_components/widget/file-utility/file-utility.component';
import { TodoComponent } from './app/_components/widget/todo/todo.component';
import { MaterialCaseSummaryComponent } from './app/_components/designSystemExtension/material-case-summary/material-case-summary.component';
import { MaterialDetailsFieldsComponent } from './app/_components/designSystemExtension/material-details-fields/material-details-fields.component';
import { MaterialSummaryItemComponent } from './app/_components/designSystemExtension/material-summary-item/material-summary-item.component';
import { MaterialSummaryListComponent } from './app/_components/designSystemExtension/material-summary-list/material-summary-list.component';
import { MaterialVerticalTabsComponent } from './app/_components/designSystemExtension/material-vertical-tabs/material-vertical-tabs.component';
import { OperatorComponent } from './app/_components/designSystemExtension/operator/operator.component';
import { PulseComponent } from './app/_components/designSystemExtension/pulse/pulse.component';

// pegaSdkComponentMap is the JSON object where we'll store the components that are
// the default implementations provided by the SDK. These will be used if there isn't
// an entry in the localSdkComponentMap

// NOTE: A few components have non-standard capitalization:
//  'reference' is what's in the metadata, not Reference
//  'Todo' is what's in the metadata, not ToDo
//  Also, note that "Checkbox" component is named/exported as CheckboxComponent

const pegaSdkComponentMap = {
  ActionButtons: ActionButtonsComponent,
  //   'ActionButtonsForFileUtil': ActionButtonsForFileUtil,
  AppAnnouncement: AppAnnouncementComponent,
  AppShell: AppShellComponent,
  Assignment: AssignmentComponent,
  AssignmentCard: AssignmentCardComponent,
  Attachment: AttachmentComponent,
  AutoComplete: AutoCompleteComponent,
  //   'Banner': Banner,
  //   'BannerPage': BannerPage,
  CancelAlert: CancelAlertComponent,
  CaseHistory: CaseHistoryComponent,
  CaseSummary: CaseSummaryComponent,
  CaseSummaryFields: MaterialCaseSummaryComponent,
  CaseView: CaseViewComponent,
  //   'CaseViewActionsMenu': CaseViewActionsMenu,
  Checkbox: CheckBoxComponent,
  Confirmation: ConfirmationComponent,
  Currency: CurrencyComponent,
  //   'DashboardFilter': DashboardFilter,
  DataReference: DataReferenceComponent,
  Date: DateComponent,
  DateTime: DateTimeComponent,
  Decimal: DecimalComponent,
  DefaultForm: DefaultFormComponent,
  DeferLoad: DeferLoadComponent,
  Details: DetailsComponent,
  DetailsFields: MaterialDetailsFieldsComponent,
  DetailsOneColumn: DetailsOneColumnComponent,
  DetailsSubTabs: DetailsSubTabsComponent,
  DetailsThreeColumn: DetailsThreeColumnComponent,
  DetailsTwoColumn: DetailsTwoColumnComponent,
  Dropdown: DropdownComponent,
  Email: EmailComponent,
  ErrorBoundary: ErrorBoundaryComponent,
  FieldGroupList: FieldGroupListComponent,
  FieldGroupTemplate: FieldGroupTemplateComponent,
  FieldValueList: FieldValueListComponent,
  FileUtility: FileUtilityComponent,
  FlowContainer: FlowContainerComponent,
  //   'Followers': Followers,
  //   'InlineDashboard': InlineDashboard,
  //   'InlineDashboardPage': InlineDashboardPage,
  Integer: IntegerComponent,
  //   'LeftAlignVerticalTabs': LeftAlignVerticalTabs,
  ListPage: ListPageComponent,
  ListView: ListViewComponent,
  ModalViewContainer: forwardRef(() => ModalViewContainerComponent),
  MultiReferenceReadOnly: MultiReferenceReadonlyComponent,
  MultiStep: MultiStepComponent,
  //   'NarrowWide': NarrowWideFormComponent,
  NarrowWideDetails: DetailsNarrowWideComponent,
  NarrowWideForm: NarrowWideFormComponent,
  //   'NarrowWidePage': NarrowWidePage,
  NavBar: NavbarComponent,
  OneColumn: OneColumnComponent,
  OneColumnPage: OneColumnPageComponent,
  OneColumnTab: OneColumnTabComponent,
  Operator: OperatorComponent,
  Page: PageComponent,
  Percentage: PercentageComponent,
  Phone: PhoneComponent,
  PromotedFilters: PromotedFiltersComponent,
  Pulse: PulseComponent,
  //   'QuickCreate': QuickCreate,
  reference: ReferenceComponent,
  RadioButtons: RadioButtonsComponent,
  Region: RegionComponent,
  RootContainer: RootContainerComponent,
  SemanticLink: SemanticLinkComponent,
  SimpleTable: SimpleTableComponent,
  SimpleTableManual: SimpleTableManualComponent,
  SimpleTableSelect: SimpleTableSelectComponent,
  SingleReferenceReadOnly: SingleReferenceReadonlyComponent,
  Stages: StagesComponent,
  SubTabs: SubTabsComponent,
  SummaryItem: MaterialSummaryItemComponent,
  SummaryList: MaterialSummaryListComponent,
  Text: TextComponent,
  TextArea: TextAreaComponent,
  TextContent: TextContentComponent,
  TextInput: TextInputComponent,
  ThreeColumn: ThreeColumnComponent,
  ThreeColumnPage: ThreeColumnPageComponent,
  Time: TimeComponent,
  Todo: TodoComponent,
  TwoColumn: TwoColumnComponent,
  TwoColumnPage: TwoColumnPageComponent,
  TwoColumnTab: TwoColumnTabComponent,
  URL: UrlComponent,
  UserReference: UserReferenceComponent,
  VerticalTabs: MaterialVerticalTabsComponent,
  View: ViewComponent,
  ViewContainer: ViewContainerComponent,
  //   'WideNarrow': WideNarrow,
  WideNarrowDetails: DetailsWideNarrowComponent,
  WideNarrowForm: WideNarrowFormComponent,
  WideNarrowPage: WideNarrowPageComponent
  //   'WssNavBar': WssNavBar,
  //   'WssQuickcreate': WssQuickCreate,
};

export default pegaSdkComponentMap;
