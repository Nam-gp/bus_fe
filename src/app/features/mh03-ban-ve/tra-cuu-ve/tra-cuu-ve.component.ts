import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiError } from '@core/http/api-error';
import { ErrorBoxComponent } from '@shared/components/error-box/error-box.component';
import { TrangThaiPipe } from '@shared/pipes/trang-thai.pipe';
import { VnDatePipe } from '@shared/pipes/vn-date.pipe';
import { VndPipe } from '@shared/pipes/vnd.pipe';
import { VnValidators } from '@shared/validators/vn.validators';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { EMPTY, catchError, debounceTime, defer, distinctUntilChanged, filter, finalize, switchMap, tap } from 'rxjs';
import { BanVeApiService } from '../ban-ve-api.service';
import { TicketResponse } from '../ban-ve.models';

@Component({
  selector: 'app-tra-cuu-ve',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, TableModule, TagModule, ErrorBoxComponent, VndPipe, VnDatePipe, TrangThaiPipe],
  templateUrl: './tra-cuu-ve.component.html',
  styleUrl: './tra-cuu-ve.component.scss',
})
export class TraCuuVeComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(BanVeApiService);
  readonly ketQua = signal<TicketResponse[]>([]);
  readonly daTim = signal(false);
  readonly dangTai = signal(false);
  readonly loi = signal<ApiError | string | null>(null);
  readonly form = this.fb.nonNullable.group({ soDienThoai: ['', [Validators.required, VnValidators.soDienThoai]] });

  constructor() {
    this.form.controls.soDienThoai.valueChanges.pipe(
      debounceTime(300), distinctUntilChanged(),
      tap((value) => { if (!value.trim()) { this.ketQua.set([]); this.daTim.set(false); this.loi.set(null); } }),
      filter((value) => !!value.trim() && this.form.controls.soDienThoai.valid),
      switchMap((value) => defer(() => {
        this.dangTai.set(true); this.loi.set(null);
        return this.api.traCuu(value.trim()).pipe(
          catchError((err: ApiError) => { this.loi.set(err); return EMPTY; }),
          finalize(() => this.dangTai.set(false)),
        );
      })),
      takeUntilDestroyed(),
    ).subscribe((list) => { this.ketQua.set(list ?? []); this.daTim.set(true); });
  }
}
