/**
 * Resolves the props a component is tracked by: its config props plus any `additionalProps`
 * (an object of config or a function of state and pConn$). Used to decide whether a component
 * needs to re-render.
 */
export function resolveComponentProps(inComp: any): object {
  let addProps = {};

  if (inComp.additionalProps !== undefined) {
    if (typeof inComp.additionalProps === 'object') {
      addProps = inComp.pConn$.resolveConfigProps(inComp.additionalProps);
    } else if (typeof inComp.additionalProps === 'function') {
      const propsToAdd = inComp.additionalProps(PCore.getStore().getState(), inComp.pConn$);
      addProps = inComp.pConn$.resolveConfigProps(propsToAdd);
    }
  }

  let compProps = inComp.pConn$.getConfigProps();

  // Component-specific props that are not (yet) part of the configuration
  inComp.pConn$.populateAdditionalProps(compProps);

  compProps = inComp.pConn$.resolveConfigProps(compProps);

  const result: any = {
    ...compProps,
    ...addProps
  };

  // Include inheritedProps in comparison (matches React SDK areStatePropsEqual in react_pconnect.jsx)
  const stateProps = inComp.pConn$.getStateProps();
  if (stateProps?.inheritedProps) {
    result.inheritedProps = inComp.pConn$.getInheritedProps();
  }

  return result;
}
