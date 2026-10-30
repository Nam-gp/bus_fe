import { Component, inject } from '@angular/core';
import { NotifyService } from '@core/services/notify.service';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';
import { VnDatePipe } from '@shared/pipes/vn-date.pipe';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { KyThuatStore, ViecCanXuLy } from '../ky-thuat.store';

/**
 * MH04.1 – Xe cần xử lý (C): xe quá hạn hoặc còn ≤ CANH_BAO_NGAY ngày (F14).
 * Bấm Ghi nhận chỉ điền sẵn form MH04.2 / MH04.3, không gọi Server.
 */
@Component({
  selector: 'app-xe-can-xu-ly',
  imports: [ButtonModule, TableModule, SharedModule, StatusBadgeComponent, VnDatePipe],
  templateUrl: './xe-can-xu-ly.component.html',
  styleUrl: './xe-can-xu-ly.component.scss',
})
export class XeCanXuLyComponent {
  protected readonly store = inject(KyThuatStore);
  private readonly notify = inject(NotifyService);

  ghiNhan(r: ViecCanXuLy): void {
    const form = r.viec === 'BaoDuong' ? 'Ghi nhận bảo dưỡng' : 'Gia hạn đăng kiểm';
    if (r.viec === 'BaoDuong') {
      this.store.chonXeBaoDuong(r.maXe);
    } else {
      this.store.chonXeDangKiem(r.maXe);
    }
    document.getElementById(r.viec === 'BaoDuong' ? 'form-bao-duong' : 'form-dang-kiem')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.notify.thanhCong(`Đã chọn xe ${r.bienSo} ở form ${form}. Kiểm tra rồi bấm Lưu.`, 'Đã điền sẵn form');
  }
}
