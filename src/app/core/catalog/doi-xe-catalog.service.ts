import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';
import { TrangThaiXe } from '../constants/trang-thai';
import { ApiService } from '../http/api.service';
import { LoaiXe, Xe } from '../models/catalog.models';

/** Danh mục xe, loại xe do C cung cấp (giao tiếp số 3). Chủ: C. */
@Injectable({ providedIn: 'root' })
export class DoiXeCatalogService {
  private readonly api = inject(ApiService);
  private loaiXe$?: Observable<LoaiXe[]>;

  loaiXe(): Observable<LoaiXe[]> {
    return (this.loaiXe$ ??= this.api.get<LoaiXe[]>('/api/v1/doixe/loai-xe').pipe(
      tap({ error: () => (this.loaiXe$ = undefined) }),
      shareReplay(1),
    ));
  }

  /** maCN trống = xe của site đang làm việc; chi nhánh khác đọc qua Linked Server */
  xe(loc?: { maCN?: string; trangThai?: TrangThaiXe }): Observable<Xe[]> {
    return this.api.get<Xe[]>('/api/v1/doixe/xe', loc);
  }
}
