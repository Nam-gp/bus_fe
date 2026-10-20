import { Injectable, signal } from '@angular/core';

/**
 * Giao tiếp A ↔ C trên MH01 (BR-MH01-01): khung Mức độ sẵn sàng (C) tính lại sau mỗi lần
 * Lưu thành công ở bất kỳ tab nào. Tab của A gọi baoDaLuu(); panel của C theo dõi phienBan().
 */
@Injectable({ providedIn: 'root' })
export class ReadinessRefreshService {
  readonly phienBan = signal(0);

  baoDaLuu(): void {
    this.phienBan.update((v) => v + 1);
  }
}
