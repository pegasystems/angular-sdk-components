import { Component, ComponentRef, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SdkComponentMap } from '../helpers/sdk_component_map';
import { ErrorBoundaryComponent } from '../../_components/infra/ErrorBoundary/error-boundary.component';

@Component({
  selector: 'app-component-mapper',
  templateUrl: './component-mapper.component.html',
  styleUrls: ['./component-mapper.component.scss'],
  standalone: true,
  imports: [CommonModule, ErrorBoundaryComponent]
})
export class ComponentMapperComponent implements OnInit {
  @ViewChild('dynamicComponent', { read: ViewContainerRef, static: true })
  public dynamicComponent: ViewContainerRef | undefined;

  public componentRef: ComponentRef<any> | undefined;

  @Input() type: string = '';
  @Input() props: any;
  @Input() errorMsg: string = '';

  constructor() {}

  ngOnInit(): void {
    if (SdkComponentMap) {
      let component: any;

      const theLocalComponent = SdkComponentMap.getLocalComponentMap()[this.type];
      if (theLocalComponent) {
        console.log(`component_mapper found ${this.type}: Local`);
        component = theLocalComponent;
      } else {
        const thePegaProvidedComponent = SdkComponentMap.getPegaProvidedComponentMap()[this.type];
        if (thePegaProvidedComponent !== undefined) {
          console.log(`component_mapper found ${this.type}: Pega-provided`);
          component = thePegaProvidedComponent;
        } else {
          console.error(`component_mapper doesn't have an entry for type ${this.type}`);
          component = ErrorBoundaryComponent;
        }
      }
      if (this.dynamicComponent) {
        this.dynamicComponent.clear();
        this.componentRef = this.dynamicComponent.createComponent(component);

        if (component === ErrorBoundaryComponent) {
          this.componentRef.instance.message = this.errorMsg;
        } else {
          for (let propName in this.props) {
            if (this.props[propName] !== undefined) {
              this.componentRef.instance[propName] = this.props[propName];
            }
          }
        }
      }
    } else {
      // We no longer handle the "old" switch statement that was here in the original packaging.
      //  All components seen here need to be in the SdkComponentMap
      console.error(`SdkComponentMap not defined! Unable to process component: ${this.type}`);
    }
  }
}
