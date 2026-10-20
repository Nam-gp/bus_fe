import { Routes } from '@angular/router';
import { ThietLapPageComponent } from './thiet-lap-page/thiet-lap-page.component';

/** Chủ: A. Tab 3 trỏ sang component của C (giao tiếp số 7). */
export const MH01_ROUTES: Routes = [
  {
    path: '',
    component: ThietLapPageComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tham-so' },
      {
        path: 'tham-so',
        title: 'Tham số',
        loadComponent: () => import('./tham-so/tham-so.component').then((m) => m.ThamSoComponent),
      },
      {
        path: 'tuyen-gia',
        title: 'Tuyến và giá vé',
        loadComponent: () => import('./tuyen-gia/tuyen-gia.component').then((m) => m.TuyenGiaComponent),
      },
      {
        path: 'xe',
        title: 'Xe và đăng kiểm',
        loadComponent: () => import('@features/mh01-xe/xe-tab/xe-tab.component').then((m) => m.XeTabComponent),
      },
      {
        path: 'tai-xe',
        title: 'Tài xế',
        loadComponent: () => import('./tai-xe/tai-xe.component').then((m) => m.TaiXeComponent),
      },
    ],
  },
];
