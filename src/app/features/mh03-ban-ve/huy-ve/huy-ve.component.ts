import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ApiError } from '@core/http/api-error';
import { ConfirmService } from '@core/services/confirm.service';
import { NotifyService } from '@core/services/notify.service';
import { ChuyenXeApiService } from '@features/mh02-chuyen-xe/chuyen-xe-api.service';
import { ChuyenXeResponse } from '@features/mh02-chuyen-xe/chuyen-xe.models';
import { ErrorBoxComponent } from '@shared/components/error-box/error-box.component';
import { TrangThaiPipe } from '@shared/pipes/trang-thai.pipe';
import { VnDatePipe } from '@shared/pipes/vn-date.pipe';
import { VndPipe } from '@shared/pipes/vnd.pipe';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { EMPTY, Subject, catchError, finalize, switchMap, tap } from 'rxjs';
import { BanVeApiService } from '../ban-ve-api.service';
import { TicketResponse } from '../ban-ve.models';

@Component({
  selector: 'app-huy-ve',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, TableModule, TagModule, ButtonModule, ErrorBoxComponent, VndPipe, VnDatePipe, TrangThaiPipe],
  templateUrl: './huy-ve.component.html',
  styleUrl: './huy-ve.component.scss',
})
export class HuyVeComponent implements OnInit {
  private readonly chuyenApi = inject(ChuyenXeApiService);
  private readonly api = inject(BanVeApiService);
  private readonly confirm = inject(ConfirmService);
  private readonly notify = inject(NotifyService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly taiVe$ = new Subject<string | null>();
  readonly danhSachChuyen = signal<ChuyenXeResponse[]>([]);
  readonly maChuyen = signal<string | null>(null);
  readonly danhSachVe = signal<TicketResponse[]>([]);
  readonly dangTaiChuyen = signal(false);
  readonly dangTaiVe = signal(false);
  readonly maVeDangHuy = signal<string | null>(null);
  readonly loi = signal<ApiError | string | null>(null);
  readonly chuyenDangChon = computed(() => this.danhSachChuyen().find((chuyen) => chuyen.maChuyen === this.maChuyen()) ?? null);

  constructor() {
    this.taiVe$.pipe(
      tap((maChuyen) => {
        this.dangTaiVe.set(!!maChuyen);
        this.loi.set(null);
        if (!maChuyen) this.danhSachVe.set([]);
      }),
      switchMap((maChuyen) => maChuyen ? this.api.veTheoChuyen(maChuyen).pipe(
        tap((danhSach) => { this.danhSachVe.set(danhSach ?? []); this.dangTaiVe.set(false); }),
        catchError((err: ApiError) => { this.loi.set(err); this.dangTaiVe.set(false); return EMPTY; }),
      ) : EMPTY),
      takeUntilDestroyed(),
    ).subscribe();
  }

  ngOnInit(): void { this.taiChuyen(); }

  taiChuyen(): void {
    this.dangTaiChuyen.set(true);
    this.loi.set(null);
    this.chuyenApi.danhSachChuyen({ trangThai: 'KeHoach' }).pipe(
      finalize(() => this.dangTaiChuyen.set(false)), takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (danhSach) => {
        this.danhSachChuyen.set(danhSach ?? []);
        const maHienTai = this.maChuyen();
        this.doiChuyen((danhSach ?? []).some((chuyen) => chuyen.maChuyen === maHienTai) ? maHienTai : (danhSach?.[0]?.maChuyen ?? null));
      },
      error: (err: ApiError) => this.loi.set(err),
    });
  }

  doiChuyen(maChuyen: string | null): void {
    this.maChuyen.set(maChuyen);
    this.danhSachVe.set([]);
    this.taiVe$.next(maChuyen);
  }

  coTheHuy(ve: TicketResponse): boolean {
    return ve.trangThai === 'DaBan' && this.chuyenDangChon()?.trangThai === 'KeHoach';
  }

  async huyVe(ve: TicketResponse): Promise<void> {
    if (!this.coTheHuy(ve) || this.maVeDangHuy() !== null) return;
    this.maVeDangHuy.set(ve.maVe);
    const dongY = await this.confirm.hoi(`Hủy vé ${ve.maVe}? Ghế ${ve.soGhe} sẽ được mở bán lại.`);
    if (!dongY) { this.maVeDangHuy.set(null); return; }
    this.loi.set(null);
    this.api.huyVe(ve.maVe).pipe(
      finalize(() => this.maVeDangHuy.set(null)), takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: () => {
        this.notify.thanhCong(`Đã hủy vé ${ve.maVe}. Ghế ${ve.soGhe} được mở bán lại.`);
        this.taiVe$.next(this.maChuyen());
      },
      error: (err: ApiError) => this.loi.set(err),
    });
  }
}
