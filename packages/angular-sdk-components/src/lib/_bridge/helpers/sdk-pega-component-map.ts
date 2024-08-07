// Infra components
import { ActionButtonsComponent } from '../../_components/infra/action-buttons/action-buttons.component';
import { AssignmentCardComponent } from '../../_components/infra/assignment-card/assignment-card.component';
import { AssignmentComponent } from '../../_components/infra/assignment/assignment.component';
import { DashboardFilterComponent } from '../../_components/infra/dashboard-filter/dashboard-filter.component';
import { DeferLoadComponent } from '../../_components/infra/defer-load/defer-load.component';
import { ErrorBoundaryComponent } from '../../_components/infra/error-boundary/error-boundary.component';
import { FlowContainerComponent } from '../../_components/infra/Containers/flow-container/flow-container.component';
import { ModalViewContainerComponent } from '../../_components/infra/Containers/modal-view-container/modal-view-container.component';
import { MultiStepComponent } from '../../_components/infra/multi-step/multi-step.component';
import { NavbarComponent } from '../../_components/infra/navbar/navbar.component';
import { ReferenceComponent } from '../../_components/infra/reference/reference.component';
import { RegionComponent } from '../../_components/infra/region/region.component';
import { RootContainerComponent } from '../../_components/infra/root-container/root-container.component';
import { StagesComponent } from '../../_components/infra/stages/stages.component';
import { SubTabsComponent } from '../../_components/template/sub-tabs/sub-tabs.component';
import { ViewComponent } from '../../_components/infra/view/view.component';
import { ViewContainerComponent } from '../../_components/infra/Containers/view-container/view-container.component';

// Field components
import { AutoCompleteComponent } from '../../_components/field/auto-complete/auto-complete.component';
import { CancelAlertComponent } from '../../_components/field/cancel-alert/cancel-alert.component';
import { CheckBoxComponent } from '../../_components/field/check-box/check-box.component';
import { CurrencyComponent } from '../../_components/field/currency/currency.component';
import { DateComponent } from '../../_components/field/date/date.component';
import { DateTimeComponent } from '../../_components/field/date-time/date-time.component';
import { DecimalComponent } from '../../_components/field/decimal/decimal.component';
import { DropdownComponent } from '../../_components/field/dropdown/dropdown.component';
import { EmailComponent } from '../../_components/field/email/email.component';
import { GroupComponent } from '../../_components/field/group/group.component';
import { IntegerComponent } from '../../_components/field/integer/integer.component';
import { ListViewActionButtonsComponent } from '../../_components/field/list-view-action-buttons/list-view-action-buttons.component';
import { PercentageComponent } from '../../_components/field/percentage/percentage.component';
import { PhoneComponent } from '../../_components/field/phone/phone.component';
import { RadioButtonsComponent } from '../../_components/field/radio-buttons/radio-buttons.component';
import { SemanticLinkComponent } from '../../_components/field/semantic-link/semantic-link.component';
import { TextAreaComponent } from '../../_components/field/text-area/text-area.component';
import { TextComponent } from '../../_components/field/text/text.component';
import { TextContentComponent } from '../../_components/field/text-content/text-content.component';
import { TextInputComponent } from '../../_components/field/text-input/text-input.component';
import { TimeComponent } from '../../_components/field/time/time.component';
import { UrlComponent } from '../../_components/field/url/url.component';
import { UserReferenceComponent } from '../../_components/field/user-reference/user-reference.component';
import { ScalarListComponent } from '../../_components/field/scalar-list/scalar-list.component';
import { RichTextComponent } from '../../_components/field/rich-text/rich-text.component';

