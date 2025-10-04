import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmbeddedRoutingModule } from './embedded-routing.module';

import { HeaderComponent } from './components/header/header.component';
import { MainScreenComponent } from './components/main-screen/main-screen.component';
import { ResolutionScreenComponent } from './components/resolution-screen/resolution-screen.component';
import { ShoppingCardComponent } from './components/shopping-card/shopping-card.component';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ComponentMapperComponent } from 'packages/angular-sdk-components/src/public-api';
import { EmbeddedComponent } from './components/embedded/embedded.component';

@NgModule({
  declarations: [EmbeddedComponent, HeaderComponent, MainScreenComponent, ResolutionScreenComponent, ShoppingCardComponent],
  imports: [ComponentMapperComponent, CommonModule, EmbeddedRoutingModule, MatToolbarModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule]
})
export class EmbeddedModule {}
