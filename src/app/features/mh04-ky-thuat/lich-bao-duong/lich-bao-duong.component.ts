import { Component, computed, inject } from '@angular/core';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';
import { TrangThaiPipe } from '@shared/pipes/trang-thai.pipe';
import { VnDatePipe } from '@shared/pipes/vn-date.pipe';
import { VndPipe } from '@shared/pipes/vnd.pipe';
import { SharedModule } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { KyThuatStore, LA_DO, LichXeTinhTrang } from '../ky-thuat.store';

const HS = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });

/** MH04.4 – Lịch bảo dưỡng, đăng kiểm của tất cả xe (C), đọc vw_LichBaoDuong (chỉ đọc). */
@Component({
  selector: 'app-lich-bao-duong',
  imports: [TableModule, SharedModule, StatusBadgeComponent, TrangThaiPipe, VnDatePipe, VndPipe],
  templateUrl: './lich-bao-duong.component.html',
  styleUrl: './lich-bao-duong.component.scss',
})
export class LichBaoDuongComponent {
  protected readonly store = inject(KyThuatStore);

  /** Dòng công thức – giá trị theo tham số hiện hành ở MH01.1 */
  readonly congThuc = computed(() => {
    const ts = this.store.thamSo();
    if (!ts) return '';
    const hs = [ts.heSoDuongKho1, ts.heSoDuongKho2, ts.heSoDuongKho3].map((v) => HS.format(v)).join(' / ');
    return `Bảo dưỡng tiếp theo = ngày BD gần nhất + ${ts.chuKyBd} − ⌊km làm việc ÷ ${HS.format(ts.kmMoiNgayBd)}⌋ · `
      + `hệ số đường khó ${hs} · đỏ = quá hạn hoặc chưa đăng kiểm, vàng = còn ≤ ${ts.canhBaoNgay} ngày`;
  });

  mauDong(x: LichXeTinhTrang): string {
    if (LA_DO(x.tinhTrangBD) || LA_DO(x.tinhTrangDK)) return 'qx-row--do';
    if (x.tinhTrangBD.muc === 'sap-den-han' || x.tinhTrangDK.muc === 'sap-den-han') return 'qx-row--vang';
    return '';
  }
}
