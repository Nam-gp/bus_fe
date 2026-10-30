import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from '@env/environment';
import { parseIsoDate, toIsoDate } from '@shared/utils/date.utils';
import { catchError, firstValueFrom, map, of, timeout } from 'rxjs';

/** GET /health của BE: { success, data: { status, today: 'yyyy-MM-dd', user } } */
interface HealthResponse {
  data?: { today?: string };
}

/** Chờ BE tối đa chừng này khi khởi động; quá thì dùng ngày dự phòng để app vẫn mở được */
const CHO_BE_MS = 3000;

/**
 * "Ngày hiện tại" dùng chung cho mọi màn hình (F14, mặc định datepicker, validator).
 * Không gọi new Date() rải rác trong component.
 * <p>
 * Nguồn chính là BE (CurrentDateProvider, profile prototype cố định 02/06/2025), lấy một lần
 * lúc khởi động qua dongBoTuServer() để FE và CSDL luôn cùng một "hôm nay". Không gọi được BE
 * thì dùng environment.fixedToday, rồi đến ngày của máy.
 */
@Injectable({ providedIn: 'root' })
export class TodayService {
  private readonly http = inject(HttpClient);
  private readonly ngay = signal(environment.fixedToday ?? toIsoDate(new Date()));

  /** 'yyyy-MM-dd' */
  homNay(): string {
    return this.ngay();
  }

  homNayDate(): Date {
    return parseIsoDate(this.homNay());
  }

  /** Gọi trong provideAppInitializer: app chỉ hiện màn hình sau khi đã có ngày của BE */
  dongBoTuServer(): Promise<void> {
    return firstValueFrom(
      this.http.get<HealthResponse>('/health').pipe(
        timeout(CHO_BE_MS),
        map((res) => res?.data?.today),
        catchError(() => of(undefined)),
        map((today) => {
          if (today && /^\d{4}-\d{2}-\d{2}$/.test(today)) this.ngay.set(today);
        }),
      ),
    );
  }
}
