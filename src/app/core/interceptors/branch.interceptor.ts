import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '@env/environment';
import { BranchContextService } from '../services/branch-context.service';

export const CHI_NHANH_HEADER = 'X-Chi-Nhanh';

/** Gắn mã chi nhánh làm việc vào mọi request tới BE (request tự đặt header thì giữ nguyên) */
export const branchInterceptor: HttpInterceptorFn = (req, next) => {
  const maCN = inject(BranchContextService).maCN();
  if (!maCN || !req.url.startsWith(environment.apiUrl) || req.headers.has(CHI_NHANH_HEADER)) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { [CHI_NHANH_HEADER]: maCN } }));
};
