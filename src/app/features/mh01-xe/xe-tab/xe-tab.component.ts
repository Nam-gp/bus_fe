import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TRANG_THAI_XE, TrangThaiXe } from '@core/constants/trang-thai';
import { ApiError } from '@core/http/api-error';
import { LoaiXe, Xe } from '@core/models/catalog.models';
import { BranchContextService } from '@core/services/branch-context.service';
import { ConfirmService } from '@core/services/confirm.service';
import { NotifyService } from '@core/services/notify.service';
import { ReadinessRefreshService } from '@core/services/readiness-refresh.service';
import { TodayService } from '@core/services/today.service';
import { ErrorBoxComponent } from '@shared/components/error-box/error-box.component';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';
import { TrangThaiPipe } from '@shared/pipes/trang-thai.pipe';
import { VnDatePipe } from '@shared/pipes/vn-date.pipe';
import { addMonths, toIsoDateOrNull } from '@shared/utils/date.utils';
import { TinhTrangHan, tinhChuKyDangKiem, tinhTinhTrangHan } from '@shared/utils/han.utils';
import { VnValidators, thongBaoLoi } from '@shared/validators/vn.validators';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { finalize } from 'rxjs';
import { ThamSoKyThuat, XeApiService } from '../xe-api.service';

const MAU_TRANG_THAI: Record<TrangThaiXe, 'success' | 'warn' | 'secondary'> = {
  HoatDong: 'success',
  BaoDuong: 'warn',
  NgungHD: 'secondary',
};

/**
 * MH01.3 – Tab 3 Xe và đăng kiểm (C): UC-005 Thêm xe kèm đăng kiểm lần đầu, UC-006 Xóa xe,
 * đổi trạng thái Ngừng hoạt động (SRS 11.2 mục 5). Xe phân mảnh theo chi nhánh của site.
 */
