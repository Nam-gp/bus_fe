import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { KET_QUA_DANG_KIEM } from '@core/constants/trang-thai';
import { ApiError } from '@core/http/api-error';
import { NotifyService } from '@core/services/notify.service';
import { TodayService } from '@core/services/today.service';
import { ErrorBoxComponent } from '@shared/components/error-box/error-box.component';
import { VnDatePipe } from '@shared/pipes/vn-date.pipe';
import { addMonths, diffDays, toIsoDateOrNull } from '@shared/utils/date.utils';
import { tinhChuKyDangKiem } from '@shared/utils/han.utils';
import { VnValidators, thongBaoLoi } from '@shared/validators/vn.validators';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { finalize } from 'rxjs';
import { KyThuatApiService } from '../ky-thuat-api.service';
import { KyThuatStore } from '../ky-thuat.store';

/** Còn hạn trên ngưỡng này vẫn cho gia hạn, chỉ hiện lưu ý (CONST, BR-MH04-08) */
const NGUONG_CON_HAN_NGAY = 30;

/** MH04.3 – Gia hạn đăng kiểm định kỳ (C): UC-015, sp_GhiNhanDangKiem (E09, E31). */
@Component({
  selector: 'app-gia-han-dang-kiem',
  imports: [ReactiveFormsModule, ButtonModule, DatePickerModule, InputNumberModule, SelectModule, ErrorBoxComponent],
  templateUrl: './gia-han-dang-kiem.component.html',
  styleUrl: './gia-han-dang-kiem.component.scss',
})
export class GiaHanDangKiemComponent {
  protected readonly store = inject(KyThuatStore);
  private readonly api = inject(KyThuatApiService);
  private readonly notify = inject(NotifyService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly vnDate = new VnDatePipe();

  protected readonly homNay = inject(TodayService).homNay();
  protected readonly ngayToiDa = inject(TodayService).homNayDate();
  protected readonly ketQuaOptions = [...KET_QUA_DANG_KIEM];

  readonly dangLuu = signal(false);
  readonly daGui = signal(false);
  readonly loiLuu = signal<ApiError | string | null>(null);

  readonly form = this.fb.group({
    maXe: ['', Validators.required],
    ngayDangKiem: this.fb.control<Date | null>(this.ngayToiDa, [Validators.required, VnValidators.ngayKhongSau(this.homNay)]),
    ketQua: this.fb.control<'Dat' | 'KhongDat'>('Dat', Validators.required),
    chiPhi: this.fb.control<number | null>(null, VnValidators.khongAm),
  });

  private readonly giaTriForm = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  /** Khung xem trước F12, F13; thêm lưu ý khi xe còn hạn trên 30 ngày */
  readonly xemTruoc = computed(() => {
    const v = this.giaTriForm();
    const x = this.store.timXe(v.maXe);
    const ts = this.store.thamSo();
    if (!x || !ts) return 'Chọn xe để xem hạn đăng kiểm.';
    const hanHienTai = x.hanDangKiem ? this.vnDate.transform(x.hanDangKiem) : 'chưa có';
    if (v.ketQua !== 'Dat') {
      return `Hạn hiện tại: ${hanHienTai}. Kết quả Không đạt: hạn giữ nguyên, xe phải sửa và đăng kiểm lại.`;
    }
    const ngay = toIsoDateOrNull(v.ngayDangKiem);
    const ck = tinhChuKyDangKiem(x.namSanXuat, this.homNay, ts);
    const hanMoi = ngay ? this.vnDate.transform(addMonths(ngay, ck.soThang)) : '…';
    const luuY = x.hanDangKiem && ngay && diffDays(ngay, x.hanDangKiem) > NGUONG_CON_HAN_NGAY
      ? ` Lưu ý: xe còn hạn đến ${hanHienTai}, hạn hiện hành sẽ là ngày lớn hơn.`
      : '';
    return `Hạn hiện tại: ${hanHienTai}. Xe sản xuất ${x.namSanXuat} (${ck.tuoiXe} năm, ${ck.xeCu ? 'xe cũ' : 'xe mới'}) `
      + `→ chu kỳ ${ck.soThang} tháng → hạn mới ${hanMoi}.${luuY}`;
  });

  constructor() {
    // Mặc định: xe đầu tiên cần đăng kiểm trong Xe cần xử lý, nếu có
    effect(() => {
      const ds = this.store.xe();
      const can = this.store.xeCanXuLy();
      untracked(() => {
        const hienTai = this.form.controls.maXe.value;
        if (ds.length && !ds.some((x) => x.maXe === hienTai)) {
          const goiY = can.find((r) => r.viec === 'DangKiem');
          this.form.controls.maXe.setValue(goiY?.maXe ?? ds[0].maXe);
        }
      });
    });

    // Nút Ghi nhận ở MH04.1: điền xe, ngày hôm nay, kết quả Đạt
    effect(() => {
      const chon = this.store.chonDangKiem();
      if (!chon) return;
      untracked(() => {
        this.form.patchValue({ maXe: chon.maXe, ngayDangKiem: this.ngayToiDa, ketQua: 'Dat' });
        this.loiLuu.set(null);
      });
    });
  }

  loi(ten: 'maXe' | 'ngayDangKiem' | 'ketQua' | 'chiPhi', nhan: string, laOChon = false): string | null {
    const c = this.form.controls[ten];
    if (!c.errors || !(c.touched || this.daGui())) return null;
    if (c.errors['required'] && laOChon) return `Vui lòng chọn ${nhan}.`;
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
      .giaHanDangKiem({
        maXe: v.maXe,
        ngayDangKiem: toIsoDateOrNull(v.ngayDangKiem)!,
        ketQua: v.ketQua,
        chiPhi: v.chiPhi,
      })
      .pipe(finalize(() => this.dangLuu.set(false)))
      .subscribe({
        next: (kq) => {
          const han = kq.hanHienHanh ? this.vnDate.transform(kq.hanHienHanh) : '(chưa có)';
          this.notify.thanhCong(
            kq.ketQua === 'Dat'
              ? `Đã ghi nhận đăng kiểm Đạt. Xe ${kq.bienSo} được chạy đến ${han}.`
              : `Đã ghi kết quả Không đạt. Hạn đăng kiểm của xe ${kq.bienSo} giữ nguyên ${han}.`,
          );
          this.form.patchValue({ chiPhi: null });
          this.daGui.set(false);
          this.store.daLuu();
        },
        error: (err: ApiError) => this.loiLuu.set(err),
      });
  }
}
