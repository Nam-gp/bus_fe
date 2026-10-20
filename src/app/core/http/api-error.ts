import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import { MaLoi, ThamSoLoi, formatLoi, isMaLoi } from '../constants/error-messages';

/** Hợp đồng lỗi BE trả về (B chốt trong OpenAPI) */
export interface ApiErrorBody {
  ma?: string;
  thongBao?: string;
  thamSo?: ThamSoLoi;
}

/** Lỗi đã chuẩn hóa mà component nhận được trong error callback */
export interface ApiError {
  ma: MaLoi | 'UNKNOWN';
  thongBao: string;
  status: number;
  body?: ApiErrorBody;
}

const LOI_CHUNG = 'Đã có lỗi xảy ra. Vui lòng thử lại.';

export function isApiError(v: unknown): v is ApiError {
  return typeof v === 'object' && v !== null && 'ma' in v && 'thongBao' in v;
}

export function toApiError(err: unknown): ApiError {
  if (isApiError(err)) return err;
  if (err instanceof TimeoutError) {
    return { ma: 'E32', thongBao: formatLoi('E32'), status: 0 };
  }
  if (err instanceof HttpErrorResponse) {
    if ([0, 502, 503, 504].includes(err.status)) {
      return { ma: 'E32', thongBao: formatLoi('E32'), status: err.status };
    }
    const body: ApiErrorBody = typeof err.error === 'object' && err.error !== null ? err.error : {};
    const ma: MaLoi | 'UNKNOWN' = body.ma && isMaLoi(body.ma) ? body.ma : 'UNKNOWN';
    const thongBao = body.thongBao ?? (ma !== 'UNKNOWN' ? formatLoi(ma, body.thamSo) : LOI_CHUNG);
    return { ma, thongBao, status: err.status, body };
  }
  return { ma: 'UNKNOWN', thongBao: LOI_CHUNG, status: -1 };
}
