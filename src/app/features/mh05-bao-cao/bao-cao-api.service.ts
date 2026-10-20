import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/http/api.service';

/** Tháng 'yyyy-mm'; maCN rỗng/undefined = toàn chuỗi (BR-MH05-06) */
export interface LocBaoCao { thang: string; maCN?: string; }

/** API MH05 – Người A. DTO chốt theo api/cau-hinh.yaml (TODO thay unknown). */
@Injectable({ providedIn: 'root' })
export class BaoCaoApiService {
  private readonly api = inject(ApiService);

  thangCoChuyen(): Observable<string[]> {
    return this.api.get<string[]>('/bao-cao/thang');
  }

  /** 3 ô số tổng: doanh thu (F15), số vé, tổng lương (F02) */
  tongHop(loc: LocBaoCao): Observable<{ doanhThu: number; soVe: number; tongLuong: number }> {
    return this.api.get<{ doanhThu: number; soVe: number; tongLuong: number }>('/bao-cao/tong-hop', { ...loc });
  }

  /** sp_R01 */
  luong(loc: LocBaoCao): Observable<unknown[]> {
    return this.api.get<unknown[]>('/bao-cao/luong', { ...loc });
  }

  /** sp_R02 / sp_R03 / sp_R04 */
  doanhThu(theo: 'xe' | 'tuyen' | 'loai-xe', loc: LocBaoCao): Observable<unknown[]> {
    return this.api.get<unknown[]>(`/bao-cao/doanh-thu/${theo}`, { ...loc });
  }

  /** sp_R06 */
  xeQuaHanBaoDuong(ngayXet: string, maCN?: string): Observable<unknown[]> {
    return this.api.get<unknown[]>('/bao-cao/xe-qua-han', { ngayXet, maCN });
  }

  /** UC-017 – sp_ChotLuongThang */
  chotLuong(thang: string): Observable<{ soDong: number }> {
    return this.api.post<{ soDong: number }>('/bao-cao/chot-luong', { thang });
  }

  trangThaiChot(thang: string): Observable<{ soDong: number }> {
    return this.api.get<{ soDong: number }>('/bao-cao/chot-luong', { thang });
  }
}
