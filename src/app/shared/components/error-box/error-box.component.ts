import { Component, computed, input } from '@angular/core';
import { ApiError } from '@core/http/api-error';
import { MessageModule } from 'primeng/message';

/** Hộp lỗi đỏ dưới form: <app-error-box [loi]="loi()" /> */
@Component({
  selector: 'app-error-box',
  imports: [MessageModule],
  templateUrl: './error-box.component.html',
  styleUrl: './error-box.component.scss',
})
export class ErrorBoxComponent {
  readonly loi = input<ApiError | string | null | undefined>(null);
  protected readonly thongBao = computed(() => {
    const l = this.loi();
    if (!l) return '';
    return typeof l === 'string' ? l : l.thongBao;
  });
}
