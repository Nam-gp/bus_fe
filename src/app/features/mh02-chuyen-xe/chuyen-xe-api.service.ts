import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TrangThaiChuyen } from '@core/constants/trang-thai';
import { ApiService } from '@core/http/api.service';

/** API MH02 – Người B. DTO chốt theo api/van-hanh.yaml (TODO thay unknown). */
@Injectable({ providedIn: 'root' })
export class ChuyenXeApiService {
  private readonly api = inject(ApiService);

  danhSachChuyen(loc?: { trangThai?: TrangThaiChuyen; ngay?: string }): Observable<unknown[]> {
    return this.api.get<unknown[]>('/van-hanh/chuyen', loc);
  }

  /** UC-008 – sp_TaoChuyenVaPhanCong (TR03–TR05) */
  taoChuyenVaPhanCong(body: unknown): Observable<{ maChuyen: string }> {
    return this.api.post<{ maChuyen: string }>('/van-hanh/chuyen', body);
  }

  /** UC-009 – chỉ chuyến Kế hoạch */
  huyChuyen(maChuyen: string): Observable<void> {
    return this.api.post<void>(`/van-hanh/chuyen/${encodeURIComponent(maChuyen)}/huy`);
  }

  /** UC-010 – sp_KetThucChuyen (TR06) */
  ketThucChuyen(maChuyen: string, body: unknown): Observable<void> {
    return this.api.post<void>(`/van-hanh/chuyen/${encodeURIComponent(maChuyen)}/ket-thuc`, body);
  }
}
