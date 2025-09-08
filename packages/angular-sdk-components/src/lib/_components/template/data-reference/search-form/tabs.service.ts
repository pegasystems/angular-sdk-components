import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getTabLabel } from '../../../../_helpers/tab-utils';

@Injectable({
  providedIn: 'root'
})
export class TabsService {
  private availableTabs: any[] = [];
  private data$ = new BehaviorSubject<any[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);
  private error$ = new BehaviorSubject<any>(false);
  private countMetadata: any[] = [];
  private currentTabId: string | null = null;

  private viewName: string | null = null;
  private pConn: any;

  init(deferLoadedTabs: any, selectedTabId: string, template: string) {
    this.pConn = deferLoadedTabs.getPConnect();
    this.availableTabs = this.pConn.getChildren() || [];
    this.viewName = this.pConn?.options?.viewName || null;
    this.currentTabId = selectedTabId;

    this.refreshTabData(false, template);
    this.loadTabCounts(template);
  }

  private tabContent(id: string, index: number, overrideTabContent: boolean, tab: any, template: string) {
    if (id === this.currentTabId || template === 'HierarchicalForm') {
      if (overrideTabContent) {
        return tab.getPConnect().getComponent();
      }
      if (this.data$.value[index]?.content) {
        return this.data$.value[index].content;
      }
      return tab.getPConnect().getComponent();
    }
    if (template !== 'HierarchicalForm') {
      return overrideTabContent ? null : this.data$.value[index]?.content;
    }
  }

  private getTabsData(overrideTabContent: boolean, template: string) {
    return this.availableTabs.map((tab, index) => {
      const config = tab.getPConnect().getConfigProps();
      const name = getTabLabel(tab.getPConnect());
      const tabId = `${this.viewName}-${config.name || name}-${index}`;
      const count = this.countMetadata.find(item => item.tabId === tabId)?.count;

      return {
        name,
        id: tabId,
        getPConnect: tab.getPConnect,
        content: this.tabContent(tabId, index, overrideTabContent, tab, template),
        loaded: tabId === this.currentTabId || Boolean(this.data$.value[index]?.content),
        visibility: () => {
          const tabConfig = tab.getPConnect().getConfigProps();
          const isVisible = !('visibility' in tabConfig) || tabConfig.visibility === true;
          if (!isVisible) {
            tab.getPConnect().removeNode();
          }
          return isVisible;
        },
        count
      };
    });
  }

  // eslint-disable-next-line @typescript-eslint/default-param-last
  refreshTabData(overrideTabContent = true, template: string) {
    const updatedData = this.getTabsData(overrideTabContent, template);
    this.data$.next(updatedData);
  }

  updateCurrentTabId(tabId: string, template: string) {
    this.currentTabId = tabId;
    this.refreshTabData(false, template);
  }

  private loadTabCounts(template: string) {
    const tabCountSources = this.buildTabCountSources();

    const { dataPageSources, calculatedFields } = tabCountSources;
    const calculatedFieldsWithoutValue = calculatedFields.filter(item => item.propertyName);

    if (dataPageSources.length) {
      this.loading$.next(true);
      Promise.all(dataPageSources.map(item => PCore.getDataPageUtils().getPageDataAsync(item.dataPageName, '', item.dataViewParameters)))
        .then(res => {
          const temp = res.map((r, index) => ({
            ...dataPageSources[index],
            count: r[dataPageSources[index].tabCountProp]
          }));
          this.countMetadata = temp;
          this.loading$.next(false);
          this.refreshTabData(false, template);
        })
        .catch(err => {
          this.error$.next(err);
          this.loading$.next(false);
        });
    } else if (calculatedFieldsWithoutValue.length) {
      PCore.getViewRuleApi()
        // @ts-ignore
        .getCalculatedFields(
          this.pConn.getCaseInfo().getKey(),
          this.pConn.getCurrentView(),
          calculatedFieldsWithoutValue.map(({ propertyName, context }) => ({ name: propertyName, context }))
        )
        .then(res => {
          const values = res?.data?.caseInfo?.content || {};
          const temp = calculatedFields.map(field => ({
            ...field,
            count: values[field.propertyName?.substring(1)] || field.count
          }));
          this.countMetadata = temp;
          this.refreshTabData(false, template);
        })
        .catch(err => {
          this.error$.next(err);
          this.loading$.next(false);
        });
    } else {
      this.countMetadata = calculatedFields.map(field => ({ ...field, count: field.count }));
      this.refreshTabData(false, template);
    }
  }

  private buildTabCountSources() {
    return this.availableTabs.reduce(
      (prev, tab, index) => {
        const config = tab.getPConnect().getConfigProps();
        const showTabCount = config.inheritedProps?.find((item: any) => item.prop === 'showTabCount')?.value;
        const value = config.inheritedProps?.find((item: any) => item.prop === 'count')?.value;
        const tabCountSource = config.inheritedProps?.find((item: any) => item.prop === 'tabCount');
        const name = getTabLabel(tab.getPConnect());
        const tabId = `${this.viewName}-${config.name || name}-${index}`;

        if (showTabCount) {
          if (tabCountSource?.value?.fields?.count) {
            const isPrefixedByDot = tabCountSource.value.fields.count.startsWith('.');
            return {
              ...prev,
              dataPageSources: [
                ...prev.dataPageSources,
                {
                  dataPageName: tabCountSource.value.source,
                  tabId,
                  tabCountProp: isPrefixedByDot ? tabCountSource.value.fields.count.substring(1) : tabCountSource.value.fields.count,
                  dataViewParameters: tabCountSource.value?.parameters || {}
                }
              ]
            };
          }
          if (Number.isInteger(value) && value % 1 === 0) {
            return {
              ...prev,
              calculatedFields: [...prev.calculatedFields, { count: value, context: tab.getPConnect().getContextName(), tabId }]
            };
          }
          if (value?.isDeferred) {
            return {
              ...prev,
              calculatedFields: [...prev.calculatedFields, { propertyName: value.propertyName, context: 'content', tabId }]
            };
          }
        }
        return prev;
      },
      { dataPageSources: [], calculatedFields: [] }
    );
  }

  // 🔹 Expose observables for component
  getData$() {
    return this.data$.asObservable();
  }

  getLoading$() {
    return this.loading$.asObservable();
  }

  getError$() {
    return this.error$.asObservable();
  }
}
