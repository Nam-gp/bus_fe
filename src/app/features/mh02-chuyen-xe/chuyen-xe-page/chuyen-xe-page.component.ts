import { Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { RouteTabsComponent, TabLink } from '@shared/components/route-tabs/route-tabs.component';

@Component({
  selector: 'app-chuyen-xe-page',
  imports: [PageHeaderComponent, RouteTabsComponent],
  templateUrl: './chuyen-xe-page.component.html',
})
export class ChuyenXePageComponent {
  protected readonly tabs: readonly TabLink[] = [
    { duongDan: 'tao-chuyen', nhan: 'Tạo chuyến' },
    { duongDan: 'danh-sach', nhan: 'Danh sách, hủy chuyến' },
    { duongDan: 'ket-thuc', nhan: 'Kết thúc chuyến' },
  ];
}
