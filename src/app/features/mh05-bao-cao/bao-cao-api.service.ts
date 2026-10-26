import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, QueryParams } from '@core/http/api.service';

export interface TongHopBaoCaoResponse {
  thang: string;
  doanhThuThang: number;
  soVeTinhDoanhThu: number;
  tongLuongTaiXe: number;
}

export interface LuongTaiXeReportItem {
  maTX: string;
  hoDem: string;
  ten: string;
  hoTen: string;
  maCN: string;
  tenCN: string;
  soChuyenLai: number;
  soChuyenPhu: number;
  tongLuong: number;
}

export interface DoanhThuXeReportItem {
  maXe: string;
  bienSo: string;
  tenLoaiXe: string;
  maCN: string;
  tenCN: string;
  soChuyen: number;
  soVe: number;
  doanhThu: number;
  tyLe: number;
}

export interface DoanhThuTuyenReportItem {
  maTuyen: string;
  tenTuyen: string;
  capDo: number;
  doDaiKm: number;
  soChuyen: number;
  soVe: number;
  doanhThu: number;
  tyLe: number;
}

export interface DoanhThuLoaiXeReportItem {
  maLoaiXe: string;
  tenLoaiXe: string;
  soGhe: number;
  soChuyen: number;
  soVe: number;
  doanhThu: number;
  tyLe: number;
}

export interface XeQuaHanBaoDuongReportItem {
  maXe: string;
  bienSo: string;
  tenLoaiXe: string;
  maCN: string;
  tenCN: string;
  ngayDuaVaoSD: string;
  ngayBaoDuongGanNhat: string;
  kmLamViec: number;
  ngayBaoDuongTiepTheo: string;
  soNgayQuaHan: number;
}

export interface TrangThaiChotLuongResponse {
  thang: string;
  daChot: boolean;
  soDong: number;
  tongLuong: number;
  ngayChot?: string;
  thongBao: string;
}

export interface BangLuongItem {
  maTX: string;
  hoTen?: string;
  thang: string;
  soChuyenLai: number;
  soChuyenPhu: number;
  tongLuong: number;
  ngayChot: string;
}

/** API MH05 – Người A. Khớp 100% với Postman Collection */
@Injectable({ providedIn: 'root' })
export class BaoCaoApiService {
  private readonly api = inject(ApiService);

  /** Lấy danh sách tháng có chuyến (Combobox Tháng) */
  thangCoChuyen(): Observable<string[]> {
    return this.api.get<string[]>('/api/v1/cauhinh/bao-cao/thang-co-chuyen');
  }

  /** 3 ô số tổng đầu màn hình MH05 (Doanh thu F15, Số vé, Tổng lương F02) */
  tongHop(thang: string, maCN?: string): Observable<TongHopBaoCaoResponse> {
    return this.api.get<TongHopBaoCaoResponse>('/api/v1/cauhinh/bao-cao/tong-hop', { thang, maCN } as QueryParams);
  }

  /** Tab 1: Báo cáo Lương tài xế (sp_R01) */
  luongTaiXe(thang: string, maCN?: string): Observable<LuongTaiXeReportItem[]> {
    return this.api.get<LuongTaiXeReportItem[]>('/api/v1/cauhinh/bao-cao/luong-tai-xe', { thang, maCN } as QueryParams);
  }

  /** Tab 2: Doanh thu theo xe (sp_R02) */
  doanhThuTheoXe(thang: string, maCN?: string): Observable<DoanhThuXeReportItem[]> {
    return this.api.get<DoanhThuXeReportItem[]>('/api/v1/cauhinh/bao-cao/doanh-thu-theo-xe', { thang, maCN } as QueryParams);
  }

  /** Tab 3: Doanh thu theo tuyến (sp_R03) */
  doanhThuTheoTuyen(thang: string, maCN?: string): Observable<DoanhThuTuyenReportItem[]> {
    return this.api.get<DoanhThuTuyenReportItem[]>('/api/v1/cauhinh/bao-cao/doanh-thu-theo-tuyen', { thang, maCN } as QueryParams);
  }

  /** Tab 4: Doanh thu theo loại xe (sp_R04) */
  doanhThuTheoLoaiXe(thang: string, maCN?: string): Observable<DoanhThuLoaiXeReportItem[]> {
    return this.api.get<DoanhThuLoaiXeReportItem[]>('/api/v1/cauhinh/bao-cao/doanh-thu-theo-loai-xe', { thang, maCN } as QueryParams);
  }

  /** Tab 5: Xe quá hạn bảo dưỡng (sp_R06) */
  xeQuaHanBaoDuong(ngayXet: string, maCN?: string): Observable<XeQuaHanBaoDuongReportItem[]> {
    return this.api.get<XeQuaHanBaoDuongReportItem[]>('/api/v1/cauhinh/bao-cao/xe-qua-han-bao-duong', { ngayXet, maCN } as QueryParams);
  }

  /** Kiểm tra trạng thái chốt lương của tháng (sp_KiemTraTrangThaiChotLuong) */
  kiemTraTrangThaiChot(thang: string, maCN?: string): Observable<TrangThaiChotLuongResponse> {
    return this.api.get<TrangThaiChotLuongResponse>('/api/v1/cauhinh/bang-luong/trang-thai', { thang, maCN } as QueryParams);
  }

  /** UC-017: Chốt lương tháng (sp_ChotLuongThang) */
  chotLuong(thang: string, maCN?: string): Observable<TrangThaiChotLuongResponse> {
    return this.api.post<TrangThaiChotLuongResponse>('/api/v1/cauhinh/bang-luong/chot-luong', { thang, maCN });
  }

  /** Tra cứu danh sách bảng lương đã chốt */
  traCuuBangLuong(thang: string, maCN?: string): Observable<BangLuongItem[]> {
    return this.api.get<BangLuongItem[]>('/api/v1/cauhinh/bang-luong', { thang, maCN } as QueryParams);
  }
}
