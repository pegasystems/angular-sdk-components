import cloneDeep from 'lodash.clonedeep';

export function setVisibilityForList(c11nEnv, visibility) {
  const { selectionMode, selectionList, renderMode, referenceList } = c11nEnv.getComponentConfig();
  // usecase:multiselect, fieldgroup, editable table
  if ((selectionMode === PCore.getConstants().LIST_SELECTION_MODE.MULTI && selectionList) || (renderMode === 'Editable' && referenceList)) {
    c11nEnv.getListActions().setVisibility(visibility);
  }
}

function preProcessColumns(columns) {
  return columns?.map(col => {
    const tempColObj = { ...col };
    tempColObj.value = col.value && col.value.startsWith('.') ? col.value.substring(1) : col.value;
    if (tempColObj.setProperty) {
      tempColObj.setProperty = col.setProperty && col.setProperty.startsWith('.') ? col.setProperty.substring(1) : col.setProperty;
    }
    return tempColObj;
  });
}

function getDisplayFieldsMetaData(columns) {
  const displayColumns = columns?.filter(col => col.display === 'true');
  const metaDataObj: any = {
    key: '',
    primary: '',
    secondary: []
  };
  const keyCol = columns?.filter(col => col.key === 'true');
  metaDataObj.key = keyCol?.length > 0 ? keyCol[0].value : 'auto';
  const itemsRecordsColumn = columns?.filter(col => col.itemsRecordsColumn === 'true');
  if (itemsRecordsColumn?.length > 0) {
    metaDataObj.itemsRecordsColumn = itemsRecordsColumn[0].value;
  }
  const itemsGroupKeyColumn = columns?.filter(col => col.itemsGroupKeyColumn === 'true');
  if (itemsGroupKeyColumn?.length > 0) {
    metaDataObj.itemsGroupKeyColumn = itemsGroupKeyColumn[0].value;
  }
  for (let index = 0; index < displayColumns?.length; index += 1) {
    if (displayColumns[index].secondary === 'true') {
      metaDataObj.secondary.push(displayColumns[index].value);
    } else if (displayColumns[index].primary === 'true') {
      metaDataObj.primary = displayColumns[index].value;
    }
  }
  return metaDataObj;
}

function createSingleTreeObejct(entry, displayFieldMeta, showSecondaryData, selected) {
  const secondaryArr: any = [];
  displayFieldMeta.secondary.forEach(col => {
    secondaryArr.push(entry[col]);
  });
  const isSelected = selected.some(item => item.id === entry[displayFieldMeta.key]);

  return {
    id: entry[displayFieldMeta.key],
    primary: entry[displayFieldMeta.primary],
    secondary: showSecondaryData ? secondaryArr : [],
    selected: isSelected
  };
}

function putItemsDataInItemsTree(listObjData, displayFieldMeta, itemsTree, showSecondaryInSearchOnly, selected) {
  let newTreeItems = itemsTree.slice();
  const showSecondaryData = !showSecondaryInSearchOnly;
  for (const obj of listObjData) {
    const items = obj[displayFieldMeta.itemsRecordsColumn].map(entry => createSingleTreeObejct(entry, displayFieldMeta, showSecondaryData, selected));

    newTreeItems = newTreeItems.map(caseObject => {
      if (caseObject.id === obj[displayFieldMeta.itemsGroupKeyColumn]) {
        caseObject.items = [...items];
      }
      return caseObject;
    });
  }
  return newTreeItems;
}

function prepareSearchResults(listObjData, displayFieldMeta) {
  const searchResults: any = [];
  for (const obj of listObjData) {
    searchResults.push(...obj[displayFieldMeta.itemsRecordsColumn]);
  }
  return searchResults;
}

