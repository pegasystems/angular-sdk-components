import { Component, ComponentRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getComponentFromMap } from '../helpers/sdk_component_map';
import { ErrorBoundaryComponent } from '../../_components/infra/error-boundary/error-boundary.component';

const componentsRequireDisplayOnlyFAProp: string[] = ['HybridViewContainer', 'ModalViewContainer', 'ViewContainer', 'RootContainer', 'View'];

@Component({
  selector: 'component-mapper',
  templateUrl: './component-mapper.component.html',
  styleUrls: ['./component-mapper.component.scss'],
  imports: [CommonModule]
})
export class ComponentMapperComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('dynamicComponent', { read: ViewContainerRef, static: true })
  public dynamicComponent: ViewContainerRef | undefined;

  public componentRef: ComponentRef<any> | undefined;
  public isInitialized = false;

  @Input() name?: string = '';
  @Input() props: any;
  @Input() errorMsg = '';
  @Input() outputEvents: any;
  // parent prop is compulsory when outputEvents is present
  @Input() parent: any;

  ngOnInit(): void {
    this.loadComponent();
    this.isInitialized = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    const { name } = changes;
    if (name) {
      const { previousValue, currentValue } = name;
      if (previousValue && previousValue !== currentValue) {
        this.loadComponent();
      }
    } else if (this.isInitialized) {
      this.bindInputProps();
    }
  }

  loadComponent() {
    const component = getComponentFromMap(this.name || '');

    if (this.dynamicComponent) {
      this.dynamicComponent.clear();
      this.componentRef = this.dynamicComponent.createComponent(component);

      if (component === ErrorBoundaryComponent) {
        this.componentRef.instance.message = this.errorMsg;
      } else {
        this.bindInputProps();
        this.bindOutputEvents();
      }
    }
  }

  bindInputProps() {
    try {
      if (this.props) {
        const propsKeys = Object.keys(this.props);
        const propsValues = Object.values(this.props);
        for (let i = 0; i < propsKeys.length; i++) {
          if (propsValues[i] !== undefined) {
            // We'll set 'displayOnlyFA$' prop only to the components which really need it
            // Eventual plan is to get rid of this particular prop
            if (propsKeys[i] === 'displayOnlyFA$' && !componentsRequireDisplayOnlyFAProp.includes(this.name || '')) {
              continue;
            }
            this.componentRef?.setInput(propsKeys[i], propsValues[i]);
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  bindOutputEvents() {
    try {
      if (this.outputEvents) {
        const propsKeys = Object.keys(this.outputEvents);
        const propsValues: any = Object.values(this.outputEvents);
        for (let i = 0; i < propsKeys.length; i++) {
          this.componentRef?.instance[propsKeys[i]].subscribe(value => {
            const callbackFn = propsValues[i].bind(this.parent);
            callbackFn(value);
          });
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  ngOnDestroy(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }
}
