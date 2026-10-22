import { Injectable, signal } from '@angular/core';

const DEFAULT_LANGUAGE = 'en-US';

@Injectable({ providedIn: 'root' })
export class CustomerSupportLanguageService {
  readonly languages = [
    { value: DEFAULT_LANGUAGE, label: 'English' },
    { value: 'fr-CA', label: 'French' },
    { value: 'cy-GB', label: 'Welsh' }
  ];

  private readonly currentLanguage = signal(DEFAULT_LANGUAGE);
  readonly language = this.currentLanguage.asReadonly();

  private resourcesLoaded?: Promise<void>;

  loadResources(): Promise<void> {
    const locales = this.languages.map(lang => lang.value).filter(locale => locale !== DEFAULT_LANGUAGE);
    this.resourcesLoaded ??= PCore.getLocaleUtils()
      .loadLocaleResources(locales)
      .catch(error => {
        this.resourcesLoaded = undefined;
        throw error;
      });
    return this.resourcesLoaded;
  }

  setLanguage(locale: string): void {
    PCore.getEnvironmentInfo().setLocale(locale);
    this.currentLanguage.set(locale);
  }

  resetLanguage(): void {
    if (this.currentLanguage() !== DEFAULT_LANGUAGE) this.setLanguage(DEFAULT_LANGUAGE);
  }
}
