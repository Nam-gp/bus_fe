import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/http/api.service';

export interface LichXe {
  maXe: string;
  bienSo: string;
  ngayBDGanNhat: string | null;
  kmLamViec: number;
  ngayBDTiepTheo: string;
  hanDangKiem: string | null;
}

/** API MH04 – Người C. DTO chốt theo api/doi-xe.yaml. */
@Injectable({ providedIn: 'root' })
export class KyThuatApiService {
  private readonly api = inject(ApiService);

  /** MH04.1, MH04.4 – vw_LichBaoDuong + ThamSo.CANH_BAO_NGAY */
  lichBaoDuong(): Observable<{ canhBaoNgay: number; xe: LichXe[] }> {
    return this.api.get<{ canhBaoNgay: number; xe: LichXe[] }>('/doi-xe/lich-bao-duong');
  }

  /** UC-014 – sp_GhiNhanBaoDuong; lỗi E28, E29, E30, E31 */
  ghiNhanBaoDuong(body: { maXe: string; ngayBaoDuong: string; chiPhi?: number; noiDung?: string }): Observable<void> {
    return this.api.post<void>('/doi-xe/bao-duong', body);
  }

  /** UC-015 – sp_GhiNhanDangKiem; lỗi E09, E31 */
  giaHanDangKiem(body: { maXe: string; ngayDangKiem: string; ketQua: string; chiPhi?: number }): Observable<void> {
    return this.api.post<void>('/doi-xe/dang-kiem', body);
  }
}
