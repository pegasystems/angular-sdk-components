function getContextProperty(pageReference, dataRelationshipContext) {
  if (!pageReference) return null;

  const propertySplit = pageReference.split('.');
  let contextProperty = dataRelationshipContext ?? propertySplit.pop();

  // Regex to match if the property is list type. Eg: EmployeeRef[1]
  const listPropertyRegex = /([a-z|A-Z]*[[][\d]*)[\]]$/gm;
  if (listPropertyRegex.test(contextProperty)) {
    // Regex to match [1] part of the property EmployeeRef[1]
    const indexRegex = /([[][\d]*[\]])+/gm;
    contextProperty = contextProperty.replace(indexRegex, '');
  }
  return contextProperty;
}

function buildPayload(parameters, pConnect, contextPage, dataRelationshipContext) {
  const payload = {};
  const annotationUtils = PCore.getAnnotationUtils();

  for (const [key, value] of Object.entries(parameters)) {
    if (contextPage && Object.hasOwn(contextPage, key)) {
      payload[key] = contextPage[key];
    } else {
      const isProperty = annotationUtils.isProperty(value as string);
      if (isProperty) {
        const property =
          dataRelationshipContext !== null ? annotationUtils.getPropertyName(value as string) : annotationUtils.getLeafPropertyName(value as string);
        payload[key] = pConnect.getValue(`.${property}`);
      } else {
        payload[key] = value;
      }
    }
  }
  return payload;
}

function getDataReferenceInfo(pConnect, dataRelationshipContext, contextPage) {
  if (!pConnect) {
    throw Error('PConnect parameter is required');
  }

  const pageReference = pConnect.getPageReference();
  const contextProperty = getContextProperty(pageReference, dataRelationshipContext);
  const fieldMetadata = contextProperty ? pConnect.getFieldMetadata(contextProperty) : null;

  if (fieldMetadata?.datasource) {
    const { name: dataContext, parameters } = fieldMetadata.datasource;
    const dataContextParameters = buildPayload(parameters, pConnect, contextPage, dataRelationshipContext);
    return { dataContext, dataContextParameters };
  }

  return {};
}

function isLinkTextEmpty(text) {
  return text === '' || text === undefined || text === null;
}

export { getDataReferenceInfo, isLinkTextEmpty };
