import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { parseIsoDate, toIsoDate } from '@shared/utils/date.utils';

/**
 * "Ngày hiện tại" dùng chung cho mọi màn hình (F14, mặc định datepicker, validator).
 * Không gọi new Date() rải rác trong component.
 */
@Injectable({ providedIn: 'root' })
export class TodayService {
  /** 'yyyy-MM-dd' */
  homNay(): string {
    return environment.fixedToday ?? toIsoDate(new Date());
  }

  homNayDate(): Date {
    return parseIsoDate(this.homNay());
  }
}