// Template components
import { AppShellComponent } from '../../_components/template/app-shell/app-shell.component';
import { BannerPageComponent } from '../../_components/template/banner-page/banner-page.component';
import { CaseSummaryComponent } from '../../_components/template/case-summary/case-summary.component';
import { CaseViewComponent } from '../../_components/template/case-view/case-view.component';
import { ConfirmationComponent } from '../../_components/template/confirmation/confirmation.component';
import { DataReferenceComponent } from '../../_components/template/data-reference/data-reference.component';
import { DefaultFormComponent } from '../../_components/template/default-form/default-form.component';
import { DetailsComponent } from '../../_components/template/details/details.component';
import { DetailsNarrowWideComponent } from '../../_components/template/details-narrow-wide/details-narrow-wide.component';
import { DetailsOneColumnComponent } from '../../_components/template/details-one-column/details-one-column.component';
import { DetailsSubTabsComponent } from '../../_components/template/details-sub-tabs/details-sub-tabs.component';
import { DetailsThreeColumnComponent } from '../../_components/template/details-three-column/details-three-column.component';
import { DetailsTwoColumnComponent } from '../../_components/template/details-two-column/details-two-column.component';
import { DetailsWideNarrowComponent } from '../../_components/template/details-wide-narrow/details-wide-narrow.component';
import { DynamicTabsComponent } from '../../_components/template/dynamic-tabs/dynamic-tabs.component';
import { FieldGroupListComponent } from '../../_components/template/field-group-list/field-group-list.component';
import { FieldGroupTemplateComponent } from '../../_components/template/field-group-template/field-group-template.component';
import { FieldValueListComponent } from '../../_components/template/field-value-list/field-value-list.component';
import { InlineDashboardComponent } from '../../_components/template/inline-dashboard/inline-dashboard.component';
import { InlineDashboardPageComponent } from '../../_components/template/inline-dashboard-page/inline-dashboard-page.component';
import { ListPageComponent } from '../../_components/template/list-page/list-page.component';
import { ListViewComponent } from '../../_components/template/list-view/list-view.component';
import { MultiReferenceReadonlyComponent } from '../../_components/template/multi-reference-readonly/multi-reference-readonly.component';
import { MultiselectComponent } from '../../_components/field/multiselect/multiselect.component';
import { NarrowWideFormComponent } from '../../_components/template/narrow-wide-form/narrow-wide-form.component';
import { OneColumnComponent } from '../../_components/template/one-column/one-column.component';
import { OneColumnPageComponent } from '../../_components/template/one-column-page/one-column-page.component';
import { OneColumnTabComponent } from '../../_components/template/one-column-tab/one-column-tab.component';
import { PageComponent } from '../../_components/template/page/page.component';
import { PromotedFiltersComponent } from '../../_components/template/promoted-filters/promoted-filters.component';
import { SimpleTableComponent } from '../../_components/template/simple-table/simple-table.component';
import { SimpleTableManualComponent } from '../../_components/template/simple-table-manual/simple-table-manual.component';
import { SimpleTableSelectComponent } from '../../_components/template/simple-table-select/simple-table-select.component';
import { SingleReferenceReadonlyComponent } from '../../_components/template/single-reference-readonly/single-reference-readonly.component';
import { ThreeColumnComponent } from '../../_components/template/three-column/three-column.component';
import { ThreeColumnPageComponent } from '../../_components/template/three-column-page/three-column-page.component';
import { TwoColumnComponent } from '../../_components/template/two-column/two-column.component';
import { TwoColumnPageComponent } from '../../_components/template/two-column-page/two-column-page.component';
import { TwoColumnTabComponent } from '../../_components/template/two-column-tab/two-column-tab.component';
import { WideNarrowFormComponent } from '../../_components/template/wide-narrow-form/wide-narrow-form.component';
import { WideNarrowPageComponent } from '../../_components/template/wide-narrow-page/wide-narrow-page.component';
import { WssNavBarComponent } from '../../_components/template/wss-nav-bar/wss-nav-bar.component';

// Widget components
import { AppAnnouncementComponent } from '../../_components/widget/app-announcement/app-announcement.component';
import { AttachmentComponent } from '../../_components/widget/attachment/attachment.component';
import { CaseHistoryComponent } from '../../_components/widget/case-history/case-history.component';
import { FileUtilityComponent } from '../../_components/widget/file-utility/file-utility.component';
import { FeedContainerComponent } from '../../_components/widget/feed-container/feed-container.component';
import { ListUtilityComponent } from '../../_components/widget/list-utility/list-utility.component';
import { QuickCreateComponent } from '../../_components/widget/quick-create/quick-create.component';
import { TodoComponent } from '../../_components/widget/todo/todo.component';

