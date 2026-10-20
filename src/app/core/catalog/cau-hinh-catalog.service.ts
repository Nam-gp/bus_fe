import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';
import { ApiService } from '../http/api.service';
import { ChiNhanh, TaiXe, ThamSo, TuyenDuong } from '../models/catalog.models';

/**
 * Danh mục dùng chung do A cung cấp (giao tiếp số 1 trong tài liệu phân công).
 * B và C chỉ đọc qua service này. Chủ: A.
 */
@Injectable({ providedIn: 'root' })
export class CauHinhCatalogService {
  private readonly api = inject(ApiService);
  private chiNhanh$?: Observable<ChiNhanh[]>;

  /** Ít thay đổi nên lưu đệm; lỗi thì bỏ đệm để lần sau gọi lại */
  chiNhanh(): Observable<ChiNhanh[]> {
    return (this.chiNhanh$ ??= this.api.get<ChiNhanh[]>('/cau-hinh/chi-nhanh').pipe(
      tap({ error: () => (this.chiNhanh$ = undefined) }),
      shareReplay(1),
    ));
  }

  tuyen(): Observable<TuyenDuong[]> {
    return this.api.get<TuyenDuong[]>('/cau-hinh/tuyen');
  }

  taiXeDangLam(maCN?: string): Observable<TaiXe[]> {
    return this.api.get<TaiXe[]>('/cau-hinh/tai-xe', { trangThai: 'DangLam', maCN });
  }

  /** Không lưu đệm: tham số đổi thì áp dụng ngay (BR-MH01-03) */
  thamSo(): Observable<ThamSo> {
    return this.api.get<ThamSo>('/cau-hinh/tham-so/gia-tri');
  }
}
