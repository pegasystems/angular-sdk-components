export function getLocale(locale='') {
    // use locale if specified
    if (locale) return locale;
    // otherwise, use operator locale if it's defined
    if (window.PCore?.getEnvironmentInfo().getLocale()) return window.PCore.getEnvironmentInfo().getLocale();
    // fallback
    return Intl.DateTimeFormat().resolvedOptions().locale;
  }
  
  export function getCurrentTimezone(timezone="America/New_York") {
    if (timezone) return timezone;
    return window.PCore?.getLocaleUtils?.().getTimeZoneInUse?.();
  }
  