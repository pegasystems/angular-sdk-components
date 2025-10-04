import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

import { SimplePortalRoutingModule } from './simple-portal-routing.module';

import { ComponentMapperComponent } from 'packages/angular-sdk-components/src/lib/_bridge/component-mapper/component-mapper.component';
import { MainContentComponent } from './components/main-content/main-content.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { SideBarComponent } from './components/side-bar/side-bar.component';

@NgModule({
  declarations: [MainContentComponent, NavigationComponent, SideBarComponent],
  imports: [
    ComponentMapperComponent,
    CommonModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    SimplePortalRoutingModule
  ]
})
export class SimplePortalModule {}
