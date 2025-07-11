import { getLocale } from '../common';
import { currencyMap } from './currency-map';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function NumberFormatter(value, { locale = 'en-US', decPlaces = 2, style = '', currency = 'USD' } = {}) {
  const currentLocale = getLocale(locale);
  if (value !== null && value !== undefined) {
    return Number(value).toLocaleString(currentLocale, {
      minimumFractionDigits: decPlaces,
      maximumFractionDigits: decPlaces
    });
  }
  return value;
}

function CurrencyFormatter(
  value,
  { symbol = true, position = 'before', locale = 'en-US', decPlaces = 2, style = 'currency', currency = 'USD' } = {}
) {
  const currentLocale = getLocale(locale);
  let formattedValue = value;
  if (value !== null && value !== undefined && value !== '') {
    formattedValue = NumberFormatter(value, {
      locale: currentLocale,
      decPlaces,
      style,
      currency
    });

    // For currency other than EUR, we need to determine the country code from currency code
    // If currency is EUR, we use the locale to determine the country code
    let countryCode: string | undefined;
    if (currency !== 'EUR') {
      countryCode = currency.substring(0, 2);
    } else {
      countryCode = currentLocale?.split('-')[1].toUpperCase();
    }

    // If countryCode is still undefined, setting it as US
    if (!countryCode) {
      countryCode = 'US';
    }

    let code;
    if (symbol) {
      code = currencyMap[countryCode]?.symbolFormat;
    } else {
      code = currencyMap[countryCode]?.currencyCode;
    }

    // if position is provided, change placeholder accordingly.
    if (position && code) {
      if (position.toLowerCase() === 'before' && code.startsWith('{#}')) {
        code = code.slice(3) + code.slice(0, 3);
      } else if (position.toLowerCase() === 'after' && code.endsWith('{#}')) {
        code = code.slice(-3) + code.slice(0, -3);
      }
    }
    return code?.replace('{#}', formattedValue) || formattedValue;
  }
  return formattedValue;
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
