/** This file contains various utility methods to generate filter components, regionLayout data, filter expressions, etc.  */
// Remove this and use "real" PCore type once .d.ts is fixed (currently shows 5 errors)
import { v4 as uuidv4 } from 'uuid';

export const createFilter = (value, fieldId, comparator = 'EQ') => {
  return {
    condition: {
      lhs: {
        field: fieldId
      },
      comparator,
      rhs: {
        value
      }
    }
  };
};

export const combineFilters = (filterList, existingFilters) => {
  if (filterList && filterList.length) {
    // Need to combine them
    if (existingFilters) {
      return { AND: [existingFilters, ...filterList] };
    }

    // No existing, just return the one(s) from the list
    if (filterList.length > 1) {
      return { AND: [...filterList] };
    }

    return filterList[0];
  }

  // No filter list,
  return existingFilters;
};

export const createFilterComponent = (getPConnect, filterMeta, index) => {
  // const dashboardFilter = [];
  const name = filterMeta.config.value.substring(4);
  const filterId = uuidv4();
  let cleanedName = name;
  if (name.indexOf('.') !== -1) {
    cleanedName = name.substring(name.indexOf('.') + 1);
  }
  let propInfo: any = PCore.getMetadataUtils().getPropertyMetadata(cleanedName, filterMeta.config.ruleClass);
  if (!propInfo) {
    // @ts-ignore - PCore.getMetadataUtils().getPropertyMetadata - An argument for 'currentClassID' was not provided.
    propInfo = PCore.getMetadataUtils().getPropertyMetadata(cleanedName);
  }
  const { type: propertyType } = propInfo || { type: 'Text' };
  const isNumber = propertyType && (propertyType === 'Decimal' || propertyType === 'Integer');
  filterMeta.isNumber = isNumber;
  const { filterType, datasource } = filterMeta.config;
  const type = filterType || filterMeta.type;
  const filterProp = `.pyDashboardFilter${index}`;
  if (type === 'DateTime') {
    const label = filterMeta.config.label.substring(3);
    return { type: filterMeta.type, getPConnect, name, filterProp, metadata: filterMeta, label, filterId };
  }
  if (datasource && datasource.fields) {
    datasource.fields.key = datasource.fields.value;
  }
  if (filterMeta.config.listType === 'associated' && propInfo && propInfo.datasource) {
    filterMeta.config.datasource = propInfo.datasource.records;
  }
  filterMeta.config.value = `@P ${filterProp}`;
  filterMeta.type = filterMeta.config.displayAs || type;
  filterMeta.config.placeholder = 'ALL';
  const c11nEnv = PCore.createPConnect({
    meta: filterMeta,
    options: {
      hasForm: true
    }
  });
  return { type: filterMeta.type, getPConnect, name, filterProp, metadata: filterMeta, c11nEnv, filterId };
};

export const buildFilterComponents = (getPConnect, allFilters) => {
  return allFilters.children.map((filter, index) => createFilterComponent(getPConnect, filter, index));
};

export const getFilterExpression = (filterValue, name, metadata) => {
  if (filterValue === '') {
    return null;
  }
  let comparator = 'EQ';
  if (metadata.type === 'TextInput' && !metadata.isNumber) {
    comparator = 'CONTAINS';
  }

  if (metadata.config.filterType && metadata.config.filterType === 'RelativeDates') {
    const fieldSource = metadata.config.datasource.filter((source) => source.key === filterValue)[0];
    const relativeDateExpression = JSON.parse(fieldSource.json);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const fields = [
      {
        name: relativeDateExpression.condition.lhs.field,
        type: 'DATE_TIME'
      }
    ];
    return '';
  }

  return createFilter(filterValue, name, comparator);
};

export const getFormattedDate = (date) => {
  if (!date) {
    return date;
  }
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);

  return `${year}-${month}-${day}`;
};
