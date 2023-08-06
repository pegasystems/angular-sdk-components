import { Component, ComponentRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SdkComponentMap } from '../helpers/sdk_component_map';
import { ErrorBoundaryComponent } from '../../_components/infra/error-boundary/error-boundary.component';

@Component({
  selector: 'component-mapper',
  templateUrl: './component-mapper.component.html',
  styleUrls: ['./component-mapper.component.scss'],
  standalone: true,
  imports: [CommonModule, ErrorBoundaryComponent]
})
export class ComponentMapperComponent implements OnInit, OnChanges {
  @ViewChild('dynamicComponent', { read: ViewContainerRef, static: true })
  public dynamicComponent: ViewContainerRef | undefined;

  public componentRef: ComponentRef<any> | undefined;
  public isInitialized: boolean = false;

  @Input() name: string = '';
  @Input() props: any;
  @Input() errorMsg: string = '';
  @Input() outputEvents: any;
  // parent prop is compulsory when outputEvents is present
  @Input() parent: any;

  constructor() {}

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
    if (SdkComponentMap) {
      let component: any;

      const theLocalComponent = SdkComponentMap.getLocalComponentMap()[this.name];
      if (theLocalComponent) {
        console.log(`component_mapper found ${this.name}: Local`);
        component = theLocalComponent;
      } else {
        const thePegaProvidedComponent = SdkComponentMap.getPegaProvidedComponentMap()[this.name];
        if (thePegaProvidedComponent !== undefined) {
          console.log(`component_mapper found ${this.name}: Pega-provided`);
          component = thePegaProvidedComponent;
        } else {
          console.error(`component_mapper doesn't have an entry for type ${this.name}`);
          component = ErrorBoundaryComponent;
        }
      }

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
    } else {
      // We no longer handle the "old" switch statement that was here in the original packaging.
      //  All components seen here need to be in the SdkComponentMap
      console.error(`SdkComponentMap not defined! Unable to process component: ${this.name}`);
    }
  }

  bindInputProps() {
    try {
      for (const propName in this.props) {
        if (this.props[propName] !== undefined) {
          this.componentRef.setInput(propName, this.props[propName]);
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  bindOutputEvents() {
    try {
      for (const event in this.outputEvents) {
        this.componentRef.instance[event].subscribe((value) => {
          const callbackFn = this.outputEvents[event].bind(this.parent);
          callbackFn(value);
        });
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
