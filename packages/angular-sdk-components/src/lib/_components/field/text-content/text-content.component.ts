import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface TextContentProps extends PConnFieldProps {
  // If any, enter additional props that only exist on TextContent here
  content: string;
  displayAs: 'Paragraph' | 'Heading 1' | 'Heading 2' | 'Heading 3' | 'Heading 4';
}

@Component({
  selector: 'app-text-content',
  templateUrl: './text-content.component.html',
  styleUrls: ['./text-content.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class TextContentComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;

  // Used with AngularPConnect
  angularPConnectData: AngularPConnectData = {};
  configProps$: TextContentProps;

  content$ = '';
  displayAs$: string;
  displayMode$?: string = '';
  bVisible$ = true;

  constructor(
    private angularPConnect: AngularPConnectService,
    private utils: Utils
  ) {}

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);

    // Then, continue on with other initialization

    // call updateSelf when initializing
    // this.updateSelf();
    this.checkAndUpdate();
  }

  ngOnDestroy(): void {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  // updateSelf
  updateSelf(): void {
    // moved this from ngOnInit() and call this from there instead...
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as TextContentProps;
    if (this.configProps$.content != undefined) {
      this.content$ = this.configProps$.content;
    }
    if (this.configProps$.displayAs != undefined) {
      this.displayAs$ = this.configProps$.displayAs;
    }
    this.displayMode$ = this.configProps$.displayMode;

    if (this.configProps$.visibility != null) {
      this.bVisible$ = this.utils.getBooleanValue(this.configProps$.visibility);
    }

    // Any update to content or displayAs will re-render this component.
    //  All rendering logic is in the .html file.
  }

  // Callback passed when subscribing to store change
  onStateChange() {
    this.checkAndUpdate();
  }

  checkAndUpdate() {
    // Should always check the bridge to see if the component should
    // update itself (re-render)
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);

    // ONLY call updateSelf when the component should update
    if (bUpdateSelf) {
      this.updateSelf();
    }
  }
}
