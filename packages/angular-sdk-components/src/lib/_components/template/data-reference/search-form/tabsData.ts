import { getTabLabel } from '../../../../_helpers/tab-utils';

export function getTabCountSources(deferLoadedTabs) {
  const availableTabs = deferLoadedTabs.getPConnect().getChildren() || [];
  const viewName = deferLoadedTabs?.getPConnect()?.options?.viewName || null;
  return availableTabs.reduce(
    (prev, tab, index) => {
      const config = tab.getPConnect().getConfigProps();
      const { value: showTabCount } = config.inheritedProps?.find(item => item.prop === 'showTabCount') || {};
      const { value } = config.inheritedProps?.find(item => item.prop === 'count') || {};
      const tabCountSource = config.inheritedProps?.find(item => item.prop === 'tabCount');
      const name = getTabLabel(tab.getPConnect());
      const tabId = `${viewName}-${config.name || name}-${index}`;
      if (showTabCount) {
        if (tabCountSource?.value?.fields?.count) {
          const isPrefixedByDot = tabCountSource.value.fields.count.substring(0, 1) === '.';
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
            calculatedFields: [
              ...prev.calculatedFields,
              {
                count: value,
                context: tab.getPConnect().getContextName(),
                tabId
              }
            ]
          };
        }
        if (value?.isDeferred) {
          return {
            ...prev,
            calculatedFields: [
              ...prev.calculatedFields,
              {
                propertyName: value.propertyName,
                context: 'content',
                tabId
              }
            ]
          };
        }
      }
      return prev;
    },
    {
      dataPageSources: [],
      calculatedFields: []
    }
  );
}

function tabContent(id, index, overideTabContent, tab, data, currentTabId, template) {
  if (id === currentTabId || template === 'HierarchicalForm') {
    if (overideTabContent) {
      return tab.getPConnect().getComponent();
    }
    if (data[index]?.content) {
      return data[index]?.content;
    }
    return tab.getPConnect().getComponent();
  }
  if (template !== 'HierarchicalForm') {
    return overideTabContent ? null : data[index]?.content;
  }
}

function getTabsData(deferLoadedTabs, countMetadata, currentTabId, data) {
  const availableTabs = deferLoadedTabs.getPConnect().getChildren() || [];
  const viewName = deferLoadedTabs?.getPConnect()?.options?.viewName || null;
  return availableTabs.map((tab, index) => {
    const config = tab.getPConnect().getConfigProps();
    const name = getTabLabel(tab.getPConnect());
    const tabId = `${viewName}-${config.name || name}-${index}`;
    const count = countMetadata.find(item => item.tabId === tabId)?.count;

    return {
      name,
      id: tabId,
      getPConnect: tab.getPConnect,
      content: tabContent(tabId, index, '', tab, data, currentTabId, ''),
      loaded: tabId === currentTabId || Boolean(data[index]?.content),
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

export function getData(deferLoadedTabs, tabCountSources, currentTabId, data) {
  let countMetadata;
  let tabData;
  const pConn = deferLoadedTabs.getPConnect();
  const { dataPageSources, calculatedFields } = tabCountSources;
  const calculatedFieldsWithoutValue = calculatedFields.filter(item => item.propertyName);
  if (dataPageSources.length) {
    Promise.all(dataPageSources.map(item => PCore.getDataPageUtils().getPageDataAsync(item.dataPageName, '', item.dataViewParameters)))
      .then(res => {
        const temp = res.map((r, index) => ({
          ...dataPageSources[index],
          count: r[dataPageSources[index].tabCountProp]
        }));
        countMetadata = temp;
        tabData = getTabsData(deferLoadedTabs, countMetadata, currentTabId, data);
      })
      .catch(err => {
        console.log(err);
      });
  } else if (calculatedFieldsWithoutValue.length) {
    PCore.getViewRuleApi()
      // @ts-ignore
      .getCalculatedFields(
        pConn.getCaseInfo().getKey(),
        pConn.getCurrentView(),
        calculatedFieldsWithoutValue.map(({ propertyName, context }) => ({
          name: propertyName,
          context
        }))
      )
      .then(res => {
        const values = (res?.data as any)?.caseInfo?.content || {};
        const temp = calculatedFields.map(field => ({
          ...field,
          count: values[field.propertyName?.substring(1)] || field.count
        }));
        countMetadata = temp;
        tabData = getTabsData(deferLoadedTabs, countMetadata, currentTabId, data);
      })
      .catch(err => {
        console.log(err);
      });
  } else {
    countMetadata = calculatedFields.map(field => ({
      ...field,
      count: field.count
    }));
    tabData = getTabsData(deferLoadedTabs, countMetadata, currentTabId, data);
  }

  return tabData;
}
