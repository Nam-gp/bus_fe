import { TrangThaiChuyen } from '@core/constants/trang-thai';

export interface DanhSachChuyenParams {
  trangThai?: TrangThaiChuyen;
  maCN?: string;
  tuNgay?: string;
  denNgay?: string;
}

/** Ngày giờ dùng chuỗi ISO LocalDateTime như BE trả/nhận. */
export interface XemTruocChuyenRequest {
  maTuyen: string;
  gioKhoiHanh: string;
  maTXLai?: string;
  maTXPhu?: string;
}

export interface TaoChuyenRequest {
  maTuyen: string;
  maXe: string;
  gioKhoiHanh: string;
  gioDen: string;
  maLai: string;
  maPhu: string;
  maChuyen?: string;
}

export interface KetThucChuyenRequest {
  gioKhoiHanhTT?: string;
  gioDenTT?: string;
  kmThucTe: number;
  chiPhiVanHanh: number;
}

export interface XemTruocChuyenResponse {
  maTuyen: string;
  maLoaiNgay: string;
  giaVe: number | null;
  gioDenGoiY: string;
  thuLaoLai: number;
  thuLaoPhu: number;
}

export interface ChuyenXeResponse {
  maChuyen: string;
  maTuyen: string;
  tenTuyen: string;
  doDaiKm: number;
  maXe: string;
  bienSo: string;
  gioKhoiHanhDK: string;
  gioDenDK: string;
  gioKhoiHanhTT: string | null;
  gioDenTT: string | null;
  kmThucTe: number | null;
  chiPhiVanHanh: number | null;
  maTXLai: string;
  tenTXLai: string;
  thuLaoLai: number;
  maTXPhu: string;
  tenTXPhu: string;
  thuLaoPhu: number;
  daBan: number;
  soCho: number;
  trangThai: TrangThaiChuyen;
}
