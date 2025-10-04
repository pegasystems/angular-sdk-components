import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { endpoints } from '../../../../packages/angular-sdk-components/src/lib/_services/endpoints';

const routes: Routes = [
  ...['', endpoints.EMBEDDED, endpoints.EMBEDDEDHTML, endpoints.MASHUP, endpoints.MASHUPHTML].map(path => ({
    path,
    loadChildren: () => import('./_samples/embedded/embedded.module').then(m => m.EmbeddedModule)
  })),

  ...[endpoints.PORTAL, endpoints.PORTALHTML, endpoints.FULLPORTAL, endpoints.FULLPORTALHTML].map(path => ({
    path,
    loadChildren: () => import('./_samples/full-portal/full-portal.module').then(m => m.FullPortalModule)
  })),

  ...[endpoints.SIMPLEPORTAL, endpoints.SIMPLEPORTALHTML].map(path => ({
    path,
    loadChildren: () => import('./_samples/simple-portal/simple-portal.module').then(m => m.SimplePortalModule)
  }))
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
