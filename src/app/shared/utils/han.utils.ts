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
