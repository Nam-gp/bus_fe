import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/http/api.service';
import { DoPhucTap, TaiXe, ThamSo, TuyenDuong } from '@core/models/catalog.models';

export interface ThamSoVaHeSo { thamSo: ThamSo; doPhucTap: DoPhucTap[]; }

/** API MH01 Tab 1, 2, 4 – Người A. DTO chốt theo api/cau-hinh.yaml (TODO thay unknown). */
@Injectable({ providedIn: 'root' })
export class ThietLapApiService {
  private readonly api = inject(ApiService);

  /** UC-002 */
  layThamSo(): Observable<ThamSoVaHeSo> {
    return this.api.get<ThamSoVaHeSo>('/cau-hinh/tham-so');
  }

  /** UC-002 – UPDATE ThamSo, DoPhucTap */
  luuThamSo(body: ThamSoVaHeSo): Observable<void> {
    return this.api.put<void>('/cau-hinh/tham-so', body);
  }

  /** UC-003, UC-004 – tuyến kèm 4 mức giá */
  danhSachTuyen(): Observable<TuyenDuong[]> {
    return this.api.get<TuyenDuong[]>('/cau-hinh/tuyen');
  }

  /** UC-003 – sp_ThemTuyenVaGia */
  themTuyenVaGia(body: unknown): Observable<{ maTuyen: string }> {
    return this.api.post<{ maTuyen: string }>('/cau-hinh/tuyen', body);
  }

  /** UC-004 – upsert BangGiaVe */
  suaBangGia(maTuyen: string, body: unknown): Observable<void> {
    return this.api.put<void>(`/cau-hinh/tuyen/${encodeURIComponent(maTuyen)}/gia`, body);
  }

  /** UC-007 */
  danhSachTaiXe(): Observable<TaiXe[]> {
    return this.api.get<TaiXe[]>('/cau-hinh/tai-xe');
  }

  /** UC-007 – INSERT TaiXe */
  themTaiXe(body: unknown): Observable<{ maTX: string }> {
    return this.api.post<{ maTX: string }>('/cau-hinh/tai-xe', body);
  }
}
