import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, QueryParams } from '@core/http/api.service';

export interface DoPhucTapItem {
  capDo: number;
  moTa: string;
  heSoLuong: number;
  heSoDuongKho: number;
}

export interface LichNgayItem {
  ngay: string;
  maLoaiNgay: string;
  tenLoaiNgay: string;
}

export interface CauHinhTongHopResponse {
  thamSo: Record<string, number>;
  doPhucTap: DoPhucTapItem[];
  lichNgay: LichNgayItem[];
}

export interface ThamSoThuLaoRequest {
  donGiaKm: number;
  hsLai: number;
  hsPhu: number;
  hsLuongCap1: number;
  hsLuongCap2: number;
  hsLuongCap3: number;
}

export interface ThamSoBaoDuongRequest {
  chuKyBd: number;
  kmMoiNgayBd: number;
  canhBaoNgay: number;
  chuKyDkCu: number;
  chuKyDkMoi: number;
  tuoiXeCu: number;
  hsDuongKhoCap1: number;
  hsDuongKhoCap2: number;
  hsDuongKhoCap3: number;
}

export interface TuyenResponse {
  maTuyen: string;
  diemDau: string;
  diemCuoi: string;
  doDaiKm: number;
  capDo: number;
  tenCapDo?: string;
  heSoLuong?: number;
  heSoDuongKho?: number;
  giaThuong?: number;
  giaCuoiTuan?: number;
  giaMuaDL?: number;
  giaLeTet?: number;
}

export interface ThemTuyenRequest {
  diemDau: string;
  diemCuoi: string;
  doDaiKm: number;
  capDo: number;
  giaThuong: number;
  giaCuoiTuan: number;
  giaMuaDL: number;
  giaLeTet: number;
}

export interface CapNhatGiaVeRequest {
  maTuyen: string;
  maLoaiNgay: string;
  giaVe: number;
}

export interface CapNhatTuyenRequest {
  diemDau: string;
  diemCuoi: string;
  doDaiKm: number;
  capDo: number;
}

export interface TaiXeResponse {
  maTX: string;
  hoDem: string;
  ten: string;
  hoTen: string;
  ngaySinh?: string;
  namSinh?: number;
  cccd: string;
  soGplx?: string;
  hangGplx?: string;
  soNha?: string;
  phuong?: string;
  tinh?: string;
  soDienThoai?: string;
  ngayVaoLam?: string;
  trangThai: string;
  maCN: string;
  tenCN?: string;
  soChuyen?: number;
  thuLaoThang?: number;
  coQuyenThaoTac?: boolean;
}

export interface ThemTaiXeRequest {
  hoDem: string;
  ten: string;
  ngaySinh: string;
  namSinh?: number;
  cccd: string;
  soGplx?: string;
  hangGplx: string;
  soNha?: string;
  phuong?: string;
  tinh?: string;
  soDienThoai?: string;
  maCN?: string;
}

export interface CapNhatTaiXeRequest {
  hoDem: string;
  ten: string;
  ngaySinh?: string;
  soGplx?: string;
  hangGplx: string;
  soNha?: string;
  phuong?: string;
  tinh?: string;
  soDienThoai?: string;
  trangThai: string;
}

/** API MH01 Tab 1, 2, 4 – Người A. Khớp 100% với Postman Collection */
@Injectable({ providedIn: 'root' })
export class ThietLapApiService {
  private readonly api = inject(ApiService);

  /** UC-002: Lấy toàn bộ tham số, hệ số và lịch ngày */
  layThamSo(): Observable<CauHinhTongHopResponse> {
    return this.api.get<CauHinhTongHopResponse>('/api/v1/cauhinh/tham-so');
  }

  /** UC-002: Lưu tham số thù lao */
  luuThamSoThuLao(body: ThamSoThuLaoRequest): Observable<void> {
    return this.api.put<void>('/api/v1/cauhinh/tham-so/thu-lao', body);
  }

  /** UC-002: Lưu tham số bảo dưỡng và đăng kiểm */
  luuThamSoBaoDuong(body: ThamSoBaoDuongRequest): Observable<void> {
    return this.api.put<void>('/api/v1/cauhinh/tham-so/bao-duong-dang-kiem', body);
  }

  /** UC-003, UC-004: Lấy danh sách tuyến đường kèm giá vé */
  layDanhSachTuyen(maTuyen?: string): Observable<TuyenResponse[]> {
    return this.api.get<TuyenResponse[]>('/api/v1/cauhinh/tuyen-duong', { maTuyen });
  }

  /** UC-003: Thêm tuyến kèm 4 mức giá vé trong cùng 1 transaction */
  themTuyenVaGia(body: ThemTuyenRequest): Observable<TuyenResponse> {
    return this.api.post<TuyenResponse>('/api/v1/cauhinh/tuyen-duong', body);
  }

  /** UC-004: Cập nhật giá vé 1 loại ngày */
  capNhatGiaVe(maTuyen: string, body: { maLoaiNgay: string; giaVe: number }): Observable<void> {
    return this.api.put<void>(`/api/v1/cauhinh/tuyen-duong/${encodeURIComponent(maTuyen)}/gia-ve`, body);
  }

  /** UC-004: Lưu thay đổi giá vé hàng loạt */
  capNhatGiaVeHangLoat(body: CapNhatGiaVeRequest[]): Observable<void> {
    return this.api.put<void>('/api/v1/cauhinh/tuyen-duong/gia-ve/hang-loat', body);
  }

  /** Sửa thông tin tuyến đường */
  capNhatTuyenDuong(maTuyen: string, body: CapNhatTuyenRequest): Observable<void> {
    return this.api.put<void>(`/api/v1/cauhinh/tuyen-duong/${encodeURIComponent(maTuyen)}`, body);
  }

  /** UC-007: Lấy danh sách tài xế */
  layDanhSachTaiXe(params?: { maCN?: string; trangThai?: string; thang?: string }): Observable<TaiXeResponse[]> {
    return this.api.get<TaiXeResponse[]>('/api/v1/cauhinh/tai-xe', params as QueryParams);
  }

  /** UC-007: Thêm tài xế mới */
  themTaiXe(body: ThemTaiXeRequest): Observable<TaiXeResponse> {
    return this.api.post<TaiXeResponse>('/api/v1/cauhinh/tai-xe', body);
  }

  /** Sửa thông tin tài xế */
  capNhatTaiXe(maTX: string, body: CapNhatTaiXeRequest): Observable<TaiXeResponse> {
    return this.api.put<TaiXeResponse>(`/api/v1/cauhinh/tai-xe/${encodeURIComponent(maTX)}`, body);
  }

  /** Đổi trạng thái tài xế (DangLam / NghiViec) */
  doiTrangThaiTaiXe(maTX: string, trangThai: string): Observable<void> {
    return this.api.patch<void>(`/api/v1/cauhinh/tai-xe/${encodeURIComponent(maTX)}/trang-thai`, { trangThai });
  }
}
