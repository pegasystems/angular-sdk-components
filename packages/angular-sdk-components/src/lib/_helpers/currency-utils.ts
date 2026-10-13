import { currencyMap } from './formatters/currency-map';
import { getLocale } from './formatters/common';
import { isValidCurrency } from './formatters/format-utils';
import { handleEvent } from './event-util';

export const getCurrencyOptions = (inISOCode: string) => {
  const operatorLocale = PCore.getEnvironmentInfo().getUseLocale() || PCore.getEnvironmentInfo().getLocale() || 'en-US';

  let currMapToUse;
  let localeToUse = operatorLocale;

  // Determine CurrencyMap lookup based on ISO code (if specified).
  //  If no ISO code, use locale
  //  If no locale, default to US
  if (inISOCode) {
    if (inISOCode === 'EUR') {
      currMapToUse = currencyMap.NL;
      localeToUse = 'nl-NL';
    } else {
      // For all other ISO codes, use first 2 characters as the lookup from CurrencyMap
      const countryCode = inISOCode.substring(0, 2);
      currMapToUse = currencyMap[countryCode];
    }
  } else if (operatorLocale) {
    // No ISO Code so check for operator locale (and force upper case for lookup)
    const countryCode = operatorLocale.substring(3).toUpperCase();
    currMapToUse = currencyMap[countryCode];
  } else {
    // no ISO code and no operator locale, default to US
    currMapToUse = currencyMap.US;
  }

  // If no currMapToUse at this point, default to US as a failsafe
  if (!currMapToUse) {
    currMapToUse = currencyMap.US;
  }

  const theCode = currMapToUse.currencyCode.substring(0, 3);
  return { locale: localeToUse, style: 'currency', currency: theCode };
};

export const getCurrencyCharacters = (inISOCode: string) => {
  const theCurrencyChars = {
    theCurrencySymbol: '$',
    theDecimalIndicator: '.',
    theDigitGroupSeparator: ','
  };

  const theCurrencyOptions = getCurrencyOptions(inISOCode);
  const parts = new Intl.NumberFormat(theCurrencyOptions.locale, {
    style: 'currency',
    currency: theCurrencyOptions.currency
  }).formatToParts(1234.56);
  const integerIndex = parts.findIndex(part => part.type === 'integer');
  const currencyPrefix = parts
    .slice(0, Math.max(integerIndex, 0))
    .map(part => part.value)
    .join('');
  const currencyPart = parts.find(part => part.type === 'currency');

  theCurrencyChars.theCurrencySymbol = currencyPrefix || currencyPart?.value || theCurrencyChars.theCurrencySymbol;
  theCurrencyChars.theDigitGroupSeparator = parts.find(part => part.type === 'group')?.value || theCurrencyChars.theDigitGroupSeparator;
  theCurrencyChars.theDecimalIndicator = parts.find(part => part.type === 'decimal')?.value || theCurrencyChars.theDecimalIndicator;

  return theCurrencyChars;
};

/*
 * Helpers below mirror the Constellation DX number fields (Currency, Decimal, Integer, Percentage)
 * and the Cosmos NumberInput / CurrencyInput / NumberDisplay / CurrencyDisplay they render.
 */

export interface NumberInputFormat {
  prefix: string;
  suffix: string;
  thousandSeparator: string;
  decimalSeparator: string;
}

export interface CurrencyDisplayOptions {
  currencyDisplay?: 'symbol' | 'code' | 'name';
  negative?: 'minus-sign' | 'parentheses';
  notation?: 'standard' | 'compact';
  fractionDigits?: number;
}

interface NumberDisplayOptions {
  fractionDigits?: number;
  groupSeparators?: boolean;
  notation?: 'standard' | 'compact';
  unit?: string;
}

const isEmptyValue = (value: any) => value === null || value === undefined || value === '';

