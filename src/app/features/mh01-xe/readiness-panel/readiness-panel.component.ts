import { Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReadinessRefreshService } from '@core/services/readiness-refresh.service';

/** MH01.0 – UC-001 Xem mức độ sẵn sàng (C). Đặt trong khung trang MH01 của A. */
@Component({
  selector: 'app-readiness-panel',
  imports: [RouterLink],
  templateUrl: './readiness-panel.component.html',
  styleUrl: './readiness-panel.component.scss',
})
export class ReadinessPanelComponent {
  private readonly refresh = inject(ReadinessRefreshService);

  constructor() {
    effect(() => {
      this.refresh.phienBan(); // chạy lại mỗi khi tab khác báo đã lưu (BR-MH01-01)
      // TODO(C): gọi XeApiService.mucDoSanSang() và dựng 5 dòng theo F16
    });
  }
}
