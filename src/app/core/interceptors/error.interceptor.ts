import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, timeout } from 'rxjs';
import { environment } from '@env/environment';
import { toApiError } from '../http/api-error';
import { NotifyService } from '../services/notify.service';

/**
 * Chuẩn hóa mọi lỗi thành ApiError { ma, thongBao }.
 * - Mất kết nối / quá thời gian → E32, hiện toast đỏ ngay tại đây.
 * - Lỗi nghiệp vụ (E02–E31) → ném tiếp cho component hiện trong <app-error-box>.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotifyService);
  return next(req).pipe(
    timeout(environment.requestTimeoutMs),
    catchError((err: unknown) => {
      const loi = toApiError(err);
      if (loi.ma === 'E32') notify.loi(loi.thongBao);
      return throwError(() => loi);
    }),
  );
};