@Component({
  selector: 'app-xe-tab',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TagModule,
    SharedModule,
    ErrorBoxComponent,
    StatusBadgeComponent,
    TrangThaiPipe,
    VnDatePipe,
  ],
  templateUrl: './xe-tab.component.html',
  styleUrl: './xe-tab.component.scss',
})
export class XeTabComponent {
  protected readonly branch = inject(BranchContextService);
  private readonly api = inject(XeApiService);
  private readonly notify = inject(NotifyService);
  private readonly confirm = inject(ConfirmService);
  private readonly readiness = inject(ReadinessRefreshService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly vnDate = new VnDatePipe();

  protected readonly homNay = inject(TodayService).homNay();
  protected readonly ngayToiDa = inject(TodayService).homNayDate();
  /** Khóa string vì dòng p-table (let-x) không mang kiểu */
  protected readonly mauTrangThai: Record<string, 'success' | 'warn' | 'secondary'> = MAU_TRANG_THAI;

  readonly loaiXe = signal<LoaiXe[]>([]);
  readonly thamSo = signal<ThamSoKyThuat | null>(null);
  readonly danhSach = signal<Xe[]>([]);
  readonly tuKhoa = signal('');
  readonly chiNhanhLoc = signal(this.branch.maCN());
  readonly dangTai = signal(false);
  readonly dangLuu = signal(false);
  readonly daGui = signal(false);
  readonly loiThem = signal<ApiError | string | null>(null);
  readonly loiDanhSach = signal<ApiError | string | null>(null);

  readonly chiNhanhOptions = this.branch.danhSachSites.map((s) => ({ label: `${s.tenCN} (${s.maCN})`, value: s.maCN }));

  readonly form = this.fb.group({
    bienSo: ['', [Validators.required, Validators.maxLength(12)]],
    maLoaiXe: ['LX29', Validators.required],
    namSanXuat: this.fb.control<number | null>(Number(this.homNay.slice(0, 4)) - 1, [
      Validators.required,
      VnValidators.namSanXuat(this.homNay),
    ]),
    ngayDangKiem: this.fb.control<Date | null>(this.ngayToiDa, [
      Validators.required,
      VnValidators.ngayKhongSau(this.homNay),
    ]),
  });

  private readonly giaTriForm = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  /** F12, F13 – xem trước hạn đăng kiểm khi đổi năm sản xuất hoặc ngày đăng kiểm */
  readonly xemTruocHan = computed(() => {
    const v = this.giaTriForm();
    const ts = this.thamSo();
    const ngay = toIsoDateOrNull(v.ngayDangKiem);
    if (!v.namSanXuat || !ngay || !ts) return 'Nhập năm sản xuất và ngày đăng kiểm để xem hạn.';
    const ck = tinhChuKyDangKiem(v.namSanXuat, this.homNay, ts);
    const han = addMonths(ngay, ck.soThang);
    return `Xe ${ck.tuoiXe} năm tuổi (${ck.xeCu ? 'xe cũ' : 'xe mới'}) → chu kỳ ${ck.soThang} tháng → hạn đăng kiểm ${this.vnDate.transform(han)}`;
  });

  /** Lọc theo biển số ngay khi gõ (chứa chuỗi) */
  readonly xeHienThi = computed(() => {
    const q = this.tuKhoa().trim().toUpperCase();
    return q ? this.danhSach().filter((x) => x.bienSo.toUpperCase().includes(q)) : this.danhSach();
  });

  readonly coQuyenThaoTac = computed(() => this.chiNhanhLoc() === this.branch.maCN());

  constructor() {
    this.api.loaiXe().subscribe({ next: (ds) => this.loaiXe.set(ds) });
    this.api.thamSoKyThuat().subscribe({ next: (ts) => this.thamSo.set(ts) });

    effect(() => {
      const maCN = this.branch.maCN();
      untracked(() => {
        this.chiNhanhLoc.set(maCN);
        this.taiDanhSach();
      });
    });
  }

  taiDanhSach(): void {
    this.dangTai.set(true);
    this.api
      .danhSachXe(this.chiNhanhLoc())
      .pipe(finalize(() => this.dangTai.set(false)))
      .subscribe({
        next: (ds) => this.danhSach.set(ds ?? []),
        error: (err: ApiError) => this.loiDanhSach.set(err),
      });
  }

  doiChiNhanhLoc(maCN: string): void {
    this.chiNhanhLoc.set(maCN);
    this.loiDanhSach.set(null);
    this.taiDanhSach();
  }

  /** Câu báo đỏ dưới ô nhập theo bảng kiểm tra dữ liệu phía Client */
  loi(ten: 'bienSo' | 'maLoaiXe' | 'namSanXuat' | 'ngayDangKiem', nhan: string, laOChon = false): string | null {
    const c = this.form.controls[ten];
    if (!c.errors || !(c.touched || this.daGui())) return null;
    if (c.errors['required'] && laOChon) return `Vui lòng chọn ${nhan}.`;
    if (c.errors['maxlength']) return `${nhan} tối đa ${c.errors['maxlength'].requiredLength} ký tự.`;
    return thongBaoLoi(c, nhan);
  }

  tinhTrangDangKiem(x: Xe): TinhTrangHan {
    return tinhTinhTrangHan(x.hanDangKiem, this.homNay, this.thamSo()?.canhBaoNgay ?? 15);
  }

  /** UC-005 – Lưu xe và đăng kiểm (1 giao dịch sp_ThemXeVaDangKiem) */
  luuXe(): void {
    this.daGui.set(true);
    this.loiThem.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    this.dangLuu.set(true);
    this.api
      .themXeVaDangKiem({
        bienSo: v.bienSo.trim().toUpperCase(),
        maLoaiXe: v.maLoaiXe,
        namSanXuat: v.namSanXuat!,
        ngayDangKiem: toIsoDateOrNull(v.ngayDangKiem)!,
      })
      .pipe(finalize(() => this.dangLuu.set(false)))
      .subscribe({
        next: (kq) => {
          this.notify.thanhCong(
            `Đã thêm xe ${kq.maXe} · ${kq.bienSo}, đăng kiểm đến ${this.vnDate.transform(kq.hanDangKiem)}. Xe xếp chuyến được ngay.`,
          );
          this.form.controls.bienSo.reset('');
          this.daGui.set(false);
          this.taiDanhSach();
          this.readiness.baoDaLuu();
        },
        error: (err: ApiError) => this.loiThem.set(err),
      });
  }

  /** UC-006 – Xóa xe; xe đã có chuyến bị chặn bởi CSDL (E10) */
  async xoaXe(x: Xe): Promise<void> {
    const dongY = await this.confirm.hoi(
      `Xóa xe ${x.maXe} · ${x.bienSo}? Lịch sử bảo dưỡng, đăng kiểm của xe cũng bị xóa.`,
      'Xóa xe',
    );
    if (!dongY) return;

    this.loiDanhSach.set(null);
    this.api.xoaXe(x.maXe).subscribe({
      next: () => {
        this.notify.thanhCong(`Đã xóa xe ${x.maXe} · ${x.bienSo}.`);
        this.taiDanhSach();
        this.readiness.baoDaLuu();
      },
      error: (err: ApiError) => this.loiDanhSach.set(err),
    });
  }

  /** Ngừng hoạt động ↔ Hoạt động lại (thay cho xóa xe đã có chuyến) */
  async doiTrangThai(x: Xe): Promise<void> {
    const moi: TrangThaiXe = x.trangThai === 'NgungHD' ? 'HoatDong' : 'NgungHD';
    if (moi === 'NgungHD') {
      const dongY = await this.confirm.hoi(
        `Chuyển xe ${x.maXe} · ${x.bienSo} sang Ngừng hoạt động? Xe sẽ không được xếp chuyến.`,
        'Ngừng hoạt động',
      );
      if (!dongY) return;
    }

    this.loiDanhSach.set(null);
    this.api.doiTrangThai(x.maXe, moi).subscribe({
      next: () => {
        this.notify.thanhCong(`Đã chuyển xe ${x.maXe} sang "${TRANG_THAI_XE[moi]}".`);
        this.taiDanhSach();
        this.readiness.baoDaLuu();
      },
      error: (err: ApiError) => this.loiDanhSach.set(err),
    });
  }
}