const getInputFormat = (options: Intl.NumberFormatOptions): NumberInputFormat => {
  const parts = new Intl.NumberFormat(getLocale(), {
    ...options,
    numberingSystem: 'latn',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).formatToParts(1234.5);
  const types = parts.map(part => part.type);
  const firstNumberIndex = types.indexOf('integer');
  const lastNumberIndex = Math.max(types.lastIndexOf('integer'), types.lastIndexOf('fraction'));
  const join = (list: Intl.NumberFormatPart[]) => list.map(part => part.value).join('');

  return {
    prefix: join(parts.slice(0, firstNumberIndex)),
    suffix: join(parts.slice(lastNumberIndex + 1)),
    thousandSeparator: parts.find(part => part.type === 'group')?.value ?? ',',
    decimalSeparator: parts.find(part => part.type === 'decimal')?.value ?? '.'
  };
};

// Cosmos CurrencyInput: operator locale + configured ISO code, symbol placed where the locale puts it
export const getCurrencyInputFormat = (currencyISOCode: string | undefined, alwaysShowISOCode = false, allowDecimals = true) => {
  const currency = currencyISOCode && isValidCurrency(currencyISOCode) ? currencyISOCode : undefined;
  const options: Intl.NumberFormatOptions = currency ? { style: 'currency', currency, currencyDisplay: alwaysShowISOCode ? 'code' : 'symbol' } : {};
  const currencyFractionDigits = currency ? (new Intl.NumberFormat(getLocale(), options).resolvedOptions().minimumFractionDigits ?? 0) : 2;

  return { ...getInputFormat(options), precision: allowDecimals ? currencyFractionDigits : 0 };
};

// Cosmos NumberInput: operator locale separators; unit 'percent' places the % sign where the locale puts it
export const getNumberInputFormat = (unit?: string): NumberInputFormat => getInputFormat(unit ? { style: 'unit', unit } : {});

// Converts masked input text (e.g. "-1 234,50 kr") into a plain number string ("-1234.50")
export const parseFormattedNumber = (text: string | null | undefined, inputFormat: NumberInputFormat): string => {
  const { prefix, suffix, thousandSeparator, decimalSeparator } = inputFormat;
  let value = text ?? '';
  if (prefix) value = value.replace(prefix, '');
  if (suffix) value = value.replace(suffix, '');
  if (thousandSeparator) value = value.split(thousandSeparator).join('');
  if (decimalSeparator !== '.') value = value.split(decimalSeparator).join('.');
  return value.replace(/[^\d.-]/g, '');
};

// DX number fields save a number (or '' when cleared) and only when the value actually changed
export const saveNumberOnBlur = (pConn: typeof PConnect, newValue: number | '', currentValue: any) => {
  const previous = isEmptyValue(currentValue) ? '' : Number(currentValue);
  if (newValue === previous) {
    if (newValue === '') pConn.getValidationApi().validate('');
    return;
  }
  handleEvent(pConn.getActionsApi(), 'changeNblur', pConn.getStateProps().value, newValue);
};

// DX Decimal/Percentage pass a fallback of 2 for non-blank invalid values; Integer/Currency pass none
export const parseDecimalPrecision = (decimalPrecision: any, invalidFallback?: number): number | undefined => {
  const parsed = parseInt(decimalPrecision, 10);
  if (!Number.isNaN(parsed)) return parsed;
  return isEmptyValue(decimalPrecision) ? undefined : invalidFallback;
};

const getCurrencyDisplayFractionDigits = (currencyDecimalPrecision: any = 'auto'): number | undefined => {
  if (currencyDecimalPrecision === 'auto') return undefined;
  const parsed = parseInt(currencyDecimalPrecision, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const isPercentageStoredAsDecimal = (): boolean => !!PCore.getFieldDefaultUtils?.()?.fieldDefaults?.['Percentage']?.['storePercentageAsDecimal'];

export const percentageToDecimals = (percentage: number, precision = 2) => Number((percentage / 100).toFixed(precision + 2));

export const decimalsToPercentage = (decimal: number, precision = 2) => Number((decimal * 100).toFixed(precision));

// Cosmos NumberDisplay
const formatNumberForDisplay = (
  value: any,
  { fractionDigits, groupSeparators = true, notation = 'standard', unit }: NumberDisplayOptions = {}
): string => {
  if (isEmptyValue(value)) return '';
  const digits = fractionDigits ?? String(value).split('.')[1]?.length ?? 0;

  return new Intl.NumberFormat(getLocale(), {
    notation,
    useGrouping: groupSeparators,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    numberingSystem: 'latn',
    ...(unit ? { style: 'unit', unit } : {})
  }).format(Number(value));
};

// Cosmos CurrencyDisplay (accounting negatives always use standard notation, as in the DX components)
const formatCurrencyForDisplay = (
  value: any,
  currencyISOCode: string | undefined,
  { currencyDisplay = 'symbol', negative = 'minus-sign', notation = 'standard', fractionDigits }: CurrencyDisplayOptions = {}
): string => {
  if (isEmptyValue(value)) return '';

  const options: Intl.NumberFormatOptions | undefined =
    currencyISOCode && isValidCurrency(currencyISOCode)
      ? {
          style: 'currency',
          currency: currencyISOCode,
          currencyDisplay,
          useGrouping: true,
          notation: negative === 'parentheses' ? 'standard' : notation,
          currencySign: negative === 'parentheses' ? 'accounting' : 'standard',
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits
        }
      : undefined;

  return new Intl.NumberFormat(getLocale(), options).format(Number(value));
};

export type NumberFieldType = 'Currency' | 'Decimal' | 'Integer' | 'Percentage';

export interface NumberFieldDisplayProps {
  formatter?: string;
  currencyISOCode?: string;
  decimalPrecision?: number | string;
  showGroupSeparators?: boolean | string;
  currencyDisplay?: CurrencyDisplayOptions['currencyDisplay'];
  negative?: CurrencyDisplayOptions['negative'];
  notation?: CurrencyDisplayOptions['notation'];
  currencyDecimalPrecision?: string;
}

const toBoolean = (value: any, defaultValue: boolean): boolean => {
  if (value === undefined || value === null) return defaultValue;
  return typeof value === 'string' ? value.toLowerCase() === 'true' : !!value;
};

// Read-only value of the DX Currency/Decimal/Integer/Percentage fields, per the field's "Format" setting.
// For Percentage, pass the value already converted to a percentage (see decimalsToPercentage).
export const formatNumberFieldForDisplay = (fieldType: NumberFieldType, value: any, configProps: NumberFieldDisplayProps): string => {
  const { formatter, currencyISOCode, decimalPrecision, showGroupSeparators, notation, currencyDisplay, negative, currencyDecimalPrecision } =
    configProps;
  const numberOfDecimals = parseDecimalPrecision(decimalPrecision, fieldType === 'Decimal' || fieldType === 'Percentage' ? 2 : undefined);
  // DX Currency ignores showGroupSeparators; DX Percentage defaults it to off
  const groupSeparators = fieldType === 'Currency' || toBoolean(showGroupSeparators, fieldType !== 'Percentage');
  const currencyOptions: CurrencyDisplayOptions = {
    currencyDisplay,
    negative,
    notation,
    fractionDigits: getCurrencyDisplayFractionDigits(currencyDecimalPrecision)
  };

  if (fieldType === 'Percentage') {
    return formatNumberForDisplay(value, { fractionDigits: numberOfDecimals, groupSeparators, unit: 'percent' });
  }

  switch (formatter) {
    case 'Currency':
    case 'Currency-Code':
    case 'Currency-Compact':
      if (fieldType === 'Integer') {
        currencyOptions.currencyDisplay = formatter === 'Currency-Code' ? 'code' : currencyDisplay;
        currencyOptions.notation = formatter === 'Currency-Compact' ? 'compact' : notation;
      }
      return formatCurrencyForDisplay(value, currencyISOCode, currencyOptions);
    case 'Integer':
      return formatNumberForDisplay(value, { fractionDigits: 0, groupSeparators, notation });
    case 'Decimal':
      return formatNumberForDisplay(value, { fractionDigits: numberOfDecimals, groupSeparators, notation });
    case 'Decimal-Auto':
      return formatNumberForDisplay(value, { fractionDigits: Number.isInteger(Number(value)) ? 0 : 2, groupSeparators, notation });
    case 'Percentage': {
      const percentValue = fieldType === 'Decimal' && isPercentageStoredAsDecimal() && value ? Number(value) * 100 : value;
      // DX Currency keeps group separators here; DX Decimal and Integer turn them off
      return formatNumberForDisplay(percentValue, {
        fractionDigits: numberOfDecimals,
        groupSeparators: fieldType === 'Currency',
        notation,
        unit: 'percent'
      });
    }
    default:
      if (fieldType === 'Currency') {
        return formatCurrencyForDisplay(value, currencyISOCode, currencyOptions);
      }
      return formatNumberForDisplay(value, { fractionDigits: fieldType === 'Integer' ? 0 : numberOfDecimals, groupSeparators, notation });
  }
};
