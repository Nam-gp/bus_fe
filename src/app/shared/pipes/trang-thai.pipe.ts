import { Pipe, PipeTransform } from '@angular/core';
import {
  TRANG_THAI_CHUYEN,
  TRANG_THAI_TAI_XE,
  TRANG_THAI_VE,
  TRANG_THAI_XE,
  VAI_TRO,
} from '@core/constants/trang-thai';

const BANG = {
  xe: TRANG_THAI_XE,
  chuyen: TRANG_THAI_CHUYEN,
  ve: TRANG_THAI_VE,
  taiXe: TRANG_THAI_TAI_XE,
  vaiTro: VAI_TRO,
} as const;

export type LoaiTrangThai = keyof typeof BANG;

/** {{ xe.trangThai | trangThai: 'xe' }} → "Hoạt động" */
@Pipe({ name: 'trangThai' })
export class TrangThaiPipe implements PipeTransform {
  transform(ma: string | null | undefined, loai: LoaiTrangThai): string {
    if (!ma) return '';
    const bang: Record<string, string> = BANG[loai];
    return bang[ma] ?? ma;
  }
}
