import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BranchContextService } from '@core/services/branch-context.service';
import { LoadingService } from '@core/services/loading.service';
import { TodayService } from '@core/services/today.service';
import { VnDatePipe } from '@shared/pipes/vn-date.pipe';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MENU } from '../menu';

@Component({
  selector: 'app-shell',
  imports: [
    FormsModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    SelectModule,
    ProgressBarModule,
    ToastModule,
    ConfirmDialogModule,
    VnDatePipe,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  protected readonly menu = MENU;
  protected readonly branch = inject(BranchContextService);
  protected readonly loading = inject(LoadingService);
  protected readonly today = inject(TodayService);
}
