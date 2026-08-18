import { Component, OnInit, Input, forwardRef, OnDestroy, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

/**
 * WARNING: This file is part of the infrastructure component responsible for working with Redux and managing the creation and update of Redux containers and PConnect.
 * You may override Material components within this component if needed, but do not modify any container-related logic. Changing this logic can lead to unexpected behavior.
 */

@Component({
  selector: 'app-reference',
  templateUrl: './reference.component.html',
  styleUrls: ['./reference.component.scss'],
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class ReferenceComponent implements OnInit, OnDestroy, OnChanges {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: any;

  angularPConnectData: AngularPConnectData = {};
  viewComponentPConnect = signal<typeof PConnect | null>(null);

  constructor(private angularPConnect: AngularPConnectService) {}

  ngOnInit(): void {
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    this.updateSelf();
  }

  ngOnDestroy(): void {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const { pConn$ } = changes;
    if (!pConn$.firstChange && pConn$.previousValue !== pConn$.currentValue) {
      this.checkAndUpdate();
    }
  }

  onStateChange() {
    this.checkAndUpdate();
  }

  // Should always check the bridge to see if the component should update itself (re-render)
  checkAndUpdate() {
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);

    // ONLY call updateSelf when the component should update
    if (bUpdateSelf) {
      this.updateSelf();
    }
  }

  updateSelf() {
    const pConnect = this.pConn$;

    const resolvedConfigProps = pConnect.resolveConfigProps(pConnect.getConfigProps()) as {
      visibility?: boolean;
      context?: string;
      readOnly?: boolean;
      displayMode?: string;
    };

    const { visibility = true, context = '', readOnly = false, displayMode = '' } = resolvedConfigProps;

    const referenceConfig = { ...pConnect.getComponentConfig() };

    delete referenceConfig?.name;
    delete referenceConfig?.type;
    delete referenceConfig?.visibility;

    const viewMetadata: any = pConnect.getReferencedView();

    if (!viewMetadata) {
      this.viewComponentPConnect.set(null);
      return;
    }

    const viewObject = {
      ...viewMetadata,
      config: {
        ...viewMetadata.config,
        ...referenceConfig
      }
    };

    // @ts-expect-error - createComponent expects string but null is passed for unused parameters (matches React SDK pattern)
    const viewComponent: any = pConnect.createComponent(viewObject, null, null, {
      pageReference: context && context.startsWith('@CLASS') ? '' : context
    });

    if (referenceConfig.inheritedProps && referenceConfig.inheritedProps.length > 0) {
      const inheritedProps = pConnect.getInheritedProps();
      referenceConfig.inheritedProps = Object.keys(inheritedProps).map(prop => ({ prop, value: inheritedProps[prop] }));
    }

    const newCompPConnect = viewComponent.getPConnect();

    newCompPConnect.setInheritedConfig({
      ...referenceConfig,
      readOnly,
      displayMode
    });

    this.viewComponentPConnect.set(visibility !== false ? newCompPConnect : null);
  }
}
