import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  // Keyed by container item: a modal and the flow container behind it are rendered at the
  // same time, and each assignment must only show the errors raised against its own item.
  private bannersByItemKey: Record<string, any[]> = {};

  private static readonly noBanners: any[] = [];

  getBanners(itemKey: string): any[] {
    return this.bannersByItemKey[itemKey] ?? BannerService.noBanners;
  }

  clearBanners(itemKey: string) {
    delete this.bannersByItemKey[itemKey];
  }

  updateBanners(itemKey) {
    const localizedValue = PCore.getLocaleUtils().getLocaleValue;
    const validationErrors = PCore.getMessageManager().getValidationErrorMessages(itemKey) || [];
    const httpMessages = this.getHttpMessages(itemKey);

    const formattedErrors = [...validationErrors, ...httpMessages].map(error => {
      let message = '';

      if (typeof error === 'string') {
        message = error;
      } else {
        error.label = error.label.endsWith(':') ? error.label : `${error.label}:`;
        message = `${error.label} ${error.description}`;
      }

      return localizedValue(message, 'Messages');
    });

    if (formattedErrors.length) {
      this.bannersByItemKey[itemKey] = [{ messages: formattedErrors, variant: 'urgent' }];
    } else {
      this.clearBanners(itemKey);
    }
  }

  private getHttpMessages(key) {
    const httpMessages = PCore.getMessageManager().getMessages({
      context: key,
      category: 'HTTP'
    });

    return (httpMessages || []).map((msg: any) => msg.message);
  }
}
