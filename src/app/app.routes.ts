import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';

/**
 * Routing gốc – tạo 1 lần ở Sprint 0 rồi khóa (CODEOWNERS: C).
 * Mỗi màn hình lazy-load file routes riêng của người phụ trách.
 */
export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'thiet-lap' },
      {
        path: 'thiet-lap', // MH01 – A (+ C)
        title: 'Thiết lập hệ thống',
        loadChildren: () => import('./features/mh01-thiet-lap/mh01.routes').then((m) => m.MH01_ROUTES),
      },
      {
        path: 'chuyen-xe', // MH02 – B
        title: 'Chuyến xe',
        loadChildren: () => import('./features/mh02-chuyen-xe/mh02.routes').then((m) => m.MH02_ROUTES),
      },
      {
        path: 'ban-ve', // MH03 – B
        title: 'Bán vé',
        loadChildren: () => import('./features/mh03-ban-ve/mh03.routes').then((m) => m.MH03_ROUTES),
      },
      {
        path: 'ky-thuat', // MH04 – C
        title: 'Kỹ thuật xe',
        loadChildren: () => import('./features/mh04-ky-thuat/mh04.routes').then((m) => m.MH04_ROUTES),
      },
      {
        path: 'bao-cao', // MH05 – A
        title: 'Báo cáo',
        loadChildren: () => import('./features/mh05-bao-cao/mh05.routes').then((m) => m.MH05_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
