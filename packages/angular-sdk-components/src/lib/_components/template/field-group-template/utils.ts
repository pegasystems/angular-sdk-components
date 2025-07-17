export const evaluateAllowRowAction = (allowRowDelete, rowData) => {
  if (allowRowDelete === undefined || allowRowDelete === true) return true;
  if (allowRowDelete.startsWith?.('@E ')) {
    const expression = allowRowDelete.replace('@E ', '');
    // @ts-ignore
    return PCore.getExpressionEngine().evaluate(expression, rowData);
  }
  return false;
};
