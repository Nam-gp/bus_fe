/** Trạng thái và danh sách cố định (SRS 2.2 CONST, 2.3 FIX-UI). Khóa = giá trị lưu trong CSDL. */
export const TRANG_THAI_XE = { HoatDong: 'Hoạt động', BaoDuong: 'Bảo dưỡng', NgungHD: 'Ngừng hoạt động' } as const;
export const TRANG_THAI_CHUYEN = { KeHoach: 'Kế hoạch', DangChay: 'Đang chạy', HoanThanh: 'Hoàn thành', Huy: 'Hủy' } as const;
export const TRANG_THAI_VE = { DaBan: 'Đã bán', DaHuy: 'Đã hủy' } as const;
export const TRANG_THAI_TAI_XE = { DangLam: 'Đang làm', NghiViec: 'Nghỉ việc' } as const;
export const VAI_TRO = { LAI: 'Lái xe', PHU: 'Phụ xe' } as const;

export type TrangThaiXe = keyof typeof TRANG_THAI_XE;
export type TrangThaiChuyen = keyof typeof TRANG_THAI_CHUYEN;
export type TrangThaiVe = keyof typeof TRANG_THAI_VE;
export type TrangThaiTaiXe = keyof typeof TRANG_THAI_TAI_XE;
export type VaiTro = keyof typeof VAI_TRO;

export const CAP_DO_TUYEN = [
  { value: 1, label: '1 · đường bằng' },
  { value: 2, label: '2 · đèo nhẹ' },
  { value: 3, label: '3 · đèo dốc' },
] as const;
export type CapDoTuyen = (typeof CAP_DO_TUYEN)[number]['value'];

export const HANG_GPLX = [
  { value: 'D', label: 'D (xe 10–30 chỗ)' },
  { value: 'E', label: 'E (trên 30 chỗ)' },
  { value: 'FC', label: 'FC' },
] as const;

/** Giá trị lưu trong DangKiem.KetQua (CHECK KetQua IN ('Dat', 'KhongDat')) */
export const KET_QUA_DANG_KIEM = [
  { value: 'Dat', label: 'Đạt' },
  { value: 'KhongDat', label: 'Không đạt' },
] as const;

/** Ghế lái và ghế phụ xe không bán (F05) */
export const SO_GHE_KHONG_BAN = 2;
