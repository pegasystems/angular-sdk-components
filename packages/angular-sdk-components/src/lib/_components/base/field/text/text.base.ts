import { Directive, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { AngularPConnectData, AngularPConnectService } from '../../../../_bridge/angular-pconnect';
import { Utils } from '../../../../_helpers/utils';
import { PConnFieldProps } from '../../../../_types/PConnProps.interface';

interface TextProps extends PConnFieldProps {
  // If any, enter additional props that only exist on Text here
}

@Directive()
export class TextBase implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;
  @Input() formatAs$: string;

  protected angularPConnect = inject(AngularPConnectService);
  protected utils = inject(Utils);

  angularPConnectData: AngularPConnectData = {};
  configProps$: TextProps;

  label$ = '';
  value$ = '';
  bRequired$ = false;
  bReadonly$ = false;
  bDisabled$ = false;
  bVisible$ = true;
  displayMode$?: string = '';
  controlName$: string;
  formattedValue$: string;
  format$ = 'text';
  formattedUrl$ = '';

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);

    // Then, continue on with other initialization

    // call updateSelf when initializing
    this.checkAndUpdate();
  }

  ngOnDestroy(): void {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  // Callback passed when subscribing to store change
  onStateChange() {
    this.checkAndUpdate();
  }

  checkAndUpdate(): void {
    if (this.angularPConnect.shouldComponentUpdate(this)) {
      this.updateSelf();
    }
  }

  /**
   * Updates the component's properties based on the configuration.
   */
  updateSelf(): void {
    // Resolve config properties
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as TextProps;

    // Extract properties from config props
    const { displayMode = '', value, visibility = true } = this.configProps$;

    this.value$ = value ?? '';
    this.bVisible$ = this.utils.getBooleanValue(visibility);
    this.label$ = this.configProps$.label;
    this.displayMode$ = displayMode;

    this.formattedValue$ = this.formatValue(this.value$, this.formatAs$);
  }

  formatValue(value: string, formatAs: string): string {
    switch (formatAs) {
      case 'text':
        return value;
      case 'date':
        return this.generateDate(value);
      case 'date-time':
        return this.generateDateTime(value);
      case 'time':
        return this.formatTime(value);
      case 'url':
        this.formattedUrl$ = this.generateUrl(value);
        return value;
      default:
        return '';
    }
  }

  formatTime(value: string): string {
    if (!value) return '';
    const [hours, minutes] = value.split(':');
    return `${hours}:${minutes}`;
  }

  generateUrl(value: string): string {
    return value.startsWith('http://') || value.startsWith('https://') ? value : `http://${value}`;
  }

  generateDate(value: string): string {
    return value ? this.utils.generateDate(value, 'Date-Long-Custom-YYYY') : '';
  }

  generateDateTime(value: string): string {
    if (!value) return '';

    return value.length === 10 ? this.generateDate(value) : this.utils.generateDateTime(value.slice(0, -1), 'DateTime-Long-YYYY-Custom');
  }
}
