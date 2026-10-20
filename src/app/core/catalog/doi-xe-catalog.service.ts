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
    return (this.loaiXe$ ??= this.api.get<LoaiXe[]>('/doi-xe/loai-xe').pipe(
      tap({ error: () => (this.loaiXe$ = undefined) }),
      shareReplay(1),
    ));
  }

  xe(loc?: { maCN?: string; trangThai?: TrangThaiXe }): Observable<Xe[]> {
    return this.api.get<Xe[]>('/doi-xe/xe', loc);
  }
}
