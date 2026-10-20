import { Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { RouteTabsComponent, TabLink } from '@shared/components/route-tabs/route-tabs.component';

@Component({
  selector: 'app-ban-ve-page',
  imports: [PageHeaderComponent, RouteTabsComponent],
  templateUrl: './ban-ve-page.component.html',
})
export class BanVePageComponent {
  protected readonly tabs: readonly TabLink[] = [
    { duongDan: 'ban', nhan: 'Bán vé' },
    { duongDan: 'huy', nhan: 'Hủy vé' },
    { duongDan: 'tra-cuu', nhan: 'Tra cứu vé' },
  ];
}
