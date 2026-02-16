import { Component, OnInit, Input, forwardRef, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

interface MultiReferenceReadOnlyProps {
  readonlyContextList: string;
  referenceList: string;
  label: string;
  hideLabel: boolean;
}

@Component({
  selector: 'app-multi-reference-readonly',
  templateUrl: './multi-reference-readonly.component.html',
  styleUrls: ['./multi-reference-readonly.component.scss'],
  imports: [forwardRef(() => ComponentMapperComponent)]
})
export class MultiReferenceReadonlyComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  angularPConnectData: AngularPConnectData = {};
  configProps$: MultiReferenceReadOnlyProps;
  label: string;
  newPConn: any;

  constructor(private angularPConnect: AngularPConnectService) {}

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    this.updateSelf();
  }

  ngOnDestroy(): void {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  onStateChange() {
    // Should always check the bridge to see if the component should
    // update itself (re-render)
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);
    // ONLY call updateSelf when the component should update
    if (bUpdateSelf) {
      this.updateSelf();
    }
  }

  updateSelf() {
    this.configProps$ = this.pConn$.getConfigProps() as MultiReferenceReadOnlyProps;
    this.label = this.configProps$.label;

    const config = (this.pConn$.getMetadata() as any)?.config;
    const { referenceList, readonlyContextList } = config;
    let readonlyContextObject;
    if (!PCore.getAnnotationUtils().isProperty(referenceList)) {
      readonlyContextObject = {
        referenceList: readonlyContextList
      };
    }
    const hideLabel = this.configProps$.hideLabel ?? false;
    this.newPConn = this.pConn$.createComponent(
      {
        type: 'SimpleTable',
        config: {
          ...config,
          ...readonlyContextObject,
          label: this.label,
          hideLabel
        }
      },
      '',
      0,
      {}
    );
  }
}
