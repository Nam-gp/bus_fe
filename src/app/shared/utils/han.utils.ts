import { diffDays } from './date.utils';

export type MucTinhTrang = 'qua-han' | 'sap-den-han' | 'binh-thuong' | 'chua-co';

export interface TinhTrangHan {
  muc: MucTinhTrang;
  /** Số ngày quá hạn (qua-han) hoặc còn lại; null khi chưa có hạn */
  soNgay: number | null;
  nhan: string;
}

/**
 * F14 – tình trạng hạn bảo dưỡng / đăng kiểm, dùng chung MH01.0 và MH04.
 * d = hạn − hôm nay: d < 0 Quá hạn (đỏ) · 0 ≤ d ≤ CANH_BAO_NGAY Sắp đến hạn (vàng) · còn lại Bình thường.
 * Chưa có hạn: "Chưa đăng kiểm" (đỏ).
 */
export function tinhTinhTrangHan(
  han: string | null | undefined,
  homNay: string,
  canhBaoNgay: number,
  nhanChuaCo = 'Chưa đăng kiểm',
): TinhTrangHan {
  if (!han) return { muc: 'chua-co', soNgay: null, nhan: nhanChuaCo };
  const d = diffDays(homNay, han);
  if (d < 0) return { muc: 'qua-han', soNgay: -d, nhan: `Quá hạn ${-d} ngày` };
  if (d <= canhBaoNgay) return { muc: 'sap-den-han', soNgay: d, nhan: `Còn ${d} ngày` };
  return { muc: 'binh-thuong', soNgay: d, nhan: 'Bình thường' };
}

export interface ThamSoDangKiem {
  tuoiXeCu: number;
  chuKyDkCu: number;
  chuKyDkMoi: number;
}

export interface ChuKyDangKiem {
  tuoiXe: number;
  xeCu: boolean;
  soThang: number;
}

/**
 * F12 – xem trước chu kỳ đăng kiểm (bản chính thức là dbo.fn_ChuKyDangKiem trong CSDL).
 * Tuổi xe = năm hiện tại − năm sản xuất; tuổi ≥ TUOI_XE_CU → CHU_KY_DK_CU, ngược lại CHU_KY_DK_MOI.
 */
export function tinhChuKyDangKiem(namSanXuat: number, homNay: string, ts: ThamSoDangKiem): ChuKyDangKiem {
  const tuoiXe = Number(homNay.slice(0, 4)) - namSanXuat;
  const xeCu = tuoiXe >= ts.tuoiXeCu;
  return { tuoiXe, xeCu, soThang: xeCu ? ts.chuKyDkCu : ts.chuKyDkMoi };
}
