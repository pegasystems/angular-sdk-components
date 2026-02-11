import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  imports: [CommonModule, MatIconModule]
})
export class AlertComponent {
  @Input() message: any[];
  @Input() severity;
  @Input() hideClose;
  @Output() onClose: EventEmitter<any> = new EventEmitter();

  getMatIcon(severity) {
    let variant;
    switch (severity) {
      case 'error':
        variant = 'error_outline';
        break;
      case 'warning':
        variant = 'warning_amber';
        break;
      case 'success':
        variant = 'task_alt';
        break;
      case 'info':
        variant = 'info_outline';
        break;
      default:
        break;
    }
    return variant;
  }

  onCloseClick() {
    alert('Close clicked');
    this.onClose.emit({ Page: 'Page', target: 'target', type: 'type' });
  }
}
