import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiError } from '@core/http/api-error';
import { BranchContextService } from '@core/services/branch-context.service';
import { NotifyService } from '@core/services/notify.service';
import { ReadinessRefreshService } from '@core/services/readiness-refresh.service';
import { ErrorBoxComponent } from '@shared/components/error-box/error-box.component';
import { VndPipe } from '@shared/pipes/vnd.pipe';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import {
  CapNhatGiaVeRequest,
  ThemTuyenRequest,
  ThietLapApiService,
  TuyenResponse,
} from '../thiet-lap-api.service';

interface TuyenEditableRow extends TuyenResponse {
  giaThuongInput: number;
  giaCuoiTuanInput: number;
  giaMuaDLInput: number;
  giaLeTetInput: number;
}

@Component({
  selector: 'app-tuyen-gia',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TableModule,
    TagModule,
    SharedModule,
    ErrorBoxComponent,
    VndPipe,
  ],
  templateUrl: './tuyen-gia.component.html',
  styleUrl: './tuyen-gia.component.scss',
})
export class TuyenGiaComponent implements OnInit {
  protected readonly branch = inject(BranchContextService);
  private readonly api = inject(ThietLapApiService);
  private readonly notify = inject(NotifyService);
  private readonly readinessRefresh = inject(ReadinessRefreshService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly dangTai = signal(false);
  readonly dangThemTuyen = signal(false);
  readonly dangLuuGia = signal(false);
  readonly loiThemTuyen = signal<ApiError | string | null>(null);
  readonly loiLuuGia = signal<ApiError | string | null>(null);

  // Form Thêm tuyến
  diemDau = '';
  diemCuoi = '';
  doDaiKm = 100;
  capDo = 1;
  giaThuong = 150000;
  giaCuoiTuan = 170000;
  giaMuaDL = 190000;
  giaLeTet = 220000;

  readonly capDoOptions = [
    { label: 'Cấp 1 · Đường bằng', value: 1 },
    { label: 'Cấp 2 · Đèo nhẹ', value: 2 },
    { label: 'Cấp 3 · Đèo dốc', value: 3 },
  ];

  // Danh sách tuyến và giá
  danhSachTuyen: TuyenEditableRow[] = [];

  ngOnInit(): void {
    this.taiDanhSachTuyen();
  }

  taiDanhSachTuyen(): void {
    this.dangTai.set(true);
    this.api.layDanhSachTuyen().subscribe({
      next: (list) => {
        this.dangTai.set(false);
        this.danhSachTuyen = (list || []).map((t) => ({
          ...t,
          giaThuongInput: t.giaThuong ?? 0,
          giaCuoiTuanInput: t.giaCuoiTuan ?? 0,
          giaMuaDLInput: t.giaMuaDL ?? 0,
          giaLeTetInput: t.giaLeTet ?? 0,
        }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.dangTai.set(false);
        this.loiLuuGia.set(err);
        this.cdr.detectChanges();
      },
    });
  }

  themTuyen(): void {
    if (!this.branch.canEdit()) {
      this.notify.canhBao('Chỉ site Hà Nội (/hn) mới có quyền thêm tuyến đường và bảng giá.');
      return;
    }

    this.loiThemTuyen.set(null);
    const dau = this.diemDau.trim();
    const cuoi = this.diemCuoi.trim();

    if (!dau) {
      this.loiThemTuyen.set('Vui lòng nhập Điểm đầu.');
      return;
    }
    if (!cuoi) {
      this.loiThemTuyen.set('Vui lòng nhập Điểm cuối.');
      return;
    }
    if (dau.toLowerCase() === cuoi.toLowerCase()) {
      this.loiThemTuyen.set('Điểm đầu và điểm cuối phải khác nhau (E04).');
      return;
    }
    if (this.doDaiKm <= 0) {
      this.loiThemTuyen.set('Độ dài tuyến phải lớn hơn 0 km (E05).');
      return;
    }
    if (
      this.giaThuong <= 0 ||
      this.giaCuoiTuan <= 0 ||
      this.giaMuaDL <= 0 ||
      this.giaLeTet <= 0
    ) {
      this.loiThemTuyen.set('Mọi mức giá vé khởi tạo phải lớn hơn 0 (E02).');
      return;
    }

    const req: ThemTuyenRequest = {
      diemDau: dau,
      diemCuoi: cuoi,
      doDaiKm: this.doDaiKm,
      capDo: this.capDo,
      giaThuong: this.giaThuong,
      giaCuoiTuan: this.giaCuoiTuan,
      giaMuaDL: this.giaMuaDL,
      giaLeTet: this.giaLeTet,
    };

    this.dangThemTuyen.set(true);
    this.api.themTuyenVaGia(req).subscribe({
      next: (tuyenMoi) => {
        this.dangThemTuyen.set(false);
        this.notify.thanhCong(
          `Đã thêm tuyến ${tuyenMoi.maTuyen} (${tuyenMoi.diemDau} - ${tuyenMoi.diemCuoi}) kèm đủ 4 mức giá.`
        );
        this.diemDau = '';
        this.diemCuoi = '';
        this.taiDanhSachTuyen();
        this.readinessRefresh.baoDaLuu();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.dangThemTuyen.set(false);
        this.loiThemTuyen.set(err);
        this.cdr.detectChanges();
      },
    });
  }

  luuThayDoiGia(): void {
    if (!this.branch.canEdit()) {
      this.notify.canhBao('Chỉ site Hà Nội (/hn) mới có quyền cập nhật bảng giá vé.');
      return;
    }

    this.loiLuuGia.set(null);
    const updates: CapNhatGiaVeRequest[] = [];

    for (const t of this.danhSachTuyen) {
      if (
        t.giaThuongInput <= 0 ||
        t.giaCuoiTuanInput <= 0 ||
        t.giaMuaDLInput <= 0 ||
        t.giaLeTetInput <= 0
      ) {
        this.loiLuuGia.set(`Mọi mức giá của tuyến ${t.maTuyen} phải lớn hơn 0.`);
        return;
      }

      if (t.giaThuongInput !== t.giaThuong) {
        updates.push({ maTuyen: t.maTuyen, maLoaiNgay: 'THUONG', giaVe: t.giaThuongInput });
      }
      if (t.giaCuoiTuanInput !== t.giaCuoiTuan) {
        updates.push({ maTuyen: t.maTuyen, maLoaiNgay: 'CUOITUAN', giaVe: t.giaCuoiTuanInput });
      }
      if (t.giaMuaDLInput !== t.giaMuaDL) {
        updates.push({ maTuyen: t.maTuyen, maLoaiNgay: 'MUADL', giaVe: t.giaMuaDLInput });
      }
      if (t.giaLeTetInput !== t.giaLeTet) {
        updates.push({ maTuyen: t.maTuyen, maLoaiNgay: 'LETET', giaVe: t.giaLeTetInput });
      }
    }

    if (updates.length === 0) {
      this.notify.canhBao('Chưa có giá vé nào được chỉnh sửa.');
      return;
    }

    this.dangLuuGia.set(true);
    this.api.capNhatGiaVeHangLoat(updates).subscribe({
      next: () => {
        this.dangLuuGia.set(false);
        this.notify.thanhCong(`Đã cập nhật ${updates.length} mức giá vé thành công.`);
        this.taiDanhSachTuyen();
        this.readinessRefresh.baoDaLuu();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.dangLuuGia.set(false);
        this.loiLuuGia.set(err);
        this.cdr.detectChanges();
      },
    });
  }
}
