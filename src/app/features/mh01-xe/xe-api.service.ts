import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/http/api.service';
import { Xe } from '@core/models/catalog.models';

/** API MH01.0 và Tab 3 – Người C. DTO chốt theo api/doi-xe.yaml (TODO thay unknown). */
@Injectable({ providedIn: 'root' })
export class XeApiService {
  private readonly api = inject(ApiService);

  /** UC-001 – dữ liệu 5 dòng Mức độ sẵn sàng */
  mucDoSanSang(): Observable<unknown> {
    return this.api.get<unknown>('/doi-xe/muc-do-san-sang');
  }

  danhSachXe(): Observable<Xe[]> {
    return this.api.get<Xe[]>('/doi-xe/xe');
  }

  /** UC-005 – sp_ThemXeVaDangKiem */
  themXeVaDangKiem(body: unknown): Observable<{ maXe: string }> {
    return this.api.post<{ maXe: string }>('/doi-xe/xe', body);
  }

  /** UC-006 – lỗi E10 nếu xe đã có chuyến */
  xoaXe(maXe: string): Observable<void> {
    return this.api.delete<void>(`/doi-xe/xe/${encodeURIComponent(maXe)}`);
  }
}
