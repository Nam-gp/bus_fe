import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BranchContextService } from '@core/services/branch-context.service';
import { LoadingService } from '@core/services/loading.service';
import { TodayService } from '@core/services/today.service';
import { VnDatePipe } from '@shared/pipes/vn-date.pipe';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { filter } from 'rxjs';
import { MENU } from '../menu';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    SelectModule,
    ProgressBarModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    VnDatePipe,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnInit {
  protected readonly menu = MENU;
  protected readonly branch = inject(BranchContextService);
  protected readonly loading = inject(LoadingService);
  protected readonly today = inject(TodayService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    // Đồng bộ site từ URL khi tải trang
    this.branch.syncFromUrl(this.router.url);

    // Đồng bộ lại khi có sự kiện chuyển route
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => {
        const ev = e as NavigationEnd;
        this.branch.syncFromUrl(ev.urlAfterRedirects || ev.url);
      });
  }

  onSiteChange(newSite: string): void {
    this.branch.chonSite(newSite as any);
  }
}
