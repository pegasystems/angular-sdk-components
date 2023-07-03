import { forwardRef } from '@angular/core';
import { AutoCompleteComponent } from './app/_components/field/AutoComplete/auto-complete.component';
import { CancelAlertComponent } from './app/_components/field/CancelAlert/cancel-alert.component';
import { CheckBoxComponent } from './app/_components/field/Checkbox/check-box.component';
import { CurrencyComponent } from './app/_components/field/Currency/currency.component';
import { DateTimeComponent } from './app/_components/field/DateTime/date-time.component';
import { DateComponent } from './app/_components/field/Date/date.component';
import { DecimalComponent } from './app/_components/field/Decimal/decimal.component';
import { DropdownComponent } from './app/_components/field/Dropdown/dropdown.component';
import { EmailComponent } from './app/_components/field/Email/email.component';
import { IntegerComponent } from './app/_components/field/Integer/integer.component';
import { PercentageComponent } from './app/_components/field/Percentage/percentage.component';
import { PhoneComponent } from './app/_components/field/Phone/phone.component';
import { RadioButtonsComponent } from './app/_components/field/RadioButtons/radio-buttons.component';
import { SemanticLinkComponent } from './app/_components/field/SemanticLink/semantic-link.component';
import { TextAreaComponent } from './app/_components/field/TextArea/text-area.component';
import { TextContentComponent } from './app/_components/field/TextContent/text-content.component';
import { TextInputComponent } from './app/_components/field/TextInput/text-input.component';
import { ThreeColumnComponent } from './app/_components/template/ThreeColumn/ThreeColumn/three-column.component';
import { ThreeColumnPageComponent } from './app/_components/template/ThreeColumn/ThreeColumnPage/three-column-page.component';
import { TimeComponent } from './app/_components/field/Time/time.component';
import { UrlComponent } from './app/_components/field/URL/url.component';
import { UserReferenceComponent } from './app/_components/field/UserReference/user-reference.component';
import { FlowContainerComponent } from './app/_components/infra/Containers/FlowContainer/flow-container.component';
import { ModalViewContainerComponent } from './app/_components/infra/Containers/ModalViewContainer/modal-view-container.component';
import { ViewContainerComponent } from './app/_components/infra/Containers/ViewContainer/view-container.component';
import { ActionButtonsComponent } from './app/_components/infra/ActionButtons/action-buttons.component';
import { AssignmentCardComponent } from './app/_components/infra/AssignmentCard/assignment-card.component';
import { AssignmentComponent } from './app/_components/infra/Assignment/assignment.component';
import { DeferLoadComponent } from './app/_components/infra/DeferLoad/defer-load.component';
import { MultiStepComponent } from './app/_components/infra/MultiStep/multi-step.component';
import { NavbarComponent } from './app/_components/infra/NavBar/navbar.component';
import { ReferenceComponent } from './app/_components/infra/Reference/reference.component';
import { RegionComponent } from './app/_components/infra/Region/region.component';
import { RootContainerComponent } from './app/_components/infra/RootContainer/root-container.component';
import { StagesComponent } from './app/_components/infra/Stages/stages.component';
import { ViewComponent } from './app/_components/infra/View/view.component';
import { AppShellComponent } from './app/_components/template/AppShell/app-shell.component';
import { CaseSummaryComponent } from './app/_components/template/CaseSummary/case-summary.component';
import { CaseViewComponent } from './app/_components/template/CaseView/case-view.component';
import { DataReferenceComponent } from './app/_components/template/DataReference/data-reference.component';
import { DefaultFormComponent } from './app/_components/template/DefaultForm/default-form.component';
import { DetailsThreeColumnComponent } from './app/_components/template/Details/DetailsThreeColumn/details-three-column.component';
import { DetailsTwoColumnComponent } from './app/_components/template/Details/DetailsTwoColumn/details-two-column.component';
import { DetailsComponent } from './app/_components/template/Details/Details/details.component';
import { FieldGroupTemplateComponent } from './app/_components/template/FieldGroupTemplate/field-group-template.component';
import { ListPageComponent } from './app/_components/template/ListPage/list-page.component';
import { ListViewComponent } from './app/_components/template/ListView/list-view.component';
import { MultiReferenceReadonlyComponent } from './app/_components/template/MultiReferenceReadOnly/multi-reference-readonly.component';
import { NarrowWideFormComponent } from './app/_components/template/NarrowWide/NarrowWideForm/narrow-wide-form.component';
import { OneColumnPageComponent } from './app/_components/template/OneColumn/OneColumnPage/one-column-page.component';
import { OneColumnTabComponent } from './app/_components/template/OneColumn/OneColumnTab/one-column-tab.component';
import { OneColumnComponent } from './app/_components/template/OneColumn/OneColumn/one-column.component';
import { PageComponent } from './app/_components/template/Page/page.component';
import { PromotedFiltersComponent } from './app/_components/template/PromotedFilters/promoted-filters.component';
import { SimpleTableManualComponent } from './app/_components/template/SimpleTable/SimpleTableManual/simple-table-manual.component';
import { SimpleTableSelectComponent } from './app/_components/template/SimpleTable/SimpleTableSelect/simple-table-select.component';
import { SimpleTableComponent } from './app/_components/template/SimpleTable/SimpleTable/simple-table.component';
import { SingleReferenceReadonlyComponent } from './app/_components/template/SingleReferenceReadOnly/single-reference-readonly.component';
import { TwoColumnPageComponent } from './app/_components/template/TwoColumn/TwoColumnPage/two-column-page.component';
import { TwoColumnComponent } from './app/_components/template/TwoColumn/TwoColumn/two-column.component';
import { WideNarrowFormComponent } from './app/_components/template/WideNarrow/WideNarrowForm/wide-narrow-form.component';
import { WideNarrowPageComponent } from './app/_components/template/WideNarrow/WideNarrowPage/wide-narrow-page.component';
import { AppAnnouncementComponent } from './app/_components/widget/AppAnnouncement/app-announcement.component';
import { AttachmentComponent } from './app/_components/widget/Attachment/attachment.component';
import { CaseHistoryComponent } from './app/_components/widget/CaseHistory/case-history.component';
import { FileUtilityComponent } from './app/_components/widget/FileUtility/file-utility.component';
import { TodoComponent } from './app/_components/widget/ToDo/todo.component';
import { MaterialSummaryItemComponent } from './app/_components/designSystemExtension/SummaryItem/summary-item.component';
import { MaterialSummaryListComponent } from './app/_components/designSystemExtension/SummaryList/summary-list.component';
import { MaterialVerticalTabsComponent } from './app/_components/designSystemExtension/VerticalTabs/vertical-tabs.component';
import { OperatorComponent } from './app/_components/designSystemExtension/Operator/operator.component';
import { PulseComponent } from './app/_components/designSystemExtension/Pulse/pulse.component';

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
  Assignment: forwardRef(() => AssignmentComponent),
  AssignmentCard: forwardRef(() => AssignmentCardComponent),
  Attachment: AttachmentComponent,
  AutoComplete: AutoCompleteComponent,
  //   'Banner': Banner,
  //   'BannerPage': BannerPage,
  CancelAlert: CancelAlertComponent,
  CaseHistory: CaseHistoryComponent,
  CaseSummary: CaseSummaryComponent,
  //   'CaseSummaryFields': CaseSummaryFields,
  CaseView: CaseViewComponent,
  //   'CaseViewActionsMenu': CaseViewActionsMenu,
  Checkbox: CheckBoxComponent,
  //   'Confirmation': Confirmation,
  Currency: CurrencyComponent,
  //   'DashboardFilter': DashboardFilter,
  DataReference: DataReferenceComponent,
  Date: DateComponent,
  DateTime: DateTimeComponent,
  Decimal: DecimalComponent,
  DefaultForm: DefaultFormComponent,
  DeferLoad: DeferLoadComponent,
  Details: DetailsComponent,
  //   'DetailsSubTabs': DetailsSubTabs,
  DetailsThreeColumn: DetailsThreeColumnComponent,
  DetailsTwoColumn: DetailsTwoColumnComponent,
  Dropdown: DropdownComponent,
  Email: EmailComponent,
  //   'ErrorBoundary': ErrorBoundary,
  FieldGroupTemplate: FieldGroupTemplateComponent,
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
  //   'NarrowWideDetails': NarrowWideDetails,
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
  Region: forwardRef(() => RegionComponent),
  RootContainer: forwardRef(() => RootContainerComponent),
  SemanticLink: SemanticLinkComponent,
  SimpleTable: SimpleTableComponent,
  SimpleTableManual: SimpleTableManualComponent,
  SimpleTableSelect: SimpleTableSelectComponent,
  SingleReferenceReadOnly: SingleReferenceReadonlyComponent,
  Stages: StagesComponent,
  //   'SubTabs': SubTabs,
  SummaryItem: MaterialSummaryItemComponent,
  SummaryList: MaterialSummaryListComponent,
  TextArea: TextAreaComponent,
  TextContent: TextContentComponent,
  TextInput: TextInputComponent,
  ThreeColumn: ThreeColumnComponent,
  ThreeColumnPage: ThreeColumnPageComponent,
  Time: TimeComponent,
  Todo: TodoComponent,
  TwoColumn: TwoColumnComponent,
  TwoColumnPage: TwoColumnPageComponent,
  //   'TwoColumnTab': TwoColumnTab,
  URL: UrlComponent,
  UserReference: UserReferenceComponent,
  VerticalTabs: MaterialVerticalTabsComponent,
  View: ViewComponent,
  ViewContainer: ViewContainerComponent,
  //   'WideNarrow': WideNarrow,
  //   'WideNarrowDetails': WideNarrowDetails,
  WideNarrowForm: WideNarrowFormComponent,
  WideNarrowPage: WideNarrowPageComponent
  //   'WssNavBar': WssNavBar,
  //   'WssQuickcreate': WssQuickCreate
};

export default pegaSdkComponentMap;
