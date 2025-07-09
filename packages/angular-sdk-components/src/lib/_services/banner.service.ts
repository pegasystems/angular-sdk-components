import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  banners: any[] = [];

  clearBanners() {
    this.banners = [];
  }

  updateBanners(itemKey) {
    const localizedValue = PCore.getLocaleUtils().getLocaleValue;
    const validationErrors = PCore.getMessageManager().getValidationErrorMessages(itemKey) || [];

    const formattedErrors = validationErrors.map(error => {
      let message = '';

      if (typeof error === 'string') {
        message = error;
      } else {
        error.label = error.label.endsWith(':') ? error.label : `${error.label}:`;
        message = `${error.label} ${error.description}`;
      }

      return localizedValue(message, 'Messages');
    });

    this.banners = formattedErrors.length ? [{ messages: formattedErrors, variant: 'urgent' }] : [];
  }
}
