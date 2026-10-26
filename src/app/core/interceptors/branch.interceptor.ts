import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BranchContextService } from '../services/branch-context.service';

export const CHI_NHANH_HEADER = 'X-Chi-Nhanh';

/**
 * Định tuyến chi nhánh theo chuẩn URL Dạng A: /{site}/api/v1/... (site = hn, dn, hcm)
 * - Nguyên tắc: Ở site nào thì CHỈ kết nối đến backend URL của site đó (/hn, /dn hoặc /hcm).
 * - Tự động gắn tiền tố /{currentSite} vào các đường dẫn bắt đầu bằng /api/
 * - Đồng thời gắn kèm header X-Chi-Nhanh để tương thích.
 */
export const branchInterceptor: HttpInterceptorFn = (req, next) => {
  const branchContext = inject(BranchContextService);
  const maCN = branchContext.maCN();
  const currentSite = branchContext.site();

  let url = req.url;

  // Nếu url chưa có prefix site /hn/, /dn/, /hcm/ -> gắn prefix site hiện tại
  if (!url.startsWith('/hn/') && !url.startsWith('/dn/') && !url.startsWith('/hcm/')) {
    if (url.startsWith('/api/')) {
      url = `/${currentSite}${url}`;
    } else if (url.startsWith('api/')) {
      url = `/${currentSite}/${url}`;
    }
  }

  const headers = req.headers.has(CHI_NHANH_HEADER) || !maCN
    ? req.headers
    : req.headers.set(CHI_NHANH_HEADER, maCN);

  return next(req.clone({ url, headers }));
};
