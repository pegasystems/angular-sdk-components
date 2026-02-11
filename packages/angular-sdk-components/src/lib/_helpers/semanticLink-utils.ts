function getContextProperty(pageReference, dataRelationshipContext) {
  const propertySplit = pageReference.split('.');
  // Regex to match if the property is list type. Eg: EmployeeRef[1]
  const listPropertyRegex = /([a-z|A-Z]*[[][\d]*)[\]]$/gm;
  // Regex to match [1] part of the property EmployeeRef[1]
  const indexRegex = /([[][\d]*[\]])+/gm;

  let contextProperty = dataRelationshipContext ?? propertySplit.pop();
  if (listPropertyRegex.test(contextProperty)) {
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
      const property =
        dataRelationshipContext !== null ? annotationUtils.getPropertyName(value as string) : annotationUtils.getLeafPropertyName(value as string);
      payload[key] = isProperty ? pConnect.getValue(`.${property}`) : value;
    }
  }
  return payload;
}

function getDataReferenceInfo(pConnect, dataRelationshipContext, contextPage) {
  if (!pConnect) {
    throw Error('PConnect parameter is required');
  }

  const pageReference = pConnect.getPageReference();
  if (!pageReference) {
    return {};
  }

  const contextProperty = getContextProperty(pageReference, dataRelationshipContext);
  const fieldMetadata = pConnect.getFieldMetadata(contextProperty);

  if (fieldMetadata?.datasource) {
    const { name, parameters } = fieldMetadata.datasource;
    const payload = buildPayload(parameters, pConnect, contextPage, dataRelationshipContext);
    return { dataContext: name, dataContextParameters: payload };
  }

  return {};
}

function isLinkTextEmpty(text) {
  return text === '' || text === undefined || text === null;
}

export { getDataReferenceInfo, isLinkTextEmpty };