function handleGroupedDataSearch(dataApiObj, searchText, clickedGroup, initialCaseClass, itemsTree) {
  const localDataApiObj = cloneDeep(dataApiObj);
  localDataApiObj.fetchedNQData = false;
  localDataApiObj.cache = {};

  if (!searchText && !clickedGroup) {
    return { shouldReturn: true, value: itemsTree };
  }

  localDataApiObj.parameters[Object.keys(localDataApiObj.parameters)[1]] = searchText;
  localDataApiObj.parameters[Object.keys(localDataApiObj.parameters)[0]] = initialCaseClass;

  if (clickedGroup) {
    if (!searchText) {
      const containsData = itemsTree.find(item => item.id === clickedGroup);
      if (containsData?.items?.length) {
        return { shouldReturn: true, value: itemsTree };
      }
    }
    localDataApiObj.parameters[Object.keys(localDataApiObj.parameters)[0]] = JSON.stringify([clickedGroup]);
  }

  return { shouldReturn: false, value: localDataApiObj };
}

async function doSearch(
  searchText,
  clickedGroup,
  initialCaseClass,
  displayFieldMeta,
  dataApiObj, // deep clone of the dataApiObj
  itemsTree,
  isGroupData,
  showSecondaryInSearchOnly,
  selected
) {
  if (!dataApiObj) {
    return itemsTree;
  }

  let searchTextForApi = '';
  let localDataApiObj = dataApiObj;

  if (isGroupData) {
    const groupResult = handleGroupedDataSearch(dataApiObj, searchText, clickedGroup, initialCaseClass, itemsTree);
    if (groupResult.shouldReturn) {
      return groupResult.value;
    }
    localDataApiObj = groupResult.value;
  } else {
    searchTextForApi = searchText;
  }

  const response = await localDataApiObj.fetchData(searchTextForApi).catch(() => ({ data: undefined }));

  let listObjData = response.data;
  if (!listObjData) {
    return itemsTree;
  }

  if (isGroupData) {
    if (searchText) {
      listObjData = prepareSearchResults(listObjData, displayFieldMeta);
    } else {
      return putItemsDataInItemsTree(listObjData, displayFieldMeta, itemsTree, showSecondaryInSearchOnly, selected);
    }
  }

  if (listObjData.length === 0) {
    return [];
  }

  const showSecondaryData = showSecondaryInSearchOnly ? !!searchText : true;
  return listObjData.map(entry => createSingleTreeObejct(entry, displayFieldMeta, showSecondaryData, selected));
}

function setValuesToPropertyList(searchText, assocProp, items, columns, actions, updatePropertyInRedux = true) {
  const setPropertyList = columns
    ?.filter(col => col.setProperty)
    .map(col => {
      return {
        source: col.value,
        target: col.setProperty,
        key: col.key,
        primary: col.primary
      };
    });
  const valueToSet: any = [];
  if (setPropertyList.length > 0) {
    setPropertyList.forEach(prop => {
      items.forEach(item => {
        if (prop.key === 'true' && item) {
          valueToSet.push(item.id);
        } else if (prop.primary === 'true' || !item) {
          valueToSet.push(searchText);
        }
      });

      if (updatePropertyInRedux) {
        // BUG-666851 setting options so that the store values are replaced and not merged
        const options = {
          isArrayDeepMerge: false
        };
        if (prop.target === 'Associated property') {
          actions.updateFieldValue(assocProp, valueToSet, options);
        } else {
          actions.updateFieldValue(`.${prop.target}`, valueToSet, options);
        }
      }
    });
  }
  return valueToSet;
}

function getGroupDataForItemsTree(groupDataSource, groupsDisplayFieldMeta, showSecondaryInSearchOnly) {
  return groupDataSource?.map(group => {
    const secondaryArr: any = [];
    groupsDisplayFieldMeta.secondary.forEach(col => {
      secondaryArr.push(group[col]);
    });
    return {
      id: group[groupsDisplayFieldMeta.key],
      primary: group[groupsDisplayFieldMeta.primary],
      secondary: showSecondaryInSearchOnly ? [] : secondaryArr,
      items: []
    };
  });
}

export { preProcessColumns, getDisplayFieldsMetaData, doSearch, setValuesToPropertyList, getGroupDataForItemsTree };
