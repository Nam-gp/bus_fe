import { Routes } from '@angular/router';
import { ChuyenXePageComponent } from './chuyen-xe-page/chuyen-xe-page.component';

/** Chủ: B */
export const MH02_ROUTES: Routes = [
  {
    path: '',
    component: ChuyenXePageComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tao-chuyen' },
      {
        path: 'tao-chuyen',
        title: 'Tạo chuyến',
        loadComponent: () => import('./tao-chuyen/tao-chuyen.component').then((m) => m.TaoChuyenComponent),
      },
      {
        path: 'danh-sach',
        title: 'Danh sách chuyến',
        loadComponent: () =>
          import('./danh-sach-chuyen/danh-sach-chuyen.component').then((m) => m.DanhSachChuyenComponent),
      },
      {
        path: 'ket-thuc',
        title: 'Kết thúc chuyến',
        loadComponent: () =>
          import('./ket-thuc-chuyen/ket-thuc-chuyen.component').then((m) => m.KetThucChuyenComponent),
      },
    ],
  },
];
