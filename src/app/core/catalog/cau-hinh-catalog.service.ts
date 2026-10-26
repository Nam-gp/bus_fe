import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';
import { ApiService } from '../http/api.service';
import { ChiNhanh, TaiXe, ThamSo, TuyenDuong } from '../models/catalog.models';

export interface MucDoSanSangResponse {
  duDieuKien: boolean;
  thongBao: string;
  thamSoOk: boolean;
  soTuyenThieuGia: number;
  danhSachTuyenThieuGia: string[];
  soXeHetHanDangKiem: number;
  danhSachXeHetHanDangKiem: string[];
  soXeQuaHanBaoDuong: number;
  danhSachXeQuaHanBaoDuong: string[];
  soTaiXe: number;
}

export interface LichNgayItem {
  ngay: string;
  maLoaiNgay: string;
  tenLoaiNgay: string;
}

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
    return (this.chiNhanh$ ??= this.api.get<ChiNhanh[]>('/api/v1/cauhinh/danh-muc/chi-nhanh').pipe(
      tap({ error: () => (this.chiNhanh$ = undefined) }),
      shareReplay(1),
    ));
  }

  lichNgay(nam?: number, thang?: number): Observable<LichNgayItem[]> {
    return this.api.get<LichNgayItem[]>('/api/v1/cauhinh/danh-muc/lich-ngay', { nam, thang });
  }

  mucDoSanSang(): Observable<MucDoSanSangResponse> {
    return this.api.get<MucDoSanSangResponse>('/api/v1/cauhinh/danh-muc/muc-do-san-sang');
  }

  tuyen(): Observable<TuyenDuong[]> {
    return this.api.get<TuyenDuong[]>('/api/v1/cauhinh/tuyen-duong');
  }

  taiXeDangLam(maCN?: string): Observable<TaiXe[]> {
    return this.api.get<TaiXe[]>('/api/v1/cauhinh/tai-xe', { trangThai: 'DangLam', maCN });
  }

  /** Không lưu đệm: tham số đổi thì áp dụng ngay (BR-MH01-03) */
  thamSo(): Observable<Record<string, number>> {
    return this.api.get<Record<string, number>>('/api/v1/cauhinh/tham-so');
  }
}
