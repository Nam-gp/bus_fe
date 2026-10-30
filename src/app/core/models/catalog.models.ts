/**
 * Model danh mục dùng chung giữa các màn hình. Tên trường phải khớp OpenAPI;
 * đổi ở đây cần báo cả 3 người. Model riêng của từng màn hình đặt trong features/.
 */
import { CapDoTuyen, TrangThaiTaiXe, TrangThaiXe } from '../constants/trang-thai';

export interface ChiNhanh { maCN: string; tenCN: string; }

/** Chủ: A */
export interface ThamSo {
  DON_GIA_KM: number;
  HS_LAI: number;
  HS_PHU: number;
  CHU_KY_BD: number;
  KM_MOI_NGAY_BD: number;
  CANH_BAO_NGAY: number;
  CHU_KY_DK_CU: number;
  CHU_KY_DK_MOI: number;
  TUOI_XE_CU: number;
}

/** Chủ: A */
export interface DoPhucTap { capDo: CapDoTuyen; heSoLuong: number; heSoDuongKho: number; }

/** Chủ: A */
export interface TuyenDuong { maTuyen: string; diemDau: string; diemCuoi: string; doDaiKm: number; capDo: CapDoTuyen; }

/** Chủ: A */
export interface TaiXe {
  maTX: string;
  hoDem: string;
  ten: string;
  maCN: string;
  hangGPLX: string;
  trangThai: TrangThaiTaiXe;
}

/** Chủ: C */
export interface LoaiXe { maLoaiXe: string; tenLoaiXe: string; soGhe: number; }

/** Chủ: C. GET /api/v1/doixe/xe */
export interface Xe {
  maXe: string;
  bienSo: string;
  maLoaiXe: string;
  tenLoaiXe: string;
  soGhe: number;
  maCN: string;
  namSanXuat: number;
  ngayDuaVaoSD: string;
  trangThai: TrangThaiXe;
  /** 'yyyy-MM-dd'; null = chưa đăng kiểm */
  hanDangKiem: string | null;
  soChuyen: number;
  /** Xe thuộc site đang làm việc mới được xóa / đổi trạng thái */
  coQuyenThaoTac: boolean;
}
