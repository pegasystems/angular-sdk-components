import dayjs from 'dayjs';

export function getLocale(locale = ''): string | undefined {
  // use locale if specified
  if (locale) return locale;
  // otherwise, use operator locale if it's defined
  if (PCore?.getEnvironmentInfo().getLocale()) return PCore.getEnvironmentInfo().getLocale();
  // fallback
  return Intl.DateTimeFormat().resolvedOptions().locale;
}

export function getCurrentTimezone(timezone = 'America/New_York') {
  if (timezone) return timezone;
  return PCore?.getLocaleUtils?.().getTimeZoneInUse?.();
}

export function getSeconds(sTime): any {
  return dayjs(sTime).valueOf();
}
