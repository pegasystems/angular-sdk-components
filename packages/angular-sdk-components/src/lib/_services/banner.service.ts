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
    const localizedVal = PCore.getLocaleUtils().getLocaleValue;
    let validationErrors = PCore.getMessageManager().getValidationErrorMessages(itemKey) || [];
    // const completeProps = this.angularPConnect.getCurrentCompleteProps(this) as FlowContainerProps;
    validationErrors = validationErrors.map(item => ({ message: typeof item === 'string' ? item : `${item.label}: ${item.description}` }));
    // this.showPageMessages(completeProps);

    if (validationErrors.length) {
      this.banners = [{ messages: validationErrors?.map(msg => localizedVal(msg.message, 'Messages')), variant: 'urgent' }];
    } else {
      this.banners = [];
    }
  }
}
