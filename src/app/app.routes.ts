import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { BranchContextService, SITES, SiteCode } from './core/services/branch-context.service';
import { ShellComponent } from './layout/shell/shell.component';

/**
 * Guard kiểm tra tiền tố site trên URL (/hn, /dn, /hcm).
 * Nếu không hợp lệ thì chuyển hướng về /hn.
 */
export const siteGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const branchContext = inject(BranchContextService);
  const siteParam = (route.paramMap.get('site') || '').toLowerCase();

  if (siteParam === 'hn' || siteParam === 'dn' || siteParam === 'hcm') {
    branchContext.syncFromUrl('/' + siteParam);
    return true;
  }

  return router.createUrlTree(['/hn/thiet-lap']);
};

export const routes: Routes = [
  // Chuyển hướng gốc về site Hà Nội (/hn)
  { path: '', pathMatch: 'full', redirectTo: 'hn/thiet-lap' },

  // Chuyển hướng các đường dẫn không có prefix site về /hn/...
  { path: 'thiet-lap', pathMatch: 'full', redirectTo: 'hn/thiet-lap' },
  { path: 'thiet-lap/:tab', redirectTo: 'hn/thiet-lap/:tab' },
  { path: 'chuyen-xe', redirectTo: 'hn/chuyen-xe' },
  { path: 'ban-ve', redirectTo: 'hn/ban-ve' },
  { path: 'ky-thuat', redirectTo: 'hn/ky-thuat' },
  { path: 'bao-cao', redirectTo: 'hn/bao-cao' },

  // Nhánh định tuyến theo site: /hn, /dn, /hcm
  {
    path: ':site',
    component: ShellComponent,
    canActivate: [siteGuard],
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
  { path: '**', redirectTo: 'hn/thiet-lap' },
];
