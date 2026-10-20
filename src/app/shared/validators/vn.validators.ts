import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MaLoi, formatLoi } from '@core/constants/error-messages';
import { toIsoDateOrNull } from '../utils/date.utils';

/** Chấp nhận dấu phẩy hoặc dấu chấm thập phân (BR-MH01-02). Không phải số → null */
export function parseSoThapPhan(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v !== 'string' || v.trim() === '') return null;
  const n = Number(v.trim().replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

const rong = (v: unknown): boolean => v === null || v === undefined || v === '';

/** Validator theo quy tắc SRS. Ô trống để Validators.required xử lý (E01). */
export class VnValidators {
  /** E11 – CCCD đúng 12 chữ số */
  static cccd(c: AbstractControl): ValidationErrors | null {
    return rong(c.value) || /^\d{12}$/.test(String(c.value)) ? null : { cccd: true };
  }

  /** E23 – SĐT 10 chữ số, bắt đầu bằng 0 */
  static soDienThoai(c: AbstractControl): ValidationErrors | null {
    return rong(c.value) || /^0\d{9}$/.test(String(c.value)) ? null : { soDienThoai: true };
  }

  /** E02 – số > 0 (tham số, giá vé, độ dài tuyến) */
  static soDuong(c: AbstractControl): ValidationErrors | null {
    if (rong(c.value)) return null;
    const n = parseSoThapPhan(c.value);
    return n !== null && n > 0 ? null : { soDuong: true };
  }

  /** E03 – hệ số đường khó ≥ 1 */
  static heSoDuongKho(c: AbstractControl): ValidationErrors | null {
    if (rong(c.value)) return null;
    const n = parseSoThapPhan(c.value);
    return n !== null && n >= 1 ? null : { heSoDuongKho: true };
  }

  /** E31 – chi phí ≥ 0 */
  static khongAm(c: AbstractControl): ValidationErrors | null {
    if (rong(c.value)) return null;
    const n = parseSoThapPhan(c.value);
    return n !== null && n >= 0 ? null : { khongAm: true };
  }

  /** E09 / E28 – ngày không được sau hôm nay */
  static ngayKhongSau(homNay: string): ValidatorFn {
    return (c) => {
      const iso = toIsoDateOrNull(c.value);
      return iso && iso > homNay ? { ngayTuongLai: true } : null;
    };
  }

  /** E13 – đủ tuổi (mặc định 21) tính tới hôm nay (F17) */
  static tuoiToiThieu(homNay: string, tuoi = 21): ValidatorFn {
    return (c) => {
      const iso = toIsoDateOrNull(c.value);
      if (!iso) return null;
      const moc = `${Number(homNay.slice(0, 4)) - tuoi}${homNay.slice(4, 10)}`;
      return iso <= moc ? null : { tuoi: true };
    };
  }

  /** E08 – năm sản xuất từ 2005 đến năm hiện tại */
  static namSanXuat(homNay: string): ValidatorFn {
    return (c) => {
      if (rong(c.value)) return null;
      const nam = Number(c.value);
      const namNay = Number(homNay.slice(0, 4));
      return Number.isInteger(nam) && nam >= 2005 && nam <= namNay ? null : { namSanXuat: true };
    };
  }
}

/** Khóa lỗi validator → mã lỗi SRS */
export const MA_LOI_VALIDATOR: Partial<Record<string, MaLoi>> = {
  required: 'E01',
  cccd: 'E11',
  soDienThoai: 'E23',
  soDuong: 'E02',
  heSoDuongKho: 'E03',
  khongAm: 'E31',
  ngayTuongLai: 'E09',
  tuoi: 'E13',
  namSanXuat: 'E08',
};

/** Câu thông báo cho lỗi đầu tiên của 1 control, ví dụ trong <p-message variant="simple"> */
export function thongBaoLoi(c: AbstractControl | null, tenTruong: string): string | null {
  if (!c?.errors) return null;
  const khoa = Object.keys(c.errors)[0];
  const ma = khoa ? MA_LOI_VALIDATOR[khoa] : undefined;
  return ma ? formatLoi(ma, { truong: tenTruong }) : null;
}
