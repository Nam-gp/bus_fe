import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/http/api.service';
import { SKIP_LOADING } from '@core/interceptors/loading.interceptor';
import { HttpContext } from '@angular/common/http';

/** API MH03 – Người B. DTO chốt theo api/van-hanh.yaml (TODO thay unknown). */
@Injectable({ providedIn: 'root' })
export class BanVeApiService {
  private readonly api = inject(ApiService);

  /** UC-011 – thông tin chuyến, giá theo loại ngày (F03, F04), ghế đã bán → vẽ sơ đồ ghế */
  soDoGhe(maChuyen: string): Observable<unknown> {
    return this.api.get<unknown>(`/van-hanh/chuyen/${encodeURIComponent(maChuyen)}/so-do-ghe`);
  }

  /** UC-011 – sp_BanVe (TR01, TR02); lỗi E24, E25, E26, E27 */
  banVe(body: unknown): Observable<{ maVe: string }> {
    return this.api.post<{ maVe: string }>('/van-hanh/ve', body);
  }

  /** UC-012 – vé Đã bán của chuyến còn Kế hoạch */
  huyVe(maVe: string): Observable<void> {
    return this.api.post<void>(`/van-hanh/ve/${encodeURIComponent(maVe)}/huy`);
  }

  /** UC-013 – tìm theo một phần số điện thoại, BE hỏi cả 3 chi nhánh */
  traCuu(soDienThoai: string): Observable<unknown[]> {
    return this.api.get<unknown[]>('/van-hanh/ve', { soDienThoai }, {
      context: new HttpContext().set(SKIP_LOADING, true),
    });
  }
}
