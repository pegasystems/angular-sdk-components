import { Component, ComponentRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorBoundaryComponent } from '../../_components/infra/error-boundary/error-boundary.component';
import { getComponentClassAsync } from '../helpers/sdk_component_map';

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
  public lastLoadedName: string | undefined;

  @Input() name?: string = '';
  @Input() props: any;
  @Input() errorMsg = '';
  @Input() outputEvents: any;
  // parent prop is compulsory when outputEvents is present
  @Input() parent: any;

  private loadingToken = 0; // Guards against race conditions during rapid name changes

  ngOnInit(): void {
    // Begin async load (non-blocking) while preserving original synchronous signature
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

  // Backwards-compatible method name; now performs async dynamic import.
  loadComponent() {
    this.loadComponentAsync();
  }

  private async loadComponentAsync() {
    const requestedName = this.name || '';
    const token = ++this.loadingToken;

    // Prefer dynamic loader for lazy chunks; fallback to static map if not defined yet.
    let componentClass: any;
    try {
      componentClass = await getComponentClassAsync(requestedName);
    } catch (err) {
      console.error('Error loading component dynamically; falling back to static map', requestedName, err);
      componentClass = ErrorBoundaryComponent;
    }

    // If another async load started after this one, abandon this result.
    if (token !== this.loadingToken) {
      return;
    }

    if (this.dynamicComponent) {
      this.dynamicComponent.clear();
      this.componentRef = this.dynamicComponent.createComponent(componentClass);
      this.lastLoadedName = requestedName;

      if (componentClass === ErrorBoundaryComponent) {
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
