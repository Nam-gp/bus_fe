import { Component } from '@angular/core';
import { ReadinessPanelComponent } from '@features/mh01-xe/readiness-panel/readiness-panel.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { RouteTabsComponent, TabLink } from '@shared/components/route-tabs/route-tabs.component';

/** MH01 – khung trang (A). Khung Mức độ sẵn sàng và Tab 3 là component của C. */
@Component({
  selector: 'app-thiet-lap-page',
  imports: [PageHeaderComponent, ReadinessPanelComponent, RouteTabsComponent],
  templateUrl: './thiet-lap-page.component.html',
})
export class ThietLapPageComponent {
  protected readonly tabs: readonly TabLink[] = [
    { duongDan: 'tham-so', nhan: '1. Tham số' },
    { duongDan: 'tuyen-gia', nhan: '2. Tuyến và giá vé' },
    { duongDan: 'xe', nhan: '3. Xe và đăng kiểm' },
    { duongDan: 'tai-xe', nhan: '4. Tài xế' },
  ];
}
