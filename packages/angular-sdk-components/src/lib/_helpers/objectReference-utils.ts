export const SELECTION_MODE = { SINGLE: 'single', MULTI: 'multi' };

export const SIMPLE_TABLE_MANUAL_READONLY = 'SimpleTableManualReadOnly';

const PERIOD = '.';
const AT = '@';
const SQUARE_BRACKET_START = '[';
const SQUARE_BRACKET_END = ']';

function getMappedKey(key) {
  const qualifiedKey = (PCore as any).getNameSpaceUtils().getDefaultQualifiedName(key);
  const mappedKey = PCore.getEnvironmentInfo().getKeyMapping(qualifiedKey);
  if (!mappedKey) {
    return qualifiedKey;
  }
  return mappedKey;
}

function updatePageListPropertyValue(value) {
  value = value.substring(0, value.indexOf(SQUARE_BRACKET_START)) + value.substring(value.indexOf(SQUARE_BRACKET_END) + 1);
  return value;
}

export function getPropertyValue(value) {
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
  return property?.substr(property.lastIndexOf('.') + 1);
}

export function isSelfReferencedProperty(param, referenceProp): boolean {
  const [, parentPropName] = param.split('.');
  const referencePropParent = referenceProp?.split('.').pop();
  return parentPropName === referencePropParent;
}

function getReferenceProp(config): string {
  if (config.mode === SELECTION_MODE.MULTI) {
    return config?.pagelistValue?.substring(4) ?? '';
  }
  const property = config.value;
  const arr = property?.split('.') ?? [];
  if (arr.length > 1) {
    arr.pop();
    return arr.slice(1).join('.');
  }
  return '';
}

function getCompositeKeys(c11nEnv, property): any {
  const { datasource: { parameters = {} } = {} } = c11nEnv.getFieldMetadata(property) || {};
  return Object.values(parameters).reduce((compositeKeys: any, param: any) => {
    if (isSelfReferencedProperty(param, property)) {
      let propName = getPropertyValue(param);
      propName = propName.substring(propName.indexOf('.') + 1);
      compositeKeys.push(propName);
    }
    return compositeKeys;
  }, []);
}

export function generateColumns(config, pConn, referenceType) {
  const displayField = getLeafNameFromPropertyName(config.displayField);
  const referenceProp = getReferenceProp(config);
  const compositeKeys = getCompositeKeys(pConn, referenceProp);
  let value = getLeafNameFromPropertyName(config.mode === SELECTION_MODE.MULTI ? config.selectionKey : config.value);

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
    if (!config.value) {
      config.value = `@P .${referenceProp}.${value}`;
    }
    columns.push({
      value,
      setProperty: 'Associated property',
      key: 'true'
    });
  } else {
    const actualValue = compositeKeys.length > 0 ? compositeKeys[0] : value;
    config.value = `@P .${referenceProp}.${actualValue}`;
    value = actualValue;
    columns.push({
      value: actualValue,
      setProperty: 'Associated property',
      key: 'true'
    });
  }

  config.datasource = {
    fields: {
      key: `.${getLeafNameFromPropertyName(config.value)}`,
      text: `.${getLeafNameFromPropertyName(config.displayField)}`,
      value: `.${getLeafNameFromPropertyName(config.value)}`
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
    const descriptorsFieldName = `.${key}`;
    if (value !== key)
      columns.push({
        value: descriptorsFieldName,
        display: 'false',
        secondary: 'true',
        useForSearch: false,
        setProperty: `.${referenceProp}.${key}`
      });
  });

  config.columns = columns;
}

export function addCompositeKeysToConfig(config, pConn) {
  const referenceProp = getReferenceProp(config);
  const fieldMetadata = pConn.getFieldMetadata(referenceProp) || {};
  const { datasource: { parameters: fieldParameters = {} } = {} } = fieldMetadata;
  const compositeKeys: string[] = [];
  Object.values(fieldParameters).forEach((param: any) => {
    if (isSelfReferencedProperty(param, referenceProp)) {
      compositeKeys.push(param);
    }
  });
  config.compositeKeys = compositeKeys;
}

export function getDataRelationshipContextFromKey(key) {
  const firstIndexOfDot = key.indexOf('.');
  if (firstIndexOfDot > -1) {
    const lastIndexOfDot = key.lastIndexOf('.');
    if (lastIndexOfDot > -1) {
      return key.substring(firstIndexOfDot + 1, lastIndexOfDot);
    }
  }
  return '';
}

export function createNewRecord({ referenceType, disableStartingFieldsForReference, pConn, contextClass, startingFields, getPConnect }) {
  if (referenceType === 'Case') {
    if (!disableStartingFieldsForReference) {
      startingFields[(PCore as any).getNameSpaceUtils().getDefaultQualifiedName('pyAddCaseContextPage')] = {
        pyID: pConn.getCaseInfo().getKey()?.split(' ')?.pop()
      };
    }
    return pConn.getActionsApi().createWork(contextClass, {
      openCaseViewAfterCreate: false,
      startingFields
    });
  }
  if (referenceType === 'Data') {
    return getPConnect().getActionsApi().showDataObjectCreateView(contextClass);
  }
}

export function generateDetailsDisplay({ isCaseType, fieldForDisplay, fieldNameForKey, displayFieldMetadata }) {
  const displayDetails: any[] = [
    {
      config: {
        label: `@L ${fieldForDisplay}`,
        value: `@P .${fieldForDisplay}`,
        ...(isCaseType && {
          additionalDetails: {
            type: 'DISPLAY_LINK',
            params: {}
          }
        })
      },
      type: displayFieldMetadata?.type || 'TextInput'
    }
  ];
  if (isCaseType) {
    displayDetails.push({
      config: {
        additionalDetails: {
          params: {},
          type: 'DISPLAY_LINK'
        },
        label: '@L Case ID',
        previewKey: '@P .pzInsKey',
        value: `@P ${fieldNameForKey || 'pyID'}`
      },
      type: 'TextInput'
    });
  }
  return displayDetails;
}

export function getAdditionalInfo(pConn, propertyName) {
  const parentFieldMetadata = pConn.getFieldMetadata(getDataRelationshipContextFromKey(propertyName));
  return parentFieldMetadata?.additionalInformation
    ? {
        content: parentFieldMetadata.additionalInformation
      }
    : undefined;
}

export function camelCase(str: string): string {
  return str.replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : '')).replace(/^[A-Z]/, char => char.toLowerCase());
}

export { getLeafNameFromPropertyName, getCompositeKeys };
