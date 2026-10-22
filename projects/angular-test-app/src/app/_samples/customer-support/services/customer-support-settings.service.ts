import { Injectable, computed, inject, signal } from '@angular/core';
import { CustomerSupportLanguageService } from './customer-support-language.service';

export interface CustomerSupportSettings {
  dynamicLocalization: boolean;
  refreshIndicator: boolean;
}

const STORAGE_KEY = 'customer-support-settings';
const DEFAULT_SETTINGS: CustomerSupportSettings = { dynamicLocalization: true, refreshIndicator: true };

@Injectable({ providedIn: 'root' })
export class CustomerSupportSettingsService {
  private readonly languageService = inject(CustomerSupportLanguageService);
  private readonly state = signal<CustomerSupportSettings>(readStoredSettings());

  readonly settings = this.state.asReadonly();
  readonly dynamicLocalization = computed(() => this.state().dynamicLocalization);
  readonly refreshIndicator = computed(() => this.state().refreshIndicator);

  async save(next: CustomerSupportSettings): Promise<void> {
    if (next.dynamicLocalization && !this.dynamicLocalization()) {
      await this.languageService.loadResources();
    } else if (!next.dynamicLocalization) {
      // The language picker is hidden when disabled, so don't leave the user stuck in another language
      this.languageService.resetLanguage();
    }

    this.state.set({ ...next });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage can be unavailable (e.g. private mode); settings still apply for this session
    }
  }
}

function readStoredSettings(): CustomerSupportSettings {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return {
      dynamicLocalization: typeof stored.dynamicLocalization === 'boolean' ? stored.dynamicLocalization : DEFAULT_SETTINGS.dynamicLocalization,
      refreshIndicator: typeof stored.refreshIndicator === 'boolean' ? stored.refreshIndicator : DEFAULT_SETTINGS.refreshIndicator
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}
