const processRootViewDetails = (rootView, containerItem, options) => {
  const {
    config: { context: viewContext, name: viewName }
  } = rootView;
  const { context: containerContext } = containerItem;
  const { parentPConnect } = options;
  let resolvedViewName = viewName;
  let resolvedViewContext = viewContext;

  const isAnnotedViewName = PCore.getAnnotationUtils().isProperty(viewName);
  const isAnnotedViewContext = PCore.getAnnotationUtils().isProperty(viewContext);

  // resolving annoted view context
  if (isAnnotedViewContext) {
    const viewContextProperty = PCore.getAnnotationUtils().getPropertyName(viewContext);
    resolvedViewContext = PCore.getStoreValue(
      `.${viewContextProperty}`,
      viewContextProperty.startsWith('.') ? parentPConnect.getPageReference() : '',
      containerContext
    );
  }

  if (!resolvedViewContext) {
    resolvedViewContext = parentPConnect.getPageReference();
  }

  // resolving annoted view name
  if (isAnnotedViewName) {
    const viewNameProperty = PCore.getAnnotationUtils().getPropertyName(viewName);
    resolvedViewName = PCore.getStoreValue(`.${viewNameProperty}`, resolvedViewContext, containerContext);
  }

  /* Special case where context and viewname are dynamic values
    Use case - split for each shape
    Ex - (caseInfo.content.SCRequestWorkQueues[1]):context --> .pyViewName:viewName
  */
  if (isAnnotedViewName && isAnnotedViewContext && resolvedViewName !== '') {
    /* Allow context processor to resolve view and context when both are dynamic */
    resolvedViewName = viewName;
    resolvedViewContext = viewContext;
  }

  return {
    viewName: resolvedViewName,
    viewContext: resolvedViewContext
  };
};

export const getPConnectOfActiveContainerItem = (containerInfo, options) => {
  const { accessedOrder, items } = containerInfo;
  const { isAssignmentView = false, parentPConnect } = options;
  const containerName = parentPConnect.getContainerName();
  const { CONTAINER_NAMES } = PCore.getContainerUtils();
  const { CREATE_DETAILS_VIEW_NAME } = PCore.getConstants();

  if (accessedOrder && items) {
    const activeContainerItemKey = accessedOrder[accessedOrder.length - 1];

    if (items[activeContainerItemKey] && items[activeContainerItemKey].view && Object.keys(items[activeContainerItemKey].view).length > 0) {
      const activeContainerItem = items[activeContainerItemKey];
      const target = activeContainerItemKey.substring(0, activeContainerItemKey.lastIndexOf('_'));

      const { view: rootView, context } = activeContainerItem;
      const { viewName, viewContext } = processRootViewDetails(rootView, activeContainerItem, { parentPConnect });

      if (!viewName) return null;

      const config = {
        meta: rootView,
        options: {
          context,
          pageReference: viewContext || parentPConnect.getPageReference(),
          containerName,
          containerItemID: activeContainerItemKey,
          parentPageReference: parentPConnect.getPageReference(),
          hasForm:
            isAssignmentView ||
            containerName === CONTAINER_NAMES.WORKAREA ||
            containerName === CONTAINER_NAMES.MODAL ||
            viewName === CREATE_DETAILS_VIEW_NAME,
          target
        }
      };

      return PCore.createPConnect(config).getPConnect();
    }
  }
  return null;
};
