/**
 * Dynamic (lazy) component loader map.
 * This allows splitting the large component set into separate chunks.
 * Each key corresponds to the logical component name used in metadata / name input.
 */

import { Type } from '@angular/core';

// Loader function type returning the concrete component class
type ComponentLoader = () => Promise<Type<any>>;

// Cache so each component is only loaded once per session.
export const componentClassCache: Record<string, Type<any>> = {};

/**
 * Map of component name -> dynamic import loader.
 * NOTE: The Right-Hand side of each mapping resolves to the exported class inside the module.
 */
export const componentLoaders: Record<string, ComponentLoader> = {
  ActionButtons: () => import('../../_components/infra/action-buttons/action-buttons.component').then(m => m.ActionButtonsComponent),
  AdvancedSearch: () => import('../../_components/template/advanced-search/advanced-search.component').then(m => m.AdvancedSearchComponent),
  Alert: () => import('../../_components/designSystemExtension/alert/alert.component').then(m => m.AlertComponent),
  AlertBanner: () => import('../../_components/designSystemExtension/alert-banner/alert-banner.component').then(m => m.AlertBannerComponent),
  AppAnnouncement: () => import('../../_components/widget/app-announcement/app-announcement.component').then(m => m.AppAnnouncementComponent),
  AppShell: () => import('../../_components/template/app-shell/app-shell.component').then(m => m.AppShellComponent),
  Assignment: () => import('../../_components/infra/assignment/assignment.component').then(m => m.AssignmentComponent),
  AssignmentCard: () => import('../../_components/infra/assignment-card/assignment-card.component').then(m => m.AssignmentCardComponent),
  Attachment: () => import('../../_components/widget/attachment/attachment.component').then(m => m.AttachmentComponent),
  AutoComplete: () => import('../../_components/field/auto-complete/auto-complete.component').then(m => m.AutoCompleteComponent),
  Banner: () => import('../../_components/designSystemExtension/banner/banner.component').then(m => m.BannerComponent),
  BannerPage: () => import('../../_components/template/banner-page/banner-page.component').then(m => m.BannerPageComponent),
  CancelAlert: () => import('../../_components/field/cancel-alert/cancel-alert.component').then(m => m.CancelAlertComponent),
  CaseCreateStage: () =>
    import('../../_components/designSystemExtension/case-create-stage/case-create-stage.component').then(m => m.CaseCreateStageComponent),
  CaseHistory: () => import('../../_components/widget/case-history/case-history.component').then(m => m.CaseHistoryComponent),
  CaseSummary: () => import('../../_components/template/case-summary/case-summary.component').then(m => m.CaseSummaryComponent),
  CaseSummaryFields: () =>
    import('../../_components/designSystemExtension/material-case-summary/material-case-summary.component').then(m => m.MaterialCaseSummaryComponent),
  CaseView: () => import('../../_components/template/case-view/case-view.component').then(m => m.CaseViewComponent),
  Checkbox: () => import('../../_components/field/check-box/check-box.component').then(m => m.CheckBoxComponent),
  Confirmation: () => import('../../_components/template/confirmation/confirmation.component').then(m => m.ConfirmationComponent),
  Currency: () => import('../../_components/field/currency/currency.component').then(m => m.CurrencyComponent),
  DashboardFilter: () => import('../../_components/infra/dashboard-filter/dashboard-filter.component').then(m => m.DashboardFilterComponent),
  DataReference: () => import('../../_components/template/data-reference/data-reference.component').then(m => m.DataReferenceComponent),
  Date: () => import('../../_components/field/date/date.component').then(m => m.DateComponent),
  DateTime: () => import('../../_components/field/date-time/date-time.component').then(m => m.DateTimeComponent),
  Decimal: () => import('../../_components/field/decimal/decimal.component').then(m => m.DecimalComponent),
  DefaultForm: () => import('../../_components/template/default-form/default-form.component').then(m => m.DefaultFormComponent),
  DeferLoad: () => import('../../_components/infra/defer-load/defer-load.component').then(m => m.DeferLoadComponent),
  Details: () => import('../../_components/template/details/details.component').then(m => m.DetailsComponent),
  DetailsFields: () =>
    import('../../_components/designSystemExtension/material-details-fields/material-details-fields.component').then(
      m => m.MaterialDetailsFieldsComponent
    ),
  DetailsNarrowWide: () =>
    import('../../_components/template/details-narrow-wide/details-narrow-wide.component').then(m => m.DetailsNarrowWideComponent),
  DetailsOneColumn: () => import('../../_components/template/details-one-column/details-one-column.component').then(m => m.DetailsOneColumnComponent),
  DetailsSubTabs: () => import('../../_components/template/details-sub-tabs/details-sub-tabs.component').then(m => m.DetailsSubTabsComponent),
  DetailsThreeColumn: () =>
    import('../../_components/template/details-three-column/details-three-column.component').then(m => m.DetailsThreeColumnComponent),
  DetailsTwoColumn: () => import('../../_components/template/details-two-column/details-two-column.component').then(m => m.DetailsTwoColumnComponent),
  DetailsWideNarrow: () =>
    import('../../_components/template/details-wide-narrow/details-wide-narrow.component').then(m => m.DetailsWideNarrowComponent),
  Dropdown: () => import('../../_components/field/dropdown/dropdown.component').then(m => m.DropdownComponent),
  DynamicTabs: () => import('../../_components/template/dynamic-tabs/dynamic-tabs.component').then(m => m.DynamicTabsComponent),
  Email: () => import('../../_components/field/email/email.component').then(m => m.EmailComponent),
  ErrorBoundary: () => import('../../_components/infra/error-boundary/error-boundary.component').then(m => m.ErrorBoundaryComponent),
  FeedContainer: () => import('../../_components/widget/feed-container/feed-container.component').then(m => m.FeedContainerComponent),
  FieldGroup: () => import('../../_components/designSystemExtension/field-group/field-group.component').then(m => m.FieldGroupComponent),
  FieldGroupList: () => import('../../_components/template/field-group-list/field-group-list.component').then(m => m.FieldGroupListComponent),
  FieldGroupTemplate: () =>
    import('../../_components/template/field-group-template/field-group-template.component').then(m => m.FieldGroupTemplateComponent),
  FieldValueList: () => import('../../_components/template/field-value-list/field-value-list.component').then(m => m.FieldValueListComponent),
  FileUtility: () => import('../../_components/widget/file-utility/file-utility.component').then(m => m.FileUtilityComponent),
  FlowContainer: () => import('../../_components/infra/Containers/flow-container/flow-container.component').then(m => m.FlowContainerComponent),
  FlowContainerBase: () =>
    import('../../_components/infra/Containers/base-components/flow-container-base.component').then(m => m.FlowContainerBaseComponent),
  Group: () => import('../../_components/field/group/group.component').then(m => m.GroupComponent),
  HybridViewContainer: () =>
    import('../../_components/infra/Containers/hybrid-view-container/hybrid-view-container.component').then(m => m.HybridViewContainerComponent),
  InlineDashboard: () => import('../../_components/template/inline-dashboard/inline-dashboard.component').then(m => m.InlineDashboardComponent),
  InlineDashboardPage: () =>
    import('../../_components/template/inline-dashboard-page/inline-dashboard-page.component').then(m => m.InlineDashboardPageComponent),
  Integer: () => import('../../_components/field/integer/integer.component').then(m => m.IntegerComponent),
  ListPage: () => import('../../_components/template/list-page/list-page.component').then(m => m.ListPageComponent),
  ListUtility: () => import('../../_components/widget/list-utility/list-utility.component').then(m => m.ListUtilityComponent),
  ListView: () => import('../../_components/template/list-view/list-view.component').then(m => m.ListViewComponent),
  ListViewActionButtons: () =>
    import('../../_components/field/list-view-action-buttons/list-view-action-buttons.component').then(m => m.ListViewActionButtonsComponent),
  Location: () => import('../../_components/field/location/location.component').then(m => m.LocationComponent),
  MaterialDetails: () =>
    import('../../_components/designSystemExtension/material-details/material-details.component').then(m => m.MaterialDetailsComponent),
  MaterialSummaryItem: () =>
    import('../../_components/designSystemExtension/material-summary-item/material-summary-item.component').then(m => m.MaterialSummaryItemComponent),
  MaterialSummaryList: () =>
    import('../../_components/designSystemExtension/material-summary-list/material-summary-list.component').then(m => m.MaterialSummaryListComponent),
  MaterialUtility: () =>
    import('../../_components/designSystemExtension/material-utility/material-utility.component').then(m => m.MaterialUtilityComponent),
  MaterialVerticalTabs: () =>
    import('../../_components/designSystemExtension/material-vertical-tabs/material-vertical-tabs.component').then(
      m => m.MaterialVerticalTabsComponent
    ),
  ModalViewContainer: () =>
    import('../../_components/infra/Containers/modal-view-container/modal-view-container.component').then(m => m.ModalViewContainerComponent),
  MultiReferenceReadOnly: () =>
    import('../../_components/template/multi-reference-readonly/multi-reference-readonly.component').then(m => m.MultiReferenceReadonlyComponent),
  Multiselect: () => import('../../_components/field/multiselect/multiselect.component').then(m => m.MultiselectComponent),
  MultiStep: () => import('../../_components/infra/multi-step/multi-step.component').then(m => m.MultiStepComponent),
  NarrowWideDetails: () =>
    import('../../_components/template/details-narrow-wide/details-narrow-wide.component').then(m => m.DetailsNarrowWideComponent),
  NarrowWideForm: () => import('../../_components/template/narrow-wide-form/narrow-wide-form.component').then(m => m.NarrowWideFormComponent),
  NavBar: () => import('../../_components/infra/navbar/navbar.component').then(m => m.NavbarComponent),
  OneColumn: () => import('../../_components/template/one-column/one-column.component').then(m => m.OneColumnComponent),
  OneColumnPage: () => import('../../_components/template/one-column-page/one-column-page.component').then(m => m.OneColumnPageComponent),
  OneColumnTab: () => import('../../_components/template/one-column-tab/one-column-tab.component').then(m => m.OneColumnTabComponent),
  Operator: () => import('../../_components/designSystemExtension/operator/operator.component').then(m => m.OperatorComponent),
  Page: () => import('../../_components/template/page/page.component').then(m => m.PageComponent),
  Percentage: () => import('../../_components/field/percentage/percentage.component').then(m => m.PercentageComponent),
  Phone: () => import('../../_components/field/phone/phone.component').then(m => m.PhoneComponent),
  PreviewViewContainer: () =>
    import('../../_components/infra/Containers/preview-view-container/preview-view-container.component').then(m => m.PreviewViewContainerComponent),
  PromotedFilters: () => import('../../_components/template/promoted-filters/promoted-filters.component').then(m => m.PromotedFiltersComponent),
  Pulse: () => import('../../_components/designSystemExtension/pulse/pulse.component').then(m => m.PulseComponent),
  QuickCreate: () => import('../../_components/widget/quick-create/quick-create.component').then(m => m.QuickCreateComponent),
  RadioButtons: () => import('../../_components/field/radio-buttons/radio-buttons.component').then(m => m.RadioButtonsComponent),
  Reference: () => import('../../_components/infra/reference/reference.component').then(m => m.ReferenceComponent),
  Region: () => import('../../_components/infra/region/region.component').then(m => m.RegionComponent),
  RepeatingStructures: () =>
    import('../../_components/template/repeating-structures/repeating-structures.component').then(m => m.RepeatingStructuresComponent),
  RichText: () => import('../../_components/field/rich-text/rich-text.component').then(m => m.RichTextComponent),
  RichTextEditor: () =>
    import('../../_components/designSystemExtension/rich-text-editor/rich-text-editor.component').then(m => m.RichTextEditorComponent),
  RootContainer: () => import('../../_components/infra/root-container/root-container.component').then(m => m.RootContainerComponent),
  ScalarList: () => import('../../_components/field/scalar-list/scalar-list.component').then(m => m.ScalarListComponent),
  SearchForm: () => import('../../_components/template/data-reference/search-form/search-form.component').then(m => m.SearchFormComponent),
  SearchGroups: () => import('../../_components/template/advanced-search/search-groups/search-groups.component').then(m => m.SearchGroupsComponent),
  SelectableCard: () => import('../../_components/field/selectable-card/selectable-card.component').then(m => m.SelectableCardComponent),
  SemanticLink: () => import('../../_components/field/semantic-link/semantic-link.component').then(m => m.SemanticLinkComponent),
  SimpleTable: () => import('../../_components/template/simple-table/simple-table.component').then(m => m.SimpleTableComponent),
  SimpleTableManual: () =>
    import('../../_components/template/simple-table-manual/simple-table-manual.component').then(m => m.SimpleTableManualComponent),
  SimpleTableSelect: () =>
    import('../../_components/template/simple-table-select/simple-table-select.component').then(m => m.SimpleTableSelectComponent),
  SingleReferenceReadOnly: () =>
    import('../../_components/template/single-reference-readonly/single-reference-readonly.component').then(m => m.SingleReferenceReadonlyComponent),
  Stages: () => import('../../_components/infra/stages/stages.component').then(m => m.StagesComponent),
  SubTabs: () => import('../../_components/template/sub-tabs/sub-tabs.component').then(m => m.SubTabsComponent),
  SummaryItem: () =>
    import('../../_components/designSystemExtension/material-summary-item/material-summary-item.component').then(m => m.MaterialSummaryItemComponent),
  SummaryList: () =>
    import('../../_components/designSystemExtension/material-summary-list/material-summary-list.component').then(m => m.MaterialSummaryListComponent),
  Text: () => import('../../_components/field/text/text.component').then(m => m.TextComponent),
  TextArea: () => import('../../_components/field/text-area/text-area.component').then(m => m.TextAreaComponent),
  TextContent: () => import('../../_components/field/text-content/text-content.component').then(m => m.TextContentComponent),
  TextInput: () => import('../../_components/field/text-input/text-input.component').then(m => m.TextInputComponent),
  ThreeColumn: () => import('../../_components/template/three-column/three-column.component').then(m => m.ThreeColumnComponent),
  ThreeColumnPage: () => import('../../_components/template/three-column-page/three-column-page.component').then(m => m.ThreeColumnPageComponent),
  Time: () => import('../../_components/field/time/time.component').then(m => m.TimeComponent),
  Todo: () => import('../../_components/widget/todo/todo.component').then(m => m.TodoComponent),
  TwoColumn: () => import('../../_components/template/two-column/two-column.component').then(m => m.TwoColumnComponent),
  TwoColumnPage: () => import('../../_components/template/two-column-page/two-column-page.component').then(m => m.TwoColumnPageComponent),
  TwoColumnTab: () => import('../../_components/template/two-column-tab/two-column-tab.component').then(m => m.TwoColumnTabComponent),
  URL: () => import('../../_components/field/url/url.component').then(m => m.UrlComponent),
  UserReference: () => import('../../_components/field/user-reference/user-reference.component').then(m => m.UserReferenceComponent),
  Utility: () => import('../../_components/widget/utility/utility.component').then(m => m.UtilityComponent),
  VerticalTabs: () =>
    import('../../_components/designSystemExtension/material-vertical-tabs/material-vertical-tabs.component').then(
      m => m.MaterialVerticalTabsComponent
    ),
  View: () => import('../../_components/infra/view/view.component').then(m => m.ViewComponent),
  ViewContainer: () => import('../../_components/infra/Containers/view-container/view-container.component').then(m => m.ViewContainerComponent),
  WideNarrowDetails: () =>
    import('../../_components/template/details-wide-narrow/details-wide-narrow.component').then(m => m.DetailsWideNarrowComponent),
  WideNarrowForm: () => import('../../_components/template/wide-narrow-form/wide-narrow-form.component').then(m => m.WideNarrowFormComponent),
  WideNarrowPage: () => import('../../_components/template/wide-narrow-page/wide-narrow-page.component').then(m => m.WideNarrowPageComponent),
  WssNavBar: () => import('../../_components/template/wss-nav-bar/wss-nav-bar.component').then(m => m.WssNavBarComponent),
  WssQuickCreate: () =>
    import('../../_components/designSystemExtension/wss-quick-create/wss-quick-create.component').then(m => m.WssQuickCreateComponent),
  reference: () => import('../../_components/infra/reference/reference.component').then(m => m.ReferenceComponent)
};
