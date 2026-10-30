import { TrangThaiVe } from '@core/constants/trang-thai';

export interface GheResponse {
  soGhe: number;
  coTheBan: boolean;
  maVe: string | null;
  daBan: boolean;
}

export interface SoDoGheResponse {
  maChuyen: string;
  maTuyen: string;
  tenTuyen: string;
  maXe: string;
  bienSo: string;
  gioKhoiHanhDK: string;
  maLoaiNgay: string;
  giaVe: number | null;
  danhSachGhe: GheResponse[];
}

export interface BanVeRequest {
  maChuyen: string;
  soGhe?: number;
  hoTen: string;
  soDienThoai?: string;
  cccd?: string;
  email?: string;
}

export interface BanVeResponse {
  maVe: string;
  giaVe: number;
  lanBan: number;
}

export interface TicketResponse {
  maVe: string;
  hoTen: string;
  soDienThoai: string;
  maChuyen: string;
  maTuyen: string;
  tenTuyen: string;
  soGhe: number;
  lanBan: number;
  giaVe: number | null;
  ngayBan: string;
  trangThai: TrangThaiVe;
}
