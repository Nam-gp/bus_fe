import { Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { TabsModule } from 'primeng/tabs';

/** MH05 – Người A. 5 tab là view trong cùng trang (đổi tab gọi lại API theo tab đang mở). */
@Component({
  selector: 'app-bao-cao-page',
  imports: [PageHeaderComponent, TabsModule],
  templateUrl: './bao-cao-page.component.html',
})
export class BaoCaoPageComponent {
  protected readonly tabs = [
    'Lương tài xế',
    'Doanh thu theo xe',
    'Doanh thu theo tuyến',
    'Doanh thu theo loại xe',
    'Xe quá hạn bảo dưỡng',
  ] as const;
}
