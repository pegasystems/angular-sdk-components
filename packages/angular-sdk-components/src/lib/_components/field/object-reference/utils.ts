const PERIOD = '.';
const AT = '@';
const SQUARE_BRACKET_START = '[';
const SQUARE_BRACKET_END = ']';

function getMappedKey(key) {
  const mappedKey = PCore.getEnvironmentInfo().getKeyMapping(key);
  if (!mappedKey) {
    return key;
  }
  return mappedKey;
}

function updatePageListPropertyValue(value) {
  value = value.substring(0, value.indexOf(SQUARE_BRACKET_START)) + value.substring(value.indexOf(SQUARE_BRACKET_END) + 1);
  return value;
}

function getPropertyValue(value) {
  if (value.startsWith(AT)) {
    value = value.substring(value.indexOf(' ') + 1);
    if (value.startsWith(PERIOD)) value = value.substring(1);
  }
  if (value.includes(SQUARE_BRACKET_START)) {
    value = updatePageListPropertyValue(value);
  }
  return value;
}

function getLeafNameFromPropertyName(property): string {
  return property?.substr(property.lastIndexOf('.'));
}

function isSelfReferencedProperty(param, referenceProp): boolean {
  return param === referenceProp?.split('.', 2)[1];
}

function getCompositeKeys(c11nEnv, property): any {
  const { datasource: { parameters = {} } = {} } = c11nEnv.getFieldMetadata(property) || {};
  return Object.values(parameters).reduce((compositeKeys: any, param: any) => {
    if (isSelfReferencedProperty(property, param)) {
      let propName = getPropertyValue(param);
      propName = propName.substring(propName.indexOf('.'));
      compositeKeys.push(propName);
    }
    return compositeKeys;
  }, []);
}

function generateColumns(config, pConn, referenceType) {
  const displayField = getLeafNameFromPropertyName(config.displayField);
  const referenceProp = config.value.split('.', 2)[1];
  const compositeKeys = getCompositeKeys(pConn, referenceProp);
  let value = getLeafNameFromPropertyName(config.value);

  const columns: any[] = [];
  if (displayField) {
    columns.push({
      value: displayField,
      display: 'true',
      useForSearch: true,
      primary: 'true'
    });
  }
  if (value && compositeKeys.indexOf(value) !== -1) {
    columns.push({
      value,
      setProperty: 'Associated property',
      key: 'true'
    });
  } else {
    const actualValue = compositeKeys.length > 0 ? compositeKeys[0] : value;
    config.value = `@P .${referenceProp}${actualValue}`;
    value = actualValue;
    columns.push({
      value: actualValue,
      setProperty: 'Associated property',
      key: 'true'
    });
  }

  config.datasource = {
    fields: {
      key: getLeafNameFromPropertyName(config.value),
      text: getLeafNameFromPropertyName(config.displayField),
      value: getLeafNameFromPropertyName(config.value)
    }
  };

  if (referenceType === 'Case') {
    columns.push({
      secondary: 'true',
      display: 'true',
      value: getMappedKey('pyID'),
      useForSearch: true
    });
  }

  compositeKeys.forEach(key => {
    if (value !== key)
      columns.push({
        value: key,
        display: 'false',
        secondary: 'true',
        useForSearch: false,
        setProperty: `.${referenceProp}${key}`
      });
  });

  config.columns = columns;
}

function getDataRelationshipContextFromKey(key) {
  return key.split('.', 2)[1];
}

export { getLeafNameFromPropertyName, isSelfReferencedProperty, getCompositeKeys, generateColumns, getDataRelationshipContextFromKey };
