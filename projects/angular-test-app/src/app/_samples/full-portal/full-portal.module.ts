import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FullPortalRoutingModule } from './full-portal-routing.module';

import { ComponentMapperComponent } from 'packages/angular-sdk-components/src/lib/_bridge/component-mapper/component-mapper.component';

import { FullPortalComponent } from './components/full-portal/full-portal.component';

@NgModule({
  declarations: [FullPortalComponent],
  imports: [ComponentMapperComponent, CommonModule, FullPortalRoutingModule, MatProgressSpinnerModule]
})
export class FullPortalModule {}
