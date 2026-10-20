import { Injectable, inject } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

/**
 * Hộp xác nhận (p-confirmdialog trong ShellComponent), dùng cho Hủy chuyến, Hủy vé, Xóa xe,
 * Chốt lại lương tháng đã chốt...
 *   if (await this.confirm.hoi('Hủy chuyến C250602003?')) { ... }
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly confirmation = inject(ConfirmationService);

  hoi(noiDung: string, tieuDe = 'Xác nhận'): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmation.confirm({
        header: tieuDe,
        message: noiDung,
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Đồng ý',
        rejectLabel: 'Không',
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });
  }
}
