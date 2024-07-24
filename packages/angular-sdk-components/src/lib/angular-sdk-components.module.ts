import { NgModule } from '@angular/core';
import { AngularSdkComponentsComponent } from './angular-sdk-components.component';
import { FlowContainerBaseComponent } from './_components/infra/Containers/flow-container-base/flow-container-base.component';

@NgModule({
  declarations: [AngularSdkComponentsComponent, FlowContainerBaseComponent],
  imports: [],
  exports: [AngularSdkComponentsComponent]
})
export class AngularSdkComponentsModule {}
