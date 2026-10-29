import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import { ApiError } from '@core/http/api-error';
import { BranchContextService } from '@core/services/branch-context.service';
import { ConfirmService } from '@core/services/confirm.service';
import { NotifyService } from '@core/services/notify.service';
import { TodayService } from '@core/services/today.service';
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

export interface BarReportItem {
  label: string;
  val: number;
  w: string;
}

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
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly today = inject(TodayService);

  readonly dangTai = signal(false);
  readonly dangChotLuong = signal(false);
  readonly loi = signal<ApiError | string | null>(null);

  // Bộ lọc
  thangOptions: { label: string; value: string }[] = [];
  thang = '2025-05';
  maCN = 'CN01';
  ngayXet = '';
  isBranchDisabled = false;
  private daChinhSuaNgayXet = false;

  // Tháng đã được áp dụng vào dữ liệu báo cáo (chỉ cập nhật khi ấn nút Cập nhật)
  readonly thangDaApDung = signal<string>('2025-05');

  // Bộ lọc bỏ "Tất cả chi nhánh", chỉ còn danh sách các chi nhánh cụ thể
  readonly chiNhanhOptions = [
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

  // Dữ liệu 3 ô số tổng đầu màn hình
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

  private previousSite: string | null = null;

  constructor() {
    effect(() => {
      const currentSite = this.branch.site();
      untracked(() => {
        if (this.previousSite !== null && this.previousSite !== currentSite) {
          if (!this.daChinhSuaNgayXet) {
            this.ngayXet = this.today.homNay();
          }
          this.apDungPhanQuyenSite(currentSite);
          this.taiDanhSachThangVaBaoCao();
        }
        this.previousSite = currentSite;
      });
    });
  }

  ngOnInit(): void {
    // Ngày xét luôn lấy ngày hiện tại khi vào trang và chưa chỉnh sửa
    this.ngayXet = this.today.homNay();
    this.daChinhSuaNgayXet = false;

    // Thứ tự dữ liệu: 1. Xác định chi nhánh hiện tại theo site -> 2. Lấy danh sách tháng & chọn tháng gần nhất -> 3. Lấy dữ liệu tiếp theo
    this.apDungPhanQuyenSite(this.branch.site());
    this.taiDanhSachThangVaBaoCao();
  }

  onNgayXetInput(): void {
    this.daChinhSuaNgayXet = true;
  }

  /**
   * Phân quyền bộ lọc theo site:
   * - Site HN (/hn): Mặc định CN01, có thể chọn CN01, CN02, CN03.
   * - Site DN (/dn) & TP.HCM (/hcm): Cố định chi nhánh theo site đó (CN02 / CN03), khóa dropdown.
   */
  apDungPhanQuyenSite(site: string): void {
    if (site === 'hn') {
      if (!this.maCN || this.maCN === 'CN02' || this.maCN === 'CN03') {
        this.maCN = 'CN01';
      }
      this.isBranchDisabled = false;
    } else if (site === 'dn') {
      this.maCN = 'CN02';
      this.isBranchDisabled = true;
    } else if (site === 'hcm') {
      this.maCN = 'CN03';
      this.isBranchDisabled = true;
    }
    this.cdr.detectChanges();
  }

  /**
   * Hiển thị tháng theo định dạng MM/yyyy dựa trên tháng đã áp dụng vào báo cáo
   */
  getThangHienThi(thangVal?: string): string {
    const t = thangVal || this.thangDaApDung();
    if (!t) return '';
    const parts = t.split('-');
    if (parts.length === 2) {
      return `${parts[1]}/${parts[0]}`;
    }
    return t;
  }

  getBlInfo(): string {
    const tt = this.trangThaiChot();
    const thang = this.thangDaApDung();
    if (tt?.daChot) {
      const soDong = tt.soDong ?? this.luongList().length;
      return `BangLuong đang có ${soDong} dòng của tháng ${thang} (đã chốt).`;
    }
    return `Chưa chốt lương tháng ${thang}.`;
  }

  /**
   * Biểu đồ thanh ngang Doanh thu theo xe (chỉ hiển thị xe có doanh thu > 0)
   */
  get dtXeBars(): BarReportItem[] {
    const items = this.dtXeList().filter((x) => (x.doanhThu ?? 0) > 0);
    if (items.length === 0) return [];
    const max = Math.max(...items.map((x) => x.doanhThu));
    return items
      .sort((a, b) => b.doanhThu - a.doanhThu)
      .map((x) => ({
        label: x.bienSo ? `${x.bienSo}${x.tenLoaiXe ? ' (' + x.tenLoaiXe + ')' : ''}` : x.maXe,
        val: x.doanhThu,
        w: max > 0 ? `${((x.doanhThu * 100) / max).toFixed(1)}%` : '0%',
      }));
  }

  /**
   * Biểu đồ thanh ngang Doanh thu theo tuyến (chỉ hiển thị tuyến có doanh thu > 0)
   */
  get dtTuyenBars(): BarReportItem[] {
    const items = this.dtTuyenList().filter((t) => (t.doanhThu ?? 0) > 0);
    if (items.length === 0) return [];
    const max = Math.max(...items.map((t) => t.doanhThu));
    return items
      .sort((a, b) => b.doanhThu - a.doanhThu)
      .map((t) => ({
        label: t.tenTuyen || t.maTuyen,
        val: t.doanhThu,
        w: max > 0 ? `${((t.doanhThu * 100) / max).toFixed(1)}%` : '0%',
      }));
  }

  /**
   * Biểu đồ thanh ngang Doanh thu theo loại xe (chỉ hiển thị loại xe có doanh thu > 0)
   */
  get dtLoaiXeBars(): BarReportItem[] {
    const items = this.dtLoaiXeList().filter((l) => (l.doanhThu ?? 0) > 0);
    if (items.length === 0) return [];
    const max = Math.max(...items.map((l) => l.doanhThu));
    return items
      .sort((a, b) => b.doanhThu - a.doanhThu)
      .map((l) => ({
        label: l.tenLoaiXe || l.maLoaiXe,
        val: l.doanhThu,
        w: max > 0 ? `${((l.doanhThu * 100) / max).toFixed(1)}%` : '0%',
      }));
  }

  /**
   * Thứ tự: Lấy danh sách tháng -> sắp xếp giảm dần -> chọn tháng gần nhất -> tải dữ liệu báo cáo
   */
  taiDanhSachThangVaBaoCao(): void {
    this.dangTai.set(true);
    this.api.thangCoChuyen().pipe(catchError(() => of([] as string[]))).subscribe({
      next: (ds) => {
        let danhSachThang = [...(ds || [])];
        if (danhSachThang.length === 0) {
          danhSachThang = ['2025-06', '2025-05'];
        }
        // Sắp xếp giảm dần để tháng gần nhất đứng đầu danh sách
        danhSachThang.sort((a, b) => b.localeCompare(a));

        this.thangOptions = danhSachThang.map((t) => ({ label: t, value: t }));
        // Luôn chọn tháng gần nhất
        this.thang = danhSachThang[0];

        // Lấy dữ liệu tiếp theo với tháng gần nhất + chi nhánh hiện tại
        this.taiToanBoBaoCao();
      },
      error: () => {
        this.thangOptions = [
          { label: '2025-06', value: '2025-06' },
          { label: '2025-05', value: '2025-05' },
        ];
        this.thang = '2025-06';
        this.taiToanBoBaoCao();
      },
    });
  }

  /**
   * Tải toàn bộ dữ liệu báo cáo và 3 thẻ KPI theo bộ lọc hiện tại
   * (Chỉ chạy khi khởi tạo hoặc khi người dùng ấn nút Cập nhật)
   */
  taiToanBoBaoCao(): void {
    this.dangTai.set(true);
    this.loi.set(null);

    const thang = this.thang;
    const maCN = this.maCN || undefined;
    const ngayXet = this.ngayXet;

    // Cập nhật tháng đã áp dụng vào báo cáo khi thực hiện tải dữ liệu
    this.thangDaApDung.set(thang);

    const reqTongHop$ = this.api.tongHop(thang, maCN).pipe(catchError(() => of(null)));
    const reqTrangThai$ = this.api.kiemTraTrangThaiChot(thang, maCN).pipe(catchError(() => of(null)));
    const reqLuong$ = this.api.luongTaiXe(thang, maCN).pipe(catchError(() => of([] as LuongTaiXeReportItem[])));
    const reqDtXe$ = this.api.doanhThuTheoXe(thang, maCN).pipe(catchError(() => of([] as DoanhThuXeReportItem[])));
    const reqDtTuyen$ = this.api.doanhThuTheoTuyen(thang, maCN).pipe(catchError(() => of([] as DoanhThuTuyenReportItem[])));
    const reqDtLoai$ = this.api.doanhThuTheoLoaiXe(thang, maCN).pipe(catchError(() => of([] as DoanhThuLoaiXeReportItem[])));
    const reqXeQuaHan$ = this.api.xeQuaHanBaoDuong(ngayXet, maCN).pipe(catchError(() => of([] as XeQuaHanBaoDuongReportItem[])));

    forkJoin({
      tongHop: reqTongHop$,
      trangThai: reqTrangThai$,
      luong: reqLuong$,
      dtXe: reqDtXe$,
      dtTuyen: reqDtTuyen$,
      dtLoai: reqDtLoai$,
      xeQuaHan: reqXeQuaHan$,
    }).subscribe({
      next: (res) => {
        if (res.tongHop) {
          this.tongHopData.set(res.tongHop);
        } else {
          this.tongHopData.set({
            thang,
            doanhThuThang: 0,
            soVeTinhDoanhThu: 0,
            tongLuongTaiXe: 0,
          });
        }
        this.trangThaiChot.set(res.trangThai);
        this.luongList.set(res.luong || []);
        this.dtXeList.set(res.dtXe || []);
        this.dtTuyenList.set(res.dtTuyen || []);
        this.dtLoaiXeList.set(res.dtLoai || []);
        this.xeQuaHanList.set(res.xeQuaHan || []);

        this.dangTai.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.dangTai.set(false);
        this.loi.set(err);
        this.cdr.detectChanges();
      },
    });
  }

  capNhatDuLieu(): void {
    this.taiToanBoBaoCao();
  }

  onTabChange(index: string | number | undefined): void {
    this.activeTab = Number(index) || 0;
  }

  async chotLuongThang(): Promise<void> {
    if (!this.branch.isHn()) {
      this.notify.canhBao('Chỉ site Hà Nội (/hn) mới có quyền chốt lương tháng vào bảng BangLuong.');
      return;
    }

    const thang = this.thangDaApDung();
    const tt = this.trangThaiChot();
    if (tt?.daChot) {
      this.notify.canhBao(`Tháng ${thang} đã được chốt trước đó.`);
      return;
    }

    const xacNhanMsg = `Xác nhận chốt bảng lương cho tháng ${thang}? Sau khi chốt, số liệu sẽ được lưu cố định vào BangLuong.`;

    const dongY = await this.confirm.hoi(xacNhanMsg, 'Chốt lương tháng ' + thang);
    if (!dongY) return;

    this.dangChotLuong.set(true);
    this.api.chotLuong(thang, this.maCN || undefined).subscribe({
      next: (res) => {
        this.dangChotLuong.set(false);
        this.notify.thanhCong(res.thongBao || `Đã chốt lương tháng ${thang} thành công.`);
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
