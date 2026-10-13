import { getLocale } from '../common';
import get from 'lodash.get';

interface CurrencyFormatOptions {
  locale?: string;
  options?: Intl.NumberFormatOptions;
}

interface CurrencyFormatterOptions {
  symbol?: boolean;
  locale?: string;
  decPlaces?: number;
  currencyISOCode?: string;
  isoCodeSelection?: string;
  rowData?: unknown;
  notation?: Intl.NumberFormatOptions['notation'];
}

function NumberFormatter(value, { locale = 'en-US', decPlaces = 2 } = {}) {
  const currentLocale = getLocale(locale);
  if (value !== null && value !== undefined) {
    return Number(value).toLocaleString(currentLocale, {
      minimumFractionDigits: decPlaces,
      maximumFractionDigits: decPlaces
    });
  }
  return value;
}

export const isValidCurrency = (currency: string) => {
  try {
    new Intl.NumberFormat(undefined, { style: 'currency', currency });
    return true;
  } catch {
    return false;
  }
};

function getCodeForCurrencyCodeFormatter(currencyISOCode, rowData, isoCodeSelection = 'constant') {
  let code;
  currencyISOCode = currencyISOCode.replace('@P ', '');
  currencyISOCode = currencyISOCode.replace('@L ', '');
  if (isoCodeSelection === 'constant') {
    code = isValidCurrency(currencyISOCode) ? currencyISOCode : undefined;
  } else {
    // For ISOCodeSelection === 'propertyRef'
    currencyISOCode = currencyISOCode.indexOf('.') === 0 ? currencyISOCode.substring(1) : currencyISOCode;
    const resolvedCurrencyCode = get(rowData, currencyISOCode);
    code = typeof resolvedCurrencyCode === 'string' && isValidCurrency(resolvedCurrencyCode) ? resolvedCurrencyCode : undefined;
  }
  return code;
}

function formatCurrency(value: number | bigint, { locale, options }: CurrencyFormatOptions) {
  const formatter = new Intl.NumberFormat(locale, options);

  return formatter.format(value);
}

function CurrencyFormatter(
  value: number | bigint | string | null | undefined,
  { symbol = true, locale, decPlaces = 2, currencyISOCode, isoCodeSelection, rowData, notation }: CurrencyFormatterOptions = {}
) {
  // locale is used here only to format the values and not for deciding the symbol.
  // Currency symbol should be decided always from the configured ISO Code.
  // - If no code is configured, fallback to App-level setting or USD
  const currentLocale = getLocale(locale);
  if (value !== null && value !== undefined && value !== '') {
    // For All formats of currency, Cosmos API "formatCurrency" required Currency ISO code
    const code = currencyISOCode
      ? getCodeForCurrencyCodeFormatter(currencyISOCode, rowData, isoCodeSelection)
      : window.PCore?.getFieldDefaultUtils?.()?.fieldDefaults?.['Currency']?.['currencyISOCode'] || 'USD';

    const options: Intl.NumberFormatOptions | undefined = code
      ? {
          style: 'currency',
          currency: code,
          currencyDisplay: symbol ? 'symbol' : 'code',
          ...(notation === 'compact' ? { notation } : { minimumFractionDigits: decPlaces, maximumFractionDigits: decPlaces })
        }
      : undefined;

    return formatCurrency(typeof value === 'string' ? Number(value) : value, { locale: currentLocale, options });
  }
  return value;
}

function SymbolFormatter(value, { symbol = '$', suffix = true, locale = 'en-US' } = {}) {
  let formattedValue = value;
  if (value !== null && value !== undefined) {
    formattedValue = NumberFormatter(value, { locale });
    return suffix ? `${formattedValue}${symbol}` : `${symbol}${formattedValue}`;
  }
  return formattedValue;
}

export const formatters = {
  Currency: (value, options) => CurrencyFormatter(value, options),
  'Currency-Code': (value, options) => CurrencyFormatter(value, { ...options, symbol: false }),
  Decimal: (value, options) => NumberFormatter(value, options),
  'Decimal-Auto': (value, options) =>
    NumberFormatter(value, {
      ...options,
      decPlaces: Number.isInteger(value) ? 0 : 2
    }),
  Integer: (value, options) => NumberFormatter(value, { ...options, decPlaces: 0 }),
  Percentage: (value, options) => SymbolFormatter(value, { ...options, symbol: '%' })
};
