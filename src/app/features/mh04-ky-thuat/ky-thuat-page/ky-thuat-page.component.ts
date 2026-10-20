import { Component, inject } from '@angular/core';
import { TodayService } from '@core/services/today.service';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { VnDatePipe } from '@shared/pipes/vn-date.pipe';
import { GhiNhanBaoDuongComponent } from '../ghi-nhan-bao-duong/ghi-nhan-bao-duong.component';
import { GiaHanDangKiemComponent } from '../gia-han-dang-kiem/gia-han-dang-kiem.component';
import { LichBaoDuongComponent } from '../lich-bao-duong/lich-bao-duong.component';
import { XeCanXuLyComponent } from '../xe-can-xu-ly/xe-can-xu-ly.component';

/**
 * MH04 – 4 khung trên cùng 1 trang (C).
 * TODO(C): thêm 1 service cấp trang (providers: [...]) giữ xe đang chọn để nút Ghi nhận ở MH04.1
 * điền sẵn form MH04.2 / MH04.3.
 */
@Component({
  selector: 'app-ky-thuat-page',
  imports: [
    PageHeaderComponent,
    VnDatePipe,
    XeCanXuLyComponent,
    GhiNhanBaoDuongComponent,
    GiaHanDangKiemComponent,
    LichBaoDuongComponent,
  ],
  templateUrl: './ky-thuat-page.component.html',
  styleUrl: './ky-thuat-page.component.scss',
})
export class KyThuatPageComponent {
  protected readonly today = inject(TodayService);
}
