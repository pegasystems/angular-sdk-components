import { ChangeDetectionStrategy, Component, Input, forwardRef } from '@angular/core';

import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-alert-banner',
  templateUrl: './alert-banner.component.html',
  styleUrls: ['./alert-banner.component.scss'],
  imports: [forwardRef(() => ComponentMapperComponent)]
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
