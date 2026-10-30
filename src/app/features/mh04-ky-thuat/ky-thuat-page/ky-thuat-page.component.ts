import { Component, effect, inject, untracked } from '@angular/core';
import { BranchContextService } from '@core/services/branch-context.service';
import { TodayService } from '@core/services/today.service';
import { ErrorBoxComponent } from '@shared/components/error-box/error-box.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { VnDatePipe } from '@shared/pipes/vn-date.pipe';
import { GhiNhanBaoDuongComponent } from '../ghi-nhan-bao-duong/ghi-nhan-bao-duong.component';
import { GiaHanDangKiemComponent } from '../gia-han-dang-kiem/gia-han-dang-kiem.component';
import { KyThuatStore } from '../ky-thuat.store';
import { LichBaoDuongComponent } from '../lich-bao-duong/lich-bao-duong.component';
import { XeCanXuLyComponent } from '../xe-can-xu-ly/xe-can-xu-ly.component';

/**
 * MH04 – 4 khung trên cùng 1 trang (C). KyThuatStore cấp trang giữ lịch vw_LichBaoDuong và
 * xe đang chọn để nút Ghi nhận ở MH04.1 điền sẵn form MH04.2 / MH04.3.
 */
@Component({
  selector: 'app-ky-thuat-page',
  imports: [
    PageHeaderComponent,
    ErrorBoxComponent,
    VnDatePipe,
    XeCanXuLyComponent,
    GhiNhanBaoDuongComponent,
    GiaHanDangKiemComponent,
    LichBaoDuongComponent,
  ],
  providers: [KyThuatStore],
  templateUrl: './ky-thuat-page.component.html',
  styleUrl: './ky-thuat-page.component.scss',
})
export class KyThuatPageComponent {
  protected readonly today = inject(TodayService);
  protected readonly store = inject(KyThuatStore);
  private readonly branch = inject(BranchContextService);

  constructor() {
    effect(() => {
      this.branch.site(); // xe phân mảnh theo chi nhánh: đổi site thì tải lịch của site mới
      untracked(() => this.store.taiLai());
    });
  }
}
