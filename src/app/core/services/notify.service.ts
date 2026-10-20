import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

/**
 * Thông báo nổi (p-toast trong ShellComponent): xanh khi lưu thành công, đỏ khi lỗi kết nối (E32).
 * Lỗi nghiệp vụ hiện trong <app-error-box> dưới form, không dùng toast.
 */
@Injectable({ providedIn: 'root' })
export class NotifyService {
  private readonly messages = inject(MessageService);

  thanhCong(thongBao: string, tieuDe = 'Thành công'): void {
    this.messages.add({ severity: 'success', summary: tieuDe, detail: thongBao, life: 4000 });
  }

  loi(thongBao: string, tieuDe = 'Lỗi'): void {
    this.messages.add({ severity: 'error', summary: tieuDe, detail: thongBao, life: 8000 });
  }
}