// Design System components
import { AlertBannerComponent } from '../../_components/designSystemExtension/alert-banner/alert-banner.component';
import { AlertComponent } from '../../_components/designSystemExtension/alert/alert.component';
import { BannerComponent } from '../../_components/designSystemExtension/banner/banner.component';
import { CaseCreateStageComponent } from '../../_components/designSystemExtension/case-create-stage/case-create-stage.component';
import { FieldGroupComponent } from '../../_components/designSystemExtension/field-group/field-group.component';
import { MaterialCaseSummaryComponent } from '../../_components/designSystemExtension/material-case-summary/material-case-summary.component';
import { MaterialDetailsComponent } from '../../_components/designSystemExtension/material-details/material-details.component';
import { MaterialDetailsFieldsComponent } from '../../_components/designSystemExtension/material-details-fields/material-details-fields.component';
import { MaterialSummaryItemComponent } from '../../_components/designSystemExtension/material-summary-item/material-summary-item.component';
import { MaterialSummaryListComponent } from '../../_components/designSystemExtension/material-summary-list/material-summary-list.component';
import { MaterialUtilityComponent } from '../../_components/designSystemExtension/material-utility/material-utility.component';
import { MaterialVerticalTabsComponent } from '../../_components/designSystemExtension/material-vertical-tabs/material-vertical-tabs.component';
import { OperatorComponent } from '../../_components/designSystemExtension/operator/operator.component';
import { PulseComponent } from '../../_components/designSystemExtension/pulse/pulse.component';
import { RichTextEditorComponent } from '../../_components/designSystemExtension/rich-text-editor/rich-text-editor.component';
import { WssQuickCreateComponent } from '../../_components/designSystemExtension/wss-quick-create/wss-quick-create.component';

// pegaSdkComponentMap is the JSON object where we'll store the components that are
// the default implementations provided by the SDK. These will be used if there isn't
// an entry in the localSdkComponentMap

// NOTE: A few components have non-standard capitalization:
//  'reference' is what's in the metadata, not Reference
//  'Todo' is what's in the metadata, not ToDo
//  Also, note that "Checkbox" component is named/exported as CheckboxComponent

const pegaSdkComponentMap = {
  ActionButtons: ActionButtonsComponent,
  Alert: AlertComponent,
  AlertBanner: AlertBannerComponent,
  //   'ActionButtonsForFileUtil': ActionButtonsForFileUtil,
  AppAnnouncement: AppAnnouncementComponent,
  AppShell: AppShellComponent,
  Assignment: AssignmentComponent,
  AssignmentCard: AssignmentCardComponent,
  Attachment: AttachmentComponent,
  AutoComplete: AutoCompleteComponent,
  Banner: BannerComponent,
  BannerPage: BannerPageComponent,
  CancelAlert: CancelAlertComponent,
  CaseCreateStage: CaseCreateStageComponent,
  CaseHistory: CaseHistoryComponent,
  CaseSummary: CaseSummaryComponent,
  CaseSummaryFields: MaterialCaseSummaryComponent,
  CaseView: CaseViewComponent,
  //   'CaseViewActionsMenu': CaseViewActionsMenu,
  Checkbox: CheckBoxComponent,
  Confirmation: ConfirmationComponent,
  Currency: CurrencyComponent,
  DashboardFilter: DashboardFilterComponent,
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
  DynamicTabs: DynamicTabsComponent,
  Email: EmailComponent,
  ErrorBoundary: ErrorBoundaryComponent,
  FeedContainer: FeedContainerComponent,
  FieldGroup: FieldGroupComponent,
  FieldGroupList: FieldGroupListComponent,
  FieldGroupTemplate: FieldGroupTemplateComponent,
  FieldValueList: FieldValueListComponent,
  FileUtility: FileUtilityComponent,
  FlowContainer: FlowContainerComponent,
  Group: GroupComponent,
  //   'Followers': Followers,
  InlineDashboard: InlineDashboardComponent,
  InlineDashboardPage: InlineDashboardPageComponent,
  Integer: IntegerComponent,
  //   'LeftAlignVerticalTabs': LeftAlignVerticalTabs,
  ListPage: ListPageComponent,
  ListUtility: ListUtilityComponent,
  ListView: ListViewComponent,
  ListViewActionButtons: ListViewActionButtonsComponent,
  MaterialDetails: MaterialDetailsComponent,
  MaterialUtility: MaterialUtilityComponent,
  ModalViewContainer: ModalViewContainerComponent,
  MultiReferenceReadOnly: MultiReferenceReadonlyComponent,
  Multiselect: MultiselectComponent,
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
  QuickCreate: QuickCreateComponent,
  reference: ReferenceComponent,
  RadioButtons: RadioButtonsComponent,
  Region: RegionComponent,
  RichText: RichTextComponent,
  RichTextEditor: RichTextEditorComponent,
  RootContainer: RootContainerComponent,
  ScalarList: ScalarListComponent,
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
  WideNarrowPage: WideNarrowPageComponent,
  WssNavBar: WssNavBarComponent,
  WssQuickCreate: WssQuickCreateComponent
};

export default pegaSdkComponentMap;
