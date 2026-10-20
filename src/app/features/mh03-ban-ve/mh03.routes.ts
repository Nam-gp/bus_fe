import { Routes } from '@angular/router';
import { BanVePageComponent } from './ban-ve-page/ban-ve-page.component';

/** Chủ: B */
export const MH03_ROUTES: Routes = [
  {
    path: '',
    component: BanVePageComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'ban' },
      {
        path: 'ban',
        title: 'Bán vé',
        loadComponent: () => import('./ban-ve/ban-ve.component').then((m) => m.BanVeComponent),
      },
      {
        path: 'huy',
        title: 'Hủy vé',
        loadComponent: () => import('./huy-ve/huy-ve.component').then((m) => m.HuyVeComponent),
      },
      {
        path: 'tra-cuu',
        title: 'Tra cứu vé',
        loadComponent: () => import('./tra-cuu-ve/tra-cuu-ve.component').then((m) => m.TraCuuVeComponent),
      },
    ],
  },
];
