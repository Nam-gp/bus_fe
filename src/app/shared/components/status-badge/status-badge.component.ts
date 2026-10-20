import { Component, computed, input } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { MucTinhTrang, TinhTrangHan } from '../../utils/han.utils';

const MAU: Record<MucTinhTrang, 'danger' | 'warn' | 'success'> = {
  'qua-han': 'danger',
  'chua-co': 'danger',
  'sap-den-han': 'warn',
  'binh-thuong': 'success',
};

/** Nhãn màu theo F14 (đỏ / vàng / xanh): <app-status-badge [tinhTrang]="tinhTinhTrangHan(han, homNay, canhBao)" /> */
@Component({
  selector: 'app-status-badge',
  imports: [TagModule],
  templateUrl: './status-badge.component.html',
})
export class StatusBadgeComponent {
  readonly tinhTrang = input.required<TinhTrangHan>();
  protected readonly mau = computed(() => MAU[this.tinhTrang().muc]);
}
