import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FullPortalComponent } from './components/full-portal/full-portal.component';

const routes: Routes = [
  // Route to FullPortalComponent if path is '' (default path), 'portal', 'portalhtml', 'fullportal' or 'fullportalhtml'
  { path: '', component: FullPortalComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FullPortalRoutingModule {}
