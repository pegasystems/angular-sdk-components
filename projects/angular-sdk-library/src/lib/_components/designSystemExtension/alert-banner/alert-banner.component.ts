import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-alert-banner',
  templateUrl: './alert-banner.component.html',
  styleUrls: ['./alert-banner.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class AlertBannerComponent implements OnInit {
  @Input() banners: any[];
 
  SEVERITY_MAP = {
    urgent: 'error',
    warning: 'warning',
    success: 'success',
    info: 'info'
  };

  ngOnInit(): void {}

  onAlertClose(config) {
    const { PAGE, type, target } = config;
    const { clearMessages } = PCore.getMessageManager();
    clearMessages({ category: PAGE, type, context: target } as any);
  }
}
