export interface IOption {
  key: string;
  value: string;
}

export interface DisplayFieldsMetaData {
  key: string;
  primary: string;
  secondary: string[];
}

export interface ColumnsAndDataSource {
  columns: any[];
  datasource: string;
}

export interface ProcessedDeferredDatasource {
  listType: string;
  datasource: string;
  parameters: Record<string, any>;
  columns: any[];
}

export class AutoCompleteLogic {
  /**
   * Filters options based on the filter value (case insensitive)
   */
  filterOptions(options: IOption[], filterValue: string): IOption[] {
    if (!options) return [];
    if (!filterValue) return options;
    const filter = filterValue.toLowerCase();
    return options.filter(option => option.value?.toLowerCase().includes(filter));
  }

  /**
   * Flattens parameters object from { param1: { name, value } } to { name: value }
   */
  flattenParameters(params: Record<string, { name: string; value: any }> = {}): Record<string, any> {
    if (!params) return {};
    const flatParams: Record<string, any> = {};
    Object.keys(params).forEach(key => {
      const { name, value: theVal } = params[key];
      flatParams[name] = theVal;
    });
    return flatParams;
  }

  /**
   * Pre-processes columns by removing leading dots from values
   */
  preProcessColumns(columnList: any[]): any[] {
    if (!columnList) return columnList;
    return columnList.map(col => {
      const tempColObj = { ...col };
      tempColObj.value = col.value && col.value.startsWith('.') ? col.value.substring(1) : col.value;
      return tempColObj;
    });
  }

  /**
   * Extracts display fields metadata from column list
   */
  getDisplayFieldsMetaData(columnList: any[]): DisplayFieldsMetaData {
    const metaDataObj: DisplayFieldsMetaData = { key: 'auto', primary: '', secondary: [] };

    if (!columnList) return metaDataObj;

    const displayColumns = columnList.filter(col => col.display === 'true');
    const keyCol = columnList.filter(col => col.key === 'true');

    metaDataObj.key = keyCol.length > 0 ? keyCol[0].value : 'auto';

    for (let index = 0; index < displayColumns.length; index += 1) {
      if (displayColumns[index].primary === 'true') {
        metaDataObj.primary = displayColumns[index].value;
      } else {
        metaDataObj.secondary.push(displayColumns[index].value);
      }
    }

    return metaDataObj;
  }

  /**
   * Finds the key for a given option value
   */
  findOptionKey(options: IOption[], value: string): string {
    if (!value) return '';
    const index = options?.findIndex(element => element.value === value);
    return index > -1 ? options[index].key : value;
  }

  /**
   * Finds the display value for a given key
   */
  findOptionValue(options: IOption[], key: string): string | undefined {
    if (!options || key === undefined) return undefined;
    const index = options.findIndex(element => element.key === key);
    return index > -1 ? options[index].value : undefined;
  }

  /**
   * Gets the display value, falling back to key if not found
   */
  getDisplayValue(options: IOption[], key: string): string {
    const displayValue = this.findOptionValue(options, key);
    return displayValue !== undefined ? displayValue : key;
  }

  /**
   * Builds options array from API results
   */
  buildOptionsFromResults(results: any[], columns: any[]): IOption[] {
    if (!results?.length) return [];

    const displayColumn = this.getDisplayFieldsMetaData(columns);

    return results.map(element => ({
      key: element[displayColumn.key] || element.pyGUID,
      value: element[displayColumn.primary]?.toString()
    }));
  }

  /**
   * Processes deferred datasource metadata and returns processed configuration
   */
  processDeferredDatasource(datasourceMetadata: any): ProcessedDeferredDatasource | null {
    if (!datasourceMetadata?.datasource?.name) return null;

    const { parameters, propertyForDisplayText, propertyForValue } = datasourceMetadata.datasource;

    const displayProp = propertyForDisplayText?.startsWith('@P')
      ? propertyForDisplayText.substring(3)
      : propertyForDisplayText;

    const valueProp = propertyForValue?.startsWith('@P')
      ? propertyForValue.substring(3)
      : propertyForValue;

    const columns = [
      {
        key: 'true',
        setProperty: 'Associated property',
        value: valueProp
      },
      {
        display: 'true',
        primary: 'true',
        useForSearch: true,
        value: displayProp
      }
    ];

    return {
      listType: 'datapage',
      datasource: datasourceMetadata.datasource.name,
      parameters: this.flattenParameters(parameters),
      columns
    };
  }

  /**
   * Generates columns and datasource from config props
   */
  generateColumnsAndDataSource(
    configDatasource: any,
    configColumns: any[],
    deferDatasource: boolean,
    datasourceMetadata: any
  ): ColumnsAndDataSource & { listType?: string; parameters?: Record<string, any> } {
    // Process deferDatasource when datapage name is present
    if (deferDatasource && datasourceMetadata?.datasource?.name) {
      const processed = this.processDeferredDatasource(datasourceMetadata);
      if (processed) {
        return {
          columns: processed.columns,
          datasource: processed.datasource,
          listType: processed.listType,
          parameters: processed.parameters
        };
      }
    }

    return {
      columns: configColumns,
      datasource: configDatasource
    };
  }
}
