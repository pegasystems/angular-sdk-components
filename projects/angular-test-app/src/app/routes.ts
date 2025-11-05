import { Routes } from '@angular/router';
import { endpoints } from 'packages/angular-sdk-components/src/public-api';

// Adding path to remove "Cannot match routes" error at launch
// Tried this at one point... Need to add /app in path now...
// const appName = PCore.getStore().getState().data.app.Application.pyLabel;
// Unfortunately, called before onPCoreReady...
//
// But we can get it from window.location.pathname

// const appName = window.location.pathname.split('/')[3];
export const routes: Routes = [
  { path: '', loadComponent: () => import('./_samples/embedded/embedded.component').then(m => m.EmbeddedComponent) },
  { path: endpoints.PORTAL, loadComponent: () => import('./_samples/full-portal/full-portal.component').then(m => m.FullPortalComponent) },
  { path: endpoints.PORTALHTML, loadComponent: () => import('./_samples/full-portal/full-portal.component').then(m => m.FullPortalComponent) },
  { path: endpoints.FULLPORTAL, loadComponent: () => import('./_samples/full-portal/full-portal.component').then(m => m.FullPortalComponent) },
  { path: endpoints.FULLPORTALHTML, loadComponent: () => import('./_samples/full-portal/full-portal.component').then(m => m.FullPortalComponent) },
  { path: endpoints.EMBEDDED, loadComponent: () => import('./_samples/embedded/embedded.component').then(m => m.EmbeddedComponent) },
  { path: endpoints.EMBEDDEDHTML, loadComponent: () => import('./_samples/embedded/embedded.component').then(m => m.EmbeddedComponent) },
  { path: endpoints.MASHUP, loadComponent: () => import('./_samples/embedded/embedded.component').then(m => m.EmbeddedComponent) },
  { path: endpoints.MASHUPHTML, loadComponent: () => import('./_samples/embedded/embedded.component').then(m => m.EmbeddedComponent) },
  {
    path: endpoints.SIMPLEPORTAL,
    loadComponent: () => import('./_samples/simple-portal/navigation/navigation.component').then(m => m.NavigationComponent)
  },
  {
    path: endpoints.SIMPLEPORTALHTML,
    loadComponent: () => import('./_samples/simple-portal/navigation/navigation.component').then(m => m.NavigationComponent)
  }
];
