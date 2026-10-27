import { CommonModule } from '@angular/common';
import { Component, OnInit, effect, inject, signal, untracked } from '@angular/core';
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
  TaiXeResponse,
  ThemTaiXeRequest,
  ThietLapApiService,
} from '../thiet-lap-api.service';

@Component({
  selector: 'app-tai-xe',
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
  templateUrl: './tai-xe.component.html',
  styleUrl: './tai-xe.component.scss',
})
export class TaiXeComponent implements OnInit {
  protected readonly branch = inject(BranchContextService);
  private readonly api = inject(ThietLapApiService);
  private readonly notify = inject(NotifyService);
  private readonly readinessRefresh = inject(ReadinessRefreshService);

  readonly dangTai = signal(false);
  readonly dangThem = signal(false);
  readonly loiThem = signal<ApiError | string | null>(null);

  // Form Thêm tài xế
  hoTen = '';
  namSinh = 1990;
  cccd = '';
  hangGplx = 'D';
  soGplx = '';
  soDienThoai = '';
  soNha = '';
  phuong = '';
  tinh = 'Hà Nội';

  readonly hangOptions = [
    { label: 'D · Xe 10 đến 30 chỗ', value: 'D' },
    { label: 'E · Xe trên 30 chỗ', value: 'E' },
    { label: 'FC · Xe đầu kéo/rơ moóc', value: 'FC' },
  ];

  // Danh sách chi nhánh: 3 chi nhánh cụ thể
  readonly chiNhanhOptions = [
    { label: 'Hà Nội (CN01)', value: 'CN01' },
    { label: 'Đà Nẵng (CN02)', value: 'CN02' },
    { label: 'TP.HCM (CN03)', value: 'CN03' },
  ];

  chiNhanhLoc = 'CN01';
  danhSachTaiXe: TaiXeResponse[] = [];

  constructor() {
    effect(() => {
      const site = this.branch.site();
      untracked(() => {
        if (site === 'dn') {
          this.chiNhanhLoc = 'CN02';
          this.tinh = 'Đà Nẵng';
        } else if (site === 'hcm') {
          this.chiNhanhLoc = 'CN03';
          this.tinh = 'TP.HCM';
        } else {
          this.chiNhanhLoc = 'CN01';
          this.tinh = 'Hà Nội';
        }
        this.taiDanhSach();
      });
    });
  }

  ngOnInit(): void {}

  /**
   * Phân quyền thao tác:
   * Chỉ khi chi nhánh đang xem trùng với site hiện tại trên URL thì cột thao tác mới được hiển thị.
   * Ở site khác thì không được thao tác.
   */
  coQuyenThaoTac(): boolean {
    return this.chiNhanhLoc === this.branch.maCN();
  }

  taiDanhSach(): void {
    this.dangTai.set(true);
    const param = this.chiNhanhLoc ? { maCN: this.chiNhanhLoc } : undefined;

    // Gọi API qua site hiện tại theo nguyên tắc: ở site nào chỉ kết nối backend URL site đó
    this.api.layDanhSachTaiXe(param).subscribe({
      next: (data) => {
        this.dangTai.set(false);
        this.danhSachTaiXe = data || [];
      },
      error: (err) => {
        this.dangTai.set(false);
        this.notify.loi(err.thongBao || 'Lỗi khi tải danh sách tài xế');
      },
    });
  }

  doiChiNhanhLoc(cn: string): void {
    this.chiNhanhLoc = cn;
    this.taiDanhSach();
  }

  themTaiXe(): void {
    this.loiThem.set(null);
    const rawTen = this.hoTen.trim();
    if (!rawTen) {
      this.loiThem.set('Vui lòng nhập Họ và tên tài xế (E01).');
      return;
    }

    const parts = rawTen.split(/\s+/);
    const ten = parts.pop() || '';
    const hoDem = parts.join(' ') || 'Nguyễn';

    const curYear = new Date().getFullYear();
    if (!this.namSinh || this.namSinh < 1950 || curYear - this.namSinh < 21) {
      this.loiThem.set('Tài xế phải từ 21 tuổi trở lên (năm sinh ≤ ' + (curYear - 21) + ') (E13).');
      return;
    }

    const cccdClean = this.cccd.trim();
    if (!/^\d{12}$/.test(cccdClean)) {
      this.loiThem.set('CCCD phải gồm đúng 12 chữ số (E11).');
      return;
    }

    const sdtClean = this.soDienThoai.trim();
    if (sdtClean && !/^0\d{9}$/.test(sdtClean)) {
      this.loiThem.set('Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0 (E23).');
      return;
    }

    // Backend tự động gán tài xế vào chi nhánh của site đang gọi qua URL
    // Format năm sinh sang java.time.LocalDate: yyyy-MM-dd (ví dụ 1991-01-01)
    const namSinhPad = String(this.namSinh).padStart(4, '0');
    const ngaySinhStr = `${namSinhPad}-01-01`;

    const req: ThemTaiXeRequest = {
      hoDem,
      ten,
      ngaySinh: ngaySinhStr,
      namSinh: this.namSinh,
      cccd: cccdClean,
      hangGplx: this.hangGplx,
      soGplx: this.soGplx.trim() || `GPLX_${cccdClean.slice(-6)}`,
      soDienThoai: sdtClean,
      soNha: this.soNha.trim() || 'Số 1',
      phuong: this.phuong.trim() || 'Phường 1',
      tinh: this.tinh.trim() || this.branch.tenCN(),
      maCN: this.branch.maCN(),
    };

    this.dangThem.set(true);
    this.api.themTaiXe(req).subscribe({
      next: (tx) => {
        this.dangThem.set(false);
        this.notify.thanhCong(`Đã thêm tài xế ${tx.maTX} · ${tx.hoTen} vào chi nhánh ${this.branch.tenCN()}.`);
        this.hoTen = '';
        this.cccd = '';
        this.soGplx = '';
        this.soDienThoai = '';
        this.taiDanhSach();
        this.readinessRefresh.baoDaLuu();
      },
      error: (err) => {
        this.dangThem.set(false);
        this.loiThem.set(err);
      },
    });
  }

  doiTrangThai(tx: TaiXeResponse): void {
    if (!this.coQuyenThaoTac() || tx.maCN !== this.branch.maCN()) {
      this.notify.canhBao(`Bạn đang ở site ${this.branch.tenCN()}, chỉ có quyền thao tác tài xế thuộc chi nhánh ${this.branch.tenCN()}.`);
      return;
    }

    const moi = tx.trangThai === 'DangLam' ? 'NghiViec' : 'DangLam';
    const nhanMoi = moi === 'DangLam' ? 'Đang làm' : 'Nghỉ việc';

    this.api.doiTrangThaiTaiXe(tx.maTX, moi).subscribe({
      next: () => {
        this.notify.thanhCong(`Đã đổi trạng thái tài xế ${tx.maTX} sang "${nhanMoi}".`);
        this.taiDanhSach();
        this.readinessRefresh.baoDaLuu();
      },
      error: (err) => {
        this.notify.loi(err.thongBao || 'Lỗi khi cập nhật trạng thái tài xế');
      },
    });
  }
}
