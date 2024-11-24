import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'popup',
    loadChildren: () => import('./components/popup/popup.routes').then(c => c.routes)
  },
  {
    path: 'options',
    loadChildren: () => import('./components/options/options.routes').then(c => c.routes)
  },
];
