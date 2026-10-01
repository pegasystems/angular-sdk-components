/**
 * Removes the component's form field registration and its node (field, address or view)
 * from the engine's context tree. Called when a component unsubscribes.
 */
export function removeFormFieldAndContextNode(inComp: any): void {
  if (inComp.pConn$?.removeFormField) {
    inComp.pConn$?.removeFormField();
  }

  const contextName = inComp.pConn$.getContextName();
  const pageReference = inComp.pConn$.getPageReference();
  const rawConfig = inComp.pConn$._rawConfig;
  const index = inComp.pConn$.index;

  if (Object.hasOwn(rawConfig?.config ?? {}, 'value') && inComp.pConn$._type !== 'Address') {
    PCore.getContextTreeManager().removeFieldNode(
      contextName,
      pageReference,
      inComp.pConn$.viewName || '',
      inComp.pConn$._getPropertyName(),
      index as number
    );
  } else if (inComp.pConn$._type === 'Address' && rawConfig?.config?.associatedView) {
    // remove address node and its children
    PCore.getContextTreeManager().removeViewNode(contextName, pageReference, rawConfig.config.associatedView, index as number);
  } else {
    // remove view node and its children
    const pageRef = rawConfig?.config?.context ? `${pageReference}${rawConfig?.config.context}` : pageReference;
    PCore.getContextTreeManager().removeViewNode(contextName, pageRef, rawConfig?.config?.name || rawConfig?.config?.id || '', index);
  }
}
