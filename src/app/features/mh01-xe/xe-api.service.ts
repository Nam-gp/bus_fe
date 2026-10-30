import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DoiXeCatalogService } from '@core/catalog/doi-xe-catalog.service';
import { TrangThaiXe } from '@core/constants/trang-thai';
import { ApiService } from '@core/http/api.service';
import { LoaiXe, Xe } from '@core/models/catalog.models';

export interface ThemXeRequest {
  bienSo: string;
  maLoaiXe: string;
  namSanXuat: number;
  /** 'yyyy-MM-dd' */
  ngayDangKiem: string;
}

export interface ThemXeResponse {
  maXe: string;
  bienSo: string;
  hanDangKiem: string;
  chuKyThang: number;
  tuoiXe: number;
}

export interface ThamSoKyThuat {
  chuKyBd: number;
  kmMoiNgayBd: number;
  canhBaoNgay: number;
  chuKyDkCu: number;
  chuKyDkMoi: number;
  tuoiXeCu: number;
  heSoDuongKho1: number;
  heSoDuongKho2: number;
  heSoDuongKho3: number;
}

export interface XeCanhBao {
  maXe: string;
  bienSo: string;
  /** Hạn đăng kiểm hoặc ngày bảo dưỡng tiếp theo; null = chưa đăng kiểm */
  han: string | null;
}

/** Phần xe của khung Mức độ sẵn sàng (C) */
export interface MucDoSanSangXe {
  ngayHienTai: string;
  tongSoXe: number;
  xeHetHanDangKiem: XeCanhBao[];
  xeQuaHanBaoDuong: XeCanhBao[];
}

/** Phần cấu hình của khung Mức độ sẵn sàng – API của A (GET /api/v1/cauhinh/danh-muc/muc-do-san-sang) */
export interface MucDoSanSangCauHinh {
  donGiaKm: number;
  chuKyBd: number;
  chuKyDkCu: number;
  chuKyDkMoi: number;
  tongSoTuyen: number;
  soTuyenThieuGia: number;
  soTaiXeDangLam: number;
}

/** Tuyến kèm 4 mức giá – API của A (GET /api/v1/cauhinh/tuyen-duong), chỉ đọc để liệt kê tuyến thiếu giá */
export interface TuyenGia {
  maTuyen: string;
  giaThuong: number | null;
  giaCuoiTuan: number | null;
  giaMuaDL: number | null;
  giaLeTet: number | null;
}

/** API MH01.0 và Tab 3 – Người C (BE: /api/v1/doixe, module doixe_c). */
@Injectable({ providedIn: 'root' })
export class XeApiService {
  private readonly api = inject(ApiService);
  private readonly catalog = inject(DoiXeCatalogService);

  /** UC-001 – dòng 3 (đăng kiểm) và dòng cảnh báo bảo dưỡng */
  mucDoSanSangXe(): Observable<MucDoSanSangXe> {
    return this.api.get<MucDoSanSangXe>('/api/v1/doixe/muc-do-san-sang');
  }

  /** UC-001 – dòng 1, 2, 4 do A cung cấp (giao tiếp số 1) */
  mucDoSanSangCauHinh(): Observable<MucDoSanSangCauHinh> {
    return this.api.get<MucDoSanSangCauHinh>('/api/v1/cauhinh/danh-muc/muc-do-san-sang');
  }

  tuyenGia(): Observable<TuyenGia[]> {
    return this.api.get<TuyenGia[]>('/api/v1/cauhinh/tuyen-duong');
  }

  thamSoKyThuat(): Observable<ThamSoKyThuat> {
    return this.api.get<ThamSoKyThuat>('/api/v1/doixe/tham-so');
  }

  loaiXe(): Observable<LoaiXe[]> {
    return this.catalog.loaiXe();
  }

  danhSachXe(maCN?: string): Observable<Xe[]> {
    return this.catalog.xe({ maCN });
  }

  /** UC-005 – sp_ThemXeVaDangKiem; lỗi E07, E08, E09 */
  themXeVaDangKiem(body: ThemXeRequest): Observable<ThemXeResponse> {
    return this.api.post<ThemXeResponse>('/api/v1/doixe/xe', body);
  }

  /** UC-006 – lỗi E10 nếu xe đã có chuyến */
  xoaXe(maXe: string): Observable<void> {
    return this.api.delete<void>(`/api/v1/doixe/xe/${encodeURIComponent(maXe)}`);
  }

  /** SRS 11.2 mục 5 – chuyển Ngừng hoạt động thay cho xóa xe đã có chuyến */
  doiTrangThai(maXe: string, trangThai: TrangThaiXe): Observable<void> {
    return this.api.patch<void>(`/api/v1/doixe/xe/${encodeURIComponent(maXe)}/trang-thai`, { trangThai });
  }
}
