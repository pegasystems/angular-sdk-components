//  This file is adapted from Nebula/Constellation components/Templates/utils.js

export function getAllFields(pConnect: any) {
  const metadata = pConnect.getRawMetadata();
  let allFields = [];
  if (metadata.children && metadata.children.map) {
    allFields = metadata.children.map(fields => {
      const children = fields.children instanceof Array ? fields.children : [];
      return children.map(field => field.config);
    });
  }
  return allFields;
}

export function filterForFieldValueList(fields: any) {
  return fields
    .filter(({ visibility }) => visibility !== false)
    .map(({ value, label }) => ({
      id: label.toLowerCase(),
      name: label,
      value
    }));
}

/**
 * This method evaluates whether a row action is allowed based on the provided conditions.
 * @param {string|boolean|undefined} allowRowDelete - The condition for allowing row deletion.
 * @param {object} rowData - The data of the row being evaluated.
 * @returns {boolean} - Returns true if the row action is allowed, false otherwise.
 */
export const evaluateAllowRowAction = (allowRowDelete, rowData) => {
  if (allowRowDelete === undefined || allowRowDelete === true) return true;
  if (allowRowDelete.startsWith?.('@E ')) {
    const expression = allowRowDelete.replace('@E ', '');
    // @ts-ignore - Expected 3 arguments, but got 2
    return PCore.getExpressionEngine().evaluate(expression, rowData);
  }
  return false;
};
