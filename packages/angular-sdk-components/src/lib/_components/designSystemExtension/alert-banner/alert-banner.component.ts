import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
    selector: 'app-alert-banner',
    templateUrl: './alert-banner.component.html',
    styleUrls: ['./alert-banner.component.scss'],
    imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class AlertBannerComponent {
  @Input() banners: any[];

  SEVERITY_MAP = {
    urgent: 'error',
    warning: 'warning',
    success: 'success',
    info: 'info'
  };

  onAlertClose(config) {
    const { PAGE, type, target } = config;
    const { clearMessages } = PCore.getMessageManager();
    clearMessages({ category: PAGE, type, context: target });
  }
}
