import { Injectable, computed, signal } from '@angular/core';

/** Đếm số request đang chạy; thanh loading trên cùng hiện khi > 0 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly soRequest = signal(0);
  readonly dangTai = computed(() => this.soRequest() > 0);

  batDau(): void {
    this.soRequest.update((n) => n + 1);
  }

  ketThuc(): void {
    this.soRequest.update((n) => Math.max(0, n - 1));
  }
}
