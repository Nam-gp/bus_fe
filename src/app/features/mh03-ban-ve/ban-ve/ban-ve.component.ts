import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiError } from '@core/http/api-error';
import { NotifyService } from '@core/services/notify.service';
import { ChuyenXeApiService } from '@features/mh02-chuyen-xe/chuyen-xe-api.service';
import { ChuyenXeResponse } from '@features/mh02-chuyen-xe/chuyen-xe.models';
import { ErrorBoxComponent } from '@shared/components/error-box/error-box.component';
import { VnDatePipe } from '@shared/pipes/vn-date.pipe';
import { VndPipe } from '@shared/pipes/vnd.pipe';
import { VnValidators } from '@shared/validators/vn.validators';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { finalize } from 'rxjs';
import { BanVeApiService } from '../ban-ve-api.service';
import { SoDoGheResponse } from '../ban-ve.models';
import { SoDoGheComponent } from '../so-do-ghe/so-do-ghe.component';

@Component({
  selector: 'app-ban-ve',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SelectModule, InputTextModule, ButtonModule, ErrorBoxComponent, SoDoGheComponent, VnDatePipe, VndPipe],
  templateUrl: './ban-ve.component.html',
  styleUrl: './ban-ve.component.scss',
})
export class BanVeComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly chuyenApi = inject(ChuyenXeApiService);
  private readonly api = inject(BanVeApiService);
  private readonly notify = inject(NotifyService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly soYeuCauDangTai = signal(0);
  private lanTaiSoDo = 0;
  readonly danhSachChuyen = signal<ChuyenXeResponse[]>([]);
  readonly maChuyen = signal<string | null>(null);
  readonly soDo = signal<SoDoGheResponse | null>(null);
  readonly gheDangChon = signal<number | null>(null);
  readonly dangTai = computed(() => this.soYeuCauDangTai() > 0);
  readonly dangBan = signal(false);
  readonly loi = signal<ApiError | string | null>(null);
  readonly daBan = computed(() => this.soDo()?.danhSachGhe.filter((g) => g.daBan).length ?? 0);
  readonly soCho = computed(() => Math.max(0, (this.soDo()?.danhSachGhe.length ?? 0) - 2));
  readonly form = this.fb.nonNullable.group({
    hoTen: ['', [Validators.required, Validators.maxLength(100)]],
    soDienThoai: ['', [Validators.required, VnValidators.soDienThoai]],
    cccd: ['', VnValidators.cccd], email: ['', Validators.email],
  });

  ngOnInit(): void { this.taiChuyen(); }
  private batDauTai(): void { this.soYeuCauDangTai.update((n) => n + 1); }
  private ketThucTai(): void { this.soYeuCauDangTai.update((n) => Math.max(0, n - 1)); }
  taiChuyen(): void {
    this.batDauTai(); this.loi.set(null);
    this.chuyenApi.danhSachChuyen({ trangThai: 'KeHoach' }).pipe(finalize(() => this.ketThucTai()), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (list) => {
        const danhSach = list ?? [];
        this.danhSachChuyen.set(danhSach);
        const tuUrl = this.route.snapshot.queryParamMap.get('maChuyen');
        this.doiChuyen(danhSach.find((c) => c.maChuyen === tuUrl)?.maChuyen ?? danhSach[0]?.maChuyen ?? null);
      }, error: (err: ApiError) => this.loi.set(err),
    });
  }
  doiChuyen(maChuyen: string | null): void {
    this.lanTaiSoDo++;
    this.maChuyen.set(maChuyen); this.soDo.set(null); this.gheDangChon.set(null); this.loi.set(null);
    if (maChuyen) this.taiSoDo();
  }
  taiSoDo(): void {
    const ma = this.maChuyen(); if (!ma) return;
    const lanTai = ++this.lanTaiSoDo;
    this.batDauTai();
    this.api.soDoGhe(ma).pipe(finalize(() => this.ketThucTai()), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => { if (lanTai === this.lanTaiSoDo) { this.soDo.set(data); this.gheDangChon.set(null); } },
      error: (err: ApiError) => { if (lanTai === this.lanTaiSoDo) this.loi.set(err); },
    });
  }
  chonGhe(soGhe: number): void { this.gheDangChon.set(this.gheDangChon() === soGhe ? null : soGhe); this.loi.set(null); }
  banVe(): void {
    if (this.dangBan()) return;
    this.loi.set(null);
    if (!this.gheDangChon()) { this.loi.set('Chọn một ghế trống trên sơ đồ.'); return; }
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const maChuyen = this.maChuyen(); if (!maChuyen) return;
    const raw = this.form.getRawValue(); this.dangBan.set(true);
    this.api.banVe({ maChuyen, soGhe: this.gheDangChon()!, hoTen: raw.hoTen.trim(), soDienThoai: raw.soDienThoai, cccd: raw.cccd.trim() || undefined, email: raw.email.trim() || undefined })
      .pipe(finalize(() => this.dangBan.set(false)), takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (ve) => {
          this.notify.thanhCong(`Đã bán vé ${ve.maVe} · ${new Intl.NumberFormat('vi-VN').format(ve.giaVe)} đ (${this.soDo()?.maLoaiNgay ?? ''}).`);
          this.form.reset(); this.taiSoDo();
        },
        error: (err: ApiError) => { this.loi.set(err); this.taiSoDo(); },
      });
  }
}
