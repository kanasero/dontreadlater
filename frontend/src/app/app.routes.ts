import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'popup',
    loadChildren: () => import('./components/popup/popup.routes').then(c => c.routes)
  }
];
