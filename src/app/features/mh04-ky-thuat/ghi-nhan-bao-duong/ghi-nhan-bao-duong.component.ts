import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiError } from '@core/http/api-error';
import { NotifyService } from '@core/services/notify.service';
import { TodayService } from '@core/services/today.service';
import { ErrorBoxComponent } from '@shared/components/error-box/error-box.component';
import { VnDatePipe } from '@shared/pipes/vn-date.pipe';
import { addDays, toIsoDateOrNull } from '@shared/utils/date.utils';
import { VnValidators, thongBaoLoi } from '@shared/validators/vn.validators';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { finalize } from 'rxjs';
import { KyThuatApiService } from '../ky-thuat-api.service';
import { KyThuatStore } from '../ky-thuat.store';

/** MH04.2 – Ghi nhận bảo dưỡng (C): UC-014, sp_GhiNhanBaoDuong (E28–E31). */
@Component({
  selector: 'app-ghi-nhan-bao-duong',
  imports: [ReactiveFormsModule, ButtonModule, DatePickerModule, InputNumberModule, InputTextModule, SelectModule, ErrorBoxComponent],
  templateUrl: './ghi-nhan-bao-duong.component.html',
  styleUrl: './ghi-nhan-bao-duong.component.scss',
})
export class GhiNhanBaoDuongComponent {
  protected readonly store = inject(KyThuatStore);
  private readonly api = inject(KyThuatApiService);
  private readonly notify = inject(NotifyService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly vnDate = new VnDatePipe();

  protected readonly homNay = inject(TodayService).homNay();
  protected readonly ngayToiDa = inject(TodayService).homNayDate();

  readonly dangLuu = signal(false);
  readonly daGui = signal(false);
  readonly loiLuu = signal<ApiError | string | null>(null);

  readonly form = this.fb.group({
    maXe: ['', Validators.required],
    ngayBaoDuong: this.fb.control<Date | null>(this.ngayToiDa, [Validators.required, VnValidators.ngayKhongSau(this.homNay)]),
    chiPhi: this.fb.control<number | null>(null, VnValidators.khongAm),
    noiDung: ['', Validators.maxLength(200)],
  });

  private readonly giaTriForm = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  /** Khung xem trước: hạn hiện tại (F11, F14) và hạn mới sau khi lưu; tính lại khi đổi Xe hoặc Ngày */
  readonly xemTruoc = computed(() => {
    const v = this.giaTriForm();
    const x = this.store.timXe(v.maXe);
    const ts = this.store.thamSo();
    if (!x || !ts) return 'Chọn xe để xem hạn bảo dưỡng.';
    const ngay = toIsoDateOrNull(v.ngayBaoDuong);
    const sauLuu = ngay
      ? `${this.vnDate.transform(ngay)} + ${ts.chuKyBd} ngày = ${this.vnDate.transform(addDays(ngay, ts.chuKyBd))}`
      : `ngày bảo dưỡng + ${ts.chuKyBd} ngày`;
    return `Hạn hiện tại: ${this.vnDate.transform(x.ngayBDTiepTheo)} (${x.tinhTrangBD.nhan.toLowerCase()}). `
      + `Sau khi lưu: hạn mới = ${sauLuu}, km làm việc về 0.`;
  });

  constructor() {
    // Mặc định: xe đầu tiên trong Xe cần xử lý (ưu tiên dòng Bảo dưỡng), nếu có
    effect(() => {
      const ds = this.store.xe();
      const can = this.store.xeCanXuLy();
      untracked(() => {
        const hienTai = this.form.controls.maXe.value;
        if (ds.length && !ds.some((x) => x.maXe === hienTai)) {
          const goiY = can.find((r) => r.viec === 'BaoDuong') ?? can[0];
          this.form.controls.maXe.setValue(goiY?.maXe ?? ds[0].maXe);
        }
      });
    });

    // Nút Ghi nhận ở MH04.1: điền xe và ngày hôm nay
    effect(() => {
      const chon = this.store.chonBaoDuong();
      if (!chon) return;
      untracked(() => {
        this.form.patchValue({ maXe: chon.maXe, ngayBaoDuong: this.ngayToiDa });
        this.loiLuu.set(null);
      });
    });
  }

  loi(ten: 'maXe' | 'ngayBaoDuong' | 'chiPhi' | 'noiDung', nhan: string, laOChon = false): string | null {
    const c = this.form.controls[ten];
    if (!c.errors || !(c.touched || this.daGui())) return null;
    if (c.errors['required'] && laOChon) return `Vui lòng chọn ${nhan}.`;
    if (c.errors['ngayTuongLai']) return 'Ngày bảo dưỡng không được sau hôm nay.';
    if (c.errors['maxlength']) return `${nhan} tối đa ${c.errors['maxlength'].requiredLength} ký tự.`;
    return thongBaoLoi(c, nhan);
  }

  luu(): void {
    this.daGui.set(true);
    this.loiLuu.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    this.dangLuu.set(true);
    this.api
      .ghiNhanBaoDuong({
        maXe: v.maXe,
        ngayBaoDuong: toIsoDateOrNull(v.ngayBaoDuong)!,
        chiPhi: v.chiPhi,
        noiDung: v.noiDung.trim() || null,
      })
      .pipe(finalize(() => this.dangLuu.set(false)))
      .subscribe({
        next: (kq) => {
          this.notify.thanhCong(
            `Đã ghi nhận bảo dưỡng xe ${kq.bienSo} ngày ${this.vnDate.transform(kq.ngayBaoDuong)}. `
              + `Hạn bảo dưỡng tiếp theo: ${this.vnDate.transform(kq.ngayBDTiepTheo)}. Xe được xếp chuyến trở lại.`,
          );
          this.form.patchValue({ chiPhi: null, noiDung: '' });
          this.daGui.set(false);
          this.store.daLuu();
        },
        error: (err: ApiError) => this.loiLuu.set(err),
      });
  }
}
