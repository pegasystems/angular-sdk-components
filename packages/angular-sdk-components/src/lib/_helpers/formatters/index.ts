import { BooleanFormatters } from './boolean';
import { CurrencyFormatters } from './currency';
import { DateFormatters } from './date';
import { getCurrentTimezone, getLocale } from './common';

export const CommonFormatters = {
  ...BooleanFormatters,
  ...CurrencyFormatters,
  ...DateFormatters
};

function getDateObject(text): Date {
  // TODO - cleanup formatters util functions as DX APIs are returning values per ISO std now.
  const timeStamp = text.replace(/-/g, '');
  const isDateTime = timeStamp.indexOf('GMT') !== -1;
  const year = parseInt(timeStamp.substr(0, 4), 10);
  const month = parseInt(timeStamp.substr(4, 2), 10) - 1;
  const day = parseInt(timeStamp.substr(6, 2), 10);

  const date = new Date();

  date.setDate(day);
  date.setMonth(month);
  date.setFullYear(year);

  if (isDateTime) {
    const hours = parseInt(timeStamp.substr(9, 2), 10);
    const minutes = parseInt(timeStamp.substr(11, 2), 10);
    const seconds = parseInt(timeStamp.substr(13, 2), 10);
    const ms = parseInt(timeStamp.substr(16, 3), 10);
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(seconds);
    date.setMilliseconds(ms);
  }

  return date;
}

function isIsoDate(str) {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
  const d = new Date(str);
  return d.toISOString() === str;
}

function parseDateInISO(value) {
  const isMilliSeconds = /^[0-9]+$/.exec(value);
  if (isMilliSeconds) {
    const date = new Date(parseInt(value, 10));
    return date.toISOString();
  }

  if (isIsoDate(value)) {
    const date = new Date(value);
    return date.toISOString();
  }

  return value ? getDateObject(value).toISOString() : value;
}

export function format(value, type, options = {}): string {
  let formattedValue: string;

  switch (type?.toLowerCase()) {
    case 'currency': {
      const defaultOptions = {
        locale: getLocale(),
        position: 'before',
        decPlaces: 2
      };
      const params = { ...defaultOptions, ...options };
      formattedValue = CurrencyFormatters.Currency(value, params);
      break;
    }

    case 'percentage': {
      const defaultOptions = { locale: getLocale(), decPlaces: 2 };
      const params = { ...defaultOptions, ...options };
      formattedValue = CurrencyFormatters.Percentage(value, params);
      break;
    }

    case 'decimal': {
      const defaultOptions = { locale: getLocale(), decPlaces: 2 };
      const params = { ...defaultOptions, ...options };
      formattedValue = CurrencyFormatters.Decimal(value, params);
      break;
    }

    case 'integer': {
      const defaultOptions = { locale: getLocale() };
      const params = { ...defaultOptions, ...options };
      formattedValue = CurrencyFormatters.Integer(value, params);
      break;
    }

    case 'date': {
      const defaultOptions = {
        format: 'MMM DD, YYYY',
        timezone: getCurrentTimezone()
      };
      const params = { ...defaultOptions, ...options };
      formattedValue = DateFormatters.Date(parseDateInISO(value), params);
      break;
    }

    case 'datetime': {
      const defaultOptions = {
        format: 'MMM DD, YYYY h:mm A',
        timezone: getCurrentTimezone()
      };
      const params = { ...defaultOptions, ...options };
      formattedValue = DateFormatters.Date(parseDateInISO(value), params);
      break;
    }

    case 'boolean':
    case 'checkbox': {
      formattedValue = BooleanFormatters.TrueFalse(value, { allowEmpty: false, ...options });
      break;
    }

    case 'userreference': {
      formattedValue = value.userName;
      break;
    }

    case 'timeonly': {
      const defaultOptions = {
        locale: getLocale(),
        format: 'hh:mm A',
        timezone: getCurrentTimezone()
      };
      const params = { ...defaultOptions, ...options };
      formattedValue = DateFormatters['Time-Only'](value, params);
      break;
    }

    default:
      formattedValue = value;
  }
  return formattedValue;
}
