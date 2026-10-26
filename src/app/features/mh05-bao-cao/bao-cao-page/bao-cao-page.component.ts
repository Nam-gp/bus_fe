import { CommonModule } from '@angular/common';
import { Component, OnInit, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiError } from '@core/http/api-error';
import { BranchContextService } from '@core/services/branch-context.service';
import { ConfirmService } from '@core/services/confirm.service';
import { NotifyService } from '@core/services/notify.service';
import { ErrorBoxComponent } from '@shared/components/error-box/error-box.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { VnDatePipe } from '@shared/pipes/vn-date.pipe';
import { VndPipe } from '@shared/pipes/vnd.pipe';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import {
  BaoCaoApiService,
  DoanhThuLoaiXeReportItem,
  DoanhThuTuyenReportItem,
  DoanhThuXeReportItem,
  LuongTaiXeReportItem,
  TongHopBaoCaoResponse,
  TrangThaiChotLuongResponse,
  XeQuaHanBaoDuongReportItem,
} from '../bao-cao-api.service';

@Component({
  selector: 'app-bao-cao-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    TabsModule,
    TableModule,
    ButtonModule,
    SelectModule,
    DatePickerModule,
    ProgressBarModule,
    CardModule,
    TagModule,
    SharedModule,
    ErrorBoxComponent,
    VndPipe,
    VnDatePipe,
  ],
  templateUrl: './bao-cao-page.component.html',
  styleUrl: './bao-cao-page.component.scss',
})
export class BaoCaoPageComponent implements OnInit {
  protected readonly branch = inject(BranchContextService);
  private readonly api = inject(BaoCaoApiService);
  private readonly notify = inject(NotifyService);
  private readonly confirm = inject(ConfirmService);

  readonly dangTai = signal(false);
  readonly dangChotLuong = signal(false);
  readonly loi = signal<ApiError | string | null>(null);

  // Bộ lọc
  thangOptions: { label: string; value: string }[] = [];
  thang = '2025-05';
  maCN = '';
  ngayXet = '2025-05-31';

  readonly chiNhanhOptions = [
    { label: 'Tất cả chi nhánh', value: '' },
    { label: 'Hà Nội (CN01)', value: 'CN01' },
    { label: 'Đà Nẵng (CN02)', value: 'CN02' },
    { label: 'TP.HCM (CN03)', value: 'CN03' },
  ];

  readonly tabs = [
    '1. Lương tài xế',
    '2. Doanh thu theo xe',
    '3. Doanh thu theo tuyến',
    '4. Doanh thu theo loại xe',
    '5. Xe quá hạn bảo dưỡng',
  ];

  activeTab = 0;

  // Dữ liệu 3 ô số tổng
  tongHopData = signal<TongHopBaoCaoResponse>({
    thang: '2025-05',
    doanhThuThang: 0,
    soVeTinhDoanhThu: 0,
    tongLuongTaiXe: 0,
  });

  // Dữ liệu từng tab
  luongList = signal<LuongTaiXeReportItem[]>([]);
  dtXeList = signal<DoanhThuXeReportItem[]>([]);
  dtTuyenList = signal<DoanhThuTuyenReportItem[]>([]);
  dtLoaiXeList = signal<DoanhThuLoaiXeReportItem[]>([]);
  xeQuaHanList = signal<XeQuaHanBaoDuongReportItem[]>([]);
  trangThaiChot = signal<TrangThaiChotLuongResponse | null>(null);

  constructor() {
    effect(() => {
      this.branch.site();
      untracked(() => {
        this.taiToanBoBaoCao();
      });
    });
  }

  ngOnInit(): void {
    this.taiDanhSachThang();
  }

  taiDanhSachThang(): void {
    this.api.thangCoChuyen().subscribe({
      next: (ds) => {
        if (ds && ds.length > 0) {
          this.thangOptions = ds.map((t) => ({ label: `Tháng ${t}`, value: t }));
          this.thang = ds[0];
        } else {
          this.thangOptions = [
            { label: 'Tháng 2025-05', value: '2025-05' },
            { label: 'Tháng 2025-06', value: '2025-06' },
          ];
        }
        this.taiToanBoBaoCao();
      },
      error: () => {
        this.thangOptions = [
          { label: 'Tháng 2025-05', value: '2025-05' },
          { label: 'Tháng 2025-06', value: '2025-06' },
        ];
        this.taiToanBoBaoCao();
      },
    });
  }

  taiToanBoBaoCao(): void {
    this.dangTai.set(true);
    this.loi.set(null);

    // 1. Số tổng
    this.api.tongHop(this.thang, this.maCN || undefined).subscribe({
      next: (res) => this.tongHopData.set(res),
      error: (err) => this.loi.set(err),
    });

    // 2. Trạng thái chốt lương
    this.api.kiemTraTrangThaiChot(this.thang, this.maCN || undefined).subscribe({
      next: (res) => this.trangThaiChot.set(res),
    });

    // 3. Tab 1 Lương tài xế
    this.api.luongTaiXe(this.thang, this.maCN || undefined).subscribe({
      next: (res) => this.luongList.set(res || []),
    });

    // 4. Tab 2 Doanh thu xe
    this.api.doanhThuTheoXe(this.thang, this.maCN || undefined).subscribe({
      next: (res) => this.dtXeList.set(res || []),
    });

    // 5. Tab 3 Doanh thu tuyến
    this.api.doanhThuTheoTuyen(this.thang, this.maCN || undefined).subscribe({
      next: (res) => this.dtTuyenList.set(res || []),
    });

    // 6. Tab 4 Doanh thu loại xe
    this.api.doanhThuTheoLoaiXe(this.thang, this.maCN || undefined).subscribe({
      next: (res) => this.dtLoaiXeList.set(res || []),
    });

    // 7. Tab 5 Xe quá hạn
    this.api.xeQuaHanBaoDuong(this.ngayXet, this.maCN || undefined).subscribe({
      next: (res) => {
        this.xeQuaHanList.set(res || []);
        this.dangTai.set(false);
      },
      error: (err) => {
        this.dangTai.set(false);
        this.loi.set(err);
      },
    });
  }

  onFilterChange(): void {
    this.taiToanBoBaoCao();
  }

  onTabChange(index: string | number | undefined): void {
    this.activeTab = Number(index) || 0;
  }

  async chotLuongThang(): Promise<void> {
    if (!this.branch.canEdit()) {
      this.notify.canhBao('Chỉ site Hà Nội (/hn) mới có quyền chốt lương tháng vào bảng BangLuong.');
      return;
    }

    const tt = this.trangThaiChot();
    const xacNhanMsg = tt?.daChot
      ? `Tháng ${this.thang} đã chốt lương (${tt.soDong} dòng). Bạn có chắc chắn muốn chốt lại để ghi đè dữ liệu mới?`
      : `Xác nhận chốt bảng lương cho tháng ${this.thang}? Sau khi chốt, số liệu sẽ được lưu cố định vào BangLuong.`;

    const dongY = await this.confirm.hoi(xacNhanMsg, 'Chốt lương tháng ' + this.thang);
    if (!dongY) return;

    this.dangChotLuong.set(true);
    this.api.chotLuong(this.thang, this.maCN || undefined).subscribe({
      next: (res) => {
        this.dangChotLuong.set(false);
        this.notify.thanhCong(res.thongBao || `Đã chốt lương tháng ${this.thang} thành công.`);
        this.trangThaiChot.set(res);
        this.taiToanBoBaoCao();
      },
      error: (err) => {
        this.dangChotLuong.set(false);
        this.notify.loi(err.thongBao || 'Lỗi khi chốt lương tháng');
      },
    });
  }
}
