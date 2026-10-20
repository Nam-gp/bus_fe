import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { filter, map } from 'rxjs';

export interface TabLink {
  /** Đường dẫn con, tương đối với route của màn hình (ví dụ 'tham-so') */
  duongDan: string;
  nhan: string;
}

/**
 * Thanh tab PrimeNG gắn với route con: mỗi tab là 1 URL riêng (/thiet-lap/tuyen-gia...),
 * mở thẳng được từ link khác; tab đang sáng lấy theo URL hiện tại.
 */
@Component({
  selector: 'app-route-tabs',
  imports: [TabsModule, RouterLink, RouterOutlet],
  templateUrl: './route-tabs.component.html',
})
export class RouteTabsComponent {
  readonly tabs = input.required<readonly TabLink[]>();

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly tabDangMo = computed(() => {
    this.url(); // tính lại sau mỗi lần điều hướng
    return this.route.firstChild?.snapshot.url[0]?.path ?? this.tabs()[0]?.duongDan;
  });
}
