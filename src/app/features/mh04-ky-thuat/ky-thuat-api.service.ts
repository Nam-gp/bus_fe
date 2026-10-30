import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TrangThaiXe } from '@core/constants/trang-thai';
import { ApiService } from '@core/http/api.service';
import { ThamSoKyThuat } from '@features/mh01-xe/xe-api.service';

/** Một dòng vw_LichBaoDuong; ngày dạng 'yyyy-MM-dd' */
export interface LichXe {
  maXe: string;
  bienSo: string;
  maLoaiXe: string;
  tenLoaiXe: string;
  maCN: string;
  namSanXuat: number;
  ngayDuaVaoSD: string;
  trangThai: TrangThaiXe;
  /** null = chưa bảo dưỡng lần nào */
  ngayBDGanNhat: string | null;
  /** Mốc tính F11: ngày bảo dưỡng gần nhất, chưa có thì ngày đưa vào sử dụng */
  ngayMocBD: string;
  kmLamViec: number;
  ngayBDTiepTheo: string;
  /** null = chưa đăng kiểm */
  hanDangKiem: string | null;
  ngayDKGanNhat: string | null;
}

export interface LichBaoDuong {
  ngayHienTai: string;
  thamSo: ThamSoKyThuat;
  xe: LichXe[];
}

export interface GhiNhanBaoDuongRequest {
  maXe: string;
  ngayBaoDuong: string;
  chiPhi?: number | null;
  noiDung?: string | null;
}

export interface GhiNhanBaoDuongResponse {
  maXe: string;
  bienSo: string;
  trangThai: TrangThaiXe;
  ngayBaoDuong: string;
  kmLamViec: number;
  ngayBDTiepTheo: string;
}

export interface GhiNhanDangKiemRequest {
  maXe: string;
  ngayDangKiem: string;
  ketQua: 'Dat' | 'KhongDat';
  chiPhi?: number | null;
}

export interface GhiNhanDangKiemResponse {
  maXe: string;
  bienSo: string;
  ketQua: 'Dat' | 'KhongDat';
  /** null khi Không đạt */
  ngayHetHan: string | null;
  hanHienHanh: string | null;
  chuKyThang: number;
  tuoiXe: number;
}

/** API MH04 – Người C (BE: /api/v1/doixe, module doixe_c). */
@Injectable({ providedIn: 'root' })
export class KyThuatApiService {
  private readonly api = inject(ApiService);

  /** MH04.1, MH04.4 – vw_LichBaoDuong + tham số (CANH_BAO_NGAY, CHU_KY_BD...) */
  lichBaoDuong(): Observable<LichBaoDuong> {
    return this.api.get<LichBaoDuong>('/api/v1/doixe/lich-bao-duong');
  }

  /** UC-014 – sp_GhiNhanBaoDuong; lỗi E28, E29, E30, E31 */
  ghiNhanBaoDuong(body: GhiNhanBaoDuongRequest): Observable<GhiNhanBaoDuongResponse> {
    return this.api.post<GhiNhanBaoDuongResponse>('/api/v1/doixe/bao-duong', body);
  }

  /** UC-015 – sp_GhiNhanDangKiem; lỗi E09, E31 */
  giaHanDangKiem(body: GhiNhanDangKiemRequest): Observable<GhiNhanDangKiemResponse> {
    return this.api.post<GhiNhanDangKiemResponse>('/api/v1/doixe/dang-kiem', body);
  }
}
