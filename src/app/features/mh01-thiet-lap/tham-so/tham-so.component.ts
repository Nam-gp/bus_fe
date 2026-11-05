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
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import {
  CauHinhTongHopResponse,
  ThamSoBaoDuongRequest,
  ThamSoThuLaoRequest,
  ThietLapApiService,
} from '../thiet-lap-api.service';

export interface LichLoaiNgayPrototype {
  loaiNgay: string;
  apDung: string;
  mucGia: string;
}

@Component({
  selector: 'app-tham-so',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputNumberModule,
    TableModule,
    TagModule,
    SharedModule,
    ErrorBoxComponent,
    VndPipe,
  ],
  templateUrl: './tham-so.component.html',
  styleUrl: './tham-so.component.scss',
})
export class ThamSoComponent implements OnInit {
  private static readonly MAC_DINH_CHU_KY_BD = 360;

  protected readonly branch = inject(BranchContextService);
  private readonly api = inject(ThietLapApiService);
  private readonly notify = inject(NotifyService);
  private readonly readinessRefresh = inject(ReadinessRefreshService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly dangTai = signal(false);
  readonly dangSuaThuLao = signal(false);
  readonly dangSuaBaoDuong = signal(false);
  private snapshotThuLao: ThamSoThuLaoRequest | null = null;
  private snapshotBaoDuong: ThamSoBaoDuongRequest | null = null;
  readonly dangLuuThuLao = signal(false);
  readonly dangLuuBaoDuong = signal(false);
  readonly loiThuLao = signal<ApiError | string | null>(null);
  readonly loiBaoDuong = signal<ApiError | string | null>(null);

  // Form Thù lao
  donGiaKm = 2000;
  hsLai = 1.0;
  hsPhu = 0.6;
  hsLuongCap1 = 1.0;
  hsLuongCap2 = 1.2;
  hsLuongCap3 = 1.5;

  // Form Bảo dưỡng & Đăng kiểm
  chuKyBd = ThamSoComponent.MAC_DINH_CHU_KY_BD;
  kmMoiNgayBd = 100;
  canhBaoNgay = 15;
  hsDuongKhoCap1 = 1.0;
  hsDuongKhoCap2 = 1.3;
  hsDuongKhoCap3 = 1.6;
  chuKyDkCu = 6;
  chuKyDkMoi = 12;
  tuoiXeCu = 5;

  // Dữ liệu bảng Lịch loại ngày (quyết định giá vé) hardcode chuẩn theo prototype
  readonly lichLoaiNgayList: LichLoaiNgayPrototype[] = [
    {
      loaiNgay: 'Lễ tết',
      apDung: '25/01–02/02 (Tết), 30/04–04/05, 30/08–02/09',
      mucGia: '≈ 130%',
    },
    {
      loaiNgay: 'Mùa du lịch',
      apDung: '01/06–31/08',
      mucGia: '≈ 115%',
    },
    {
      loaiNgay: 'Cuối tuần',
      apDung: 'Thứ 7, Chủ nhật (ngoài 2 loại trên)',
      mucGia: '≈ 110%',
    },
    {
      loaiNgay: 'Ngày thường',
      apDung: 'Các ngày còn lại',
      mucGia: '100%',
    },
  ];

  ngOnInit(): void {
    this.taiDuLieu();
  }

  taiDuLieu(): void {
    this.dangTai.set(true);
    this.api.layThamSo().subscribe({
      next: (res) => {
        this.dangTai.set(false);
        this.apDungThuLao(res);
        this.apDungBaoDuong(res);

        // Kích hoạt ngay Change Detection để Angular đồng bộ giá trị vào các ô input PrimeNG
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.dangTai.set(false);
        this.loiThuLao.set(err);
        this.cdr.detectChanges();
      },
    });
  }

  private apDungThuLao(res: CauHinhTongHopResponse): void {
    if (res.thamSo) {
      this.donGiaKm = res.thamSo['DON_GIA_KM'] ?? this.donGiaKm;
      this.hsLai = res.thamSo['HS_LAI'] ?? this.hsLai;
      this.hsPhu = res.thamSo['HS_PHU'] ?? this.hsPhu;
    }
    for (const item of res.doPhucTap ?? []) {
      if (item.capDo === 1) this.hsLuongCap1 = item.heSoLuong;
      if (item.capDo === 2) this.hsLuongCap2 = item.heSoLuong;
      if (item.capDo === 3) this.hsLuongCap3 = item.heSoLuong;
    }
  }

  batDauSuaThuLao(): void {
    if (!this.branch.canEdit() || this.dangTai() || this.dangLuuThuLao() || this.dangSuaThuLao()) return;

    this.snapshotThuLao = {
      donGiaKm: this.donGiaKm,
      hsLai: this.hsLai,
      hsPhu: this.hsPhu,
      hsLuongCap1: this.hsLuongCap1,
      hsLuongCap2: this.hsLuongCap2,
      hsLuongCap3: this.hsLuongCap3,
    };
    this.dangSuaThuLao.set(true);
  }

  huySuaThuLao(): void {
    if (this.dangLuuThuLao()) return;
    if (this.snapshotThuLao) {
      Object.assign(this, this.snapshotThuLao);
    }
    this.snapshotThuLao = null;
    this.loiThuLao.set(null);
    this.dangSuaThuLao.set(false);
  }

  private taiLaiThuLao(): void {
    this.api.layThamSo().subscribe({
      next: (res) => {
        this.apDungThuLao(res);
        this.dangLuuThuLao.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.dangLuuThuLao.set(false);
        this.loiThuLao.set(err);
        this.cdr.detectChanges();
      },
    });
  }

  private apDungBaoDuong(res: CauHinhTongHopResponse): void {
    if (res.thamSo) {
      this.chuKyBd = res.thamSo['CHU_KY_BD'] ?? this.chuKyBd;
      this.kmMoiNgayBd = res.thamSo['KM_MOI_NGAY_BD'] ?? this.kmMoiNgayBd;
      this.canhBaoNgay = res.thamSo['CANH_BAO_NGAY'] ?? this.canhBaoNgay;
      this.chuKyDkCu = res.thamSo['CHU_KY_DK_CU'] ?? this.chuKyDkCu;
      this.chuKyDkMoi = res.thamSo['CHU_KY_DK_MOI'] ?? this.chuKyDkMoi;
      this.tuoiXeCu = res.thamSo['TUOI_XE_CU'] ?? this.tuoiXeCu;
    }
    for (const item of res.doPhucTap ?? []) {
      if (item.capDo === 1) this.hsDuongKhoCap1 = item.heSoDuongKho;
      if (item.capDo === 2) this.hsDuongKhoCap2 = item.heSoDuongKho;
      if (item.capDo === 3) this.hsDuongKhoCap3 = item.heSoDuongKho;
    }
  }

  batDauSuaBaoDuong(): void {
    if (!this.branch.canEdit() || this.dangTai() || this.dangLuuBaoDuong() || this.dangSuaBaoDuong()) return;

    this.snapshotBaoDuong = {
      chuKyBd: this.chuKyBd,
      kmMoiNgayBd: this.kmMoiNgayBd,
      canhBaoNgay: this.canhBaoNgay,
      chuKyDkCu: this.chuKyDkCu,
      chuKyDkMoi: this.chuKyDkMoi,
      tuoiXeCu: this.tuoiXeCu,
      hsDuongKhoCap1: this.hsDuongKhoCap1,
      hsDuongKhoCap2: this.hsDuongKhoCap2,
      hsDuongKhoCap3: this.hsDuongKhoCap3,
    };
    this.dangSuaBaoDuong.set(true);
  }

  huySuaBaoDuong(): void {
    if (this.dangLuuBaoDuong()) return;
    if (this.snapshotBaoDuong) {
      Object.assign(this, this.snapshotBaoDuong);
    }
    this.snapshotBaoDuong = null;
    this.loiBaoDuong.set(null);
    this.dangSuaBaoDuong.set(false);
  }

  private taiLaiBaoDuong(): void {
    this.api.layThamSo().subscribe({
      next: (res) => {
        this.apDungBaoDuong(res);
        this.dangLuuBaoDuong.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.dangLuuBaoDuong.set(false);
        this.loiBaoDuong.set(err);
        this.cdr.detectChanges();
      },
    });
  }

  get viDuLaiXe(): number {
    return Math.round(300 * this.donGiaKm * this.hsLuongCap2 * this.hsLai);
  }

  get viDuPhuXe(): number {
    return Math.round(300 * this.donGiaKm * this.hsLuongCap2 * this.hsPhu);
  }

  // Getters kiểm tra độ dài ký tự
  get loiDonGiaKm(): string | null {
    return this.donGiaKm != null && String(Math.trunc(this.donGiaKm)).length > 9
      ? 'Đơn giá không được vượt quá 9 ký tự'
      : null;
  }

  get loiHsLai(): string | null {
    return this.hsLai != null && String(this.hsLai).length > 5
      ? 'Hệ số lái xe không được vượt quá 5 ký tự'
      : null;
  }

  get loiHsPhu(): string | null {
    return this.hsPhu != null && String(this.hsPhu).length > 5
      ? 'Hệ số phụ xe không được vượt quá 5 ký tự'
      : null;
  }

  get loiHsLuongCap1(): string | null {
    return this.hsLuongCap1 != null && String(this.hsLuongCap1).length > 5
      ? 'Hệ số lương cấp 1 không được vượt quá 5 ký tự'
      : null;
  }

  get loiHsLuongCap2(): string | null {
    return this.hsLuongCap2 != null && String(this.hsLuongCap2).length > 5
      ? 'Hệ số lương cấp 2 không được vượt quá 5 ký tự'
      : null;
  }

  get loiHsLuongCap3(): string | null {
    return this.hsLuongCap3 != null && String(this.hsLuongCap3).length > 5
      ? 'Hệ số lương cấp 3 không được vượt quá 5 ký tự'
      : null;
  }

  get loiChuKyBd(): string | null {
    return this.chuKyBd != null && String(Math.trunc(this.chuKyBd)).length > 4
      ? 'Chu kỳ bảo dưỡng tối đa không được vượt quá 4 ký tự'
      : null;
  }

  // Xử lý khi người dùng nhập dữ liệu (ngModelChange) - chặn không cho vượt quá số ký tự
  onDonGiaKmChange(): void {
    if (this.donGiaKm != null) {
      const s = String(Math.trunc(this.donGiaKm));
      if (s.length > 9) {
        this.donGiaKm = Number(s.slice(0, 9));
        this.cdr.detectChanges();
      }
    }
  }

  onHsLaiChange(): void {
    if (this.hsLai != null) {
      const s = String(this.hsLai);
      if (s.length > 5) {
        this.hsLai = Number(s.slice(0, 5));
        this.cdr.detectChanges();
      }
    }
  }

  onHsPhuChange(): void {
    if (this.hsPhu != null) {
      const s = String(this.hsPhu);
      if (s.length > 5) {
        this.hsPhu = Number(s.slice(0, 5));
        this.cdr.detectChanges();
      }
    }
  }

  onHsLuongCap1Change(): void {
    if (this.hsLuongCap1 != null) {
      const s = String(this.hsLuongCap1);
      if (s.length > 5) {
        this.hsLuongCap1 = Number(s.slice(0, 5));
        this.cdr.detectChanges();
      }
    }
  }

  onHsLuongCap2Change(): void {
    if (this.hsLuongCap2 != null) {
      const s = String(this.hsLuongCap2);
      if (s.length > 5) {
        this.hsLuongCap2 = Number(s.slice(0, 5));
        this.cdr.detectChanges();
      }
    }
  }

  onHsLuongCap3Change(): void {
    if (this.hsLuongCap3 != null) {
      const s = String(this.hsLuongCap3);
      if (s.length > 5) {
        this.hsLuongCap3 = Number(s.slice(0, 5));
        this.cdr.detectChanges();
      }
    }
  }

  onChuKyBdChange(): void {
    if (this.chuKyBd != null) {
      const s = String(Math.trunc(this.chuKyBd));
      if (s.length > 4) {
        this.chuKyBd = Number(s.slice(0, 4));
        this.cdr.detectChanges();
      }
    }
  }

  // Chuẩn hóa khi blur hoặc trước khi lưu (nếu điền 0 hoặc để trống thì mặc định)
  chuanHoaDonGiaKm(): void {
    if (this.donGiaKm == null || Number.isNaN(this.donGiaKm) || this.donGiaKm <= 0) {
      this.donGiaKm = 2000;
    } else if (String(Math.trunc(this.donGiaKm)).length > 9) {
      this.donGiaKm = Number(String(Math.trunc(this.donGiaKm)).slice(0, 9));
    }
    this.cdr.detectChanges();
  }

  chuanHoaHsLai(): void {
    if (this.hsLai == null || Number.isNaN(this.hsLai) || this.hsLai <= 0) {
      this.hsLai = 1.0;
    } else if (String(this.hsLai).length > 5) {
      this.hsLai = Number(String(this.hsLai).slice(0, 5));
    }
    this.cdr.detectChanges();
  }

  chuanHoaHsPhu(): void {
    if (this.hsPhu == null || Number.isNaN(this.hsPhu) || this.hsPhu <= 0) {
      this.hsPhu = 0.6;
    } else if (String(this.hsPhu).length > 5) {
      this.hsPhu = Number(String(this.hsPhu).slice(0, 5));
    }
    this.cdr.detectChanges();
  }

  chuanHoaHsLuongCap1(): void {
    if (this.hsLuongCap1 == null || Number.isNaN(this.hsLuongCap1) || this.hsLuongCap1 <= 0) {
      this.hsLuongCap1 = 1.0;
    } else if (String(this.hsLuongCap1).length > 5) {
      this.hsLuongCap1 = Number(String(this.hsLuongCap1).slice(0, 5));
    }
    this.cdr.detectChanges();
  }

  chuanHoaHsLuongCap2(): void {
    if (this.hsLuongCap2 == null || Number.isNaN(this.hsLuongCap2) || this.hsLuongCap2 <= 0) {
      this.hsLuongCap2 = 1.2;
    } else if (String(this.hsLuongCap2).length > 5) {
      this.hsLuongCap2 = Number(String(this.hsLuongCap2).slice(0, 5));
    }
    this.cdr.detectChanges();
  }

  chuanHoaHsLuongCap3(): void {
    if (this.hsLuongCap3 == null || Number.isNaN(this.hsLuongCap3) || this.hsLuongCap3 <= 0) {
      this.hsLuongCap3 = 1.5;
    } else if (String(this.hsLuongCap3).length > 5) {
      this.hsLuongCap3 = Number(String(this.hsLuongCap3).slice(0, 5));
    }
    this.cdr.detectChanges();
  }

  chuanHoaChuKyBd(): void {
    if (this.chuKyBd == null || Number.isNaN(this.chuKyBd) || this.chuKyBd <= 0) {
      this.chuKyBd = ThamSoComponent.MAC_DINH_CHU_KY_BD; // 360
    } else if (String(Math.trunc(this.chuKyBd)).length > 4) {
      this.chuKyBd = Number(String(Math.trunc(this.chuKyBd)).slice(0, 4));
    }
    this.cdr.detectChanges();
  }

  chuanHoaTatCaThuLao(): void {
    this.chuanHoaDonGiaKm();
    this.chuanHoaHsLai();
    this.chuanHoaHsPhu();
    this.chuanHoaHsLuongCap1();
    this.chuanHoaHsLuongCap2();
    this.chuanHoaHsLuongCap3();
  }

  luuThuLao(): void {
    if (!this.branch.canEdit()) {
      this.notify.canhBao('Chỉ site Hà Nội (/hn) mới có quyền chỉnh sửa tham số cấu hình.');
      return;
    }

    if (!this.dangSuaThuLao() || this.dangLuuThuLao()) return;

    // Chuẩn hóa trước khi lưu: điền 0 hoặc để trống thì gán giá trị mặc định
    this.chuanHoaTatCaThuLao();

    this.loiThuLao.set(null);
    if (
      this.loiDonGiaKm ||
      this.loiHsLai ||
      this.loiHsPhu ||
      this.loiHsLuongCap1 ||
      this.loiHsLuongCap2 ||
      this.loiHsLuongCap3
    ) {
      this.loiThuLao.set(
        this.loiDonGiaKm ||
        this.loiHsLai ||
        this.loiHsPhu ||
        this.loiHsLuongCap1 ||
        this.loiHsLuongCap2 ||
        this.loiHsLuongCap3
      );
      return;
    }

    if (
      this.donGiaKm <= 0 ||
      this.hsLai <= 0 ||
      this.hsPhu <= 0 ||
      this.hsLuongCap1 <= 0 ||
      this.hsLuongCap2 <= 0 ||
      this.hsLuongCap3 <= 0
    ) {
      this.loiThuLao.set('Mọi đơn giá và hệ số lương phải lớn hơn 0.');
      return;
    }

    const req: ThamSoThuLaoRequest = {
      donGiaKm: this.donGiaKm,
      hsLai: this.hsLai,
      hsPhu: this.hsPhu,
      hsLuongCap1: this.hsLuongCap1,
      hsLuongCap2: this.hsLuongCap2,
      hsLuongCap3: this.hsLuongCap3,
    };

    this.dangLuuThuLao.set(true);
    this.api.luuThamSoThuLao(req).subscribe({
      next: () => {
        this.snapshotThuLao = null;
        this.loiThuLao.set(null);
        this.dangSuaThuLao.set(false);
        this.notify.thanhCong('Đã cập nhật tham số thù lao thành công.');
        this.readinessRefresh.baoDaLuu();
        this.taiLaiThuLao();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.dangLuuThuLao.set(false);
        this.loiThuLao.set(err);
        this.cdr.detectChanges();
      },
    });
  }

  luuBaoDuong(): void {
    if (!this.branch.canEdit()) {
      this.notify.canhBao('Chỉ site Hà Nội (/hn) mới có quyền chỉnh sửa tham số cấu hình.');
      return;
    }

    if (!this.dangSuaBaoDuong() || this.dangLuuBaoDuong()) return;

    this.chuanHoaChuKyBd();
    this.loiBaoDuong.set(null);
    if (this.loiChuKyBd) {
      this.loiBaoDuong.set(this.loiChuKyBd);
      return;
    }

    if (
      this.chuKyBd <= 0 ||
      this.kmMoiNgayBd <= 0 ||
      this.canhBaoNgay <= 0 ||
      this.chuKyDkCu <= 0 ||
      this.chuKyDkMoi <= 0 ||
      this.tuoiXeCu <= 0
    ) {
      this.loiBaoDuong.set('Chu kỳ và các ngưỡng phải là số nguyên lớn hơn 0.');
      return;
    }

    if (
      this.hsDuongKhoCap1 < 1 ||
      this.hsDuongKhoCap2 < 1 ||
      this.hsDuongKhoCap3 < 1
    ) {
      this.loiBaoDuong.set('Hệ số đường khó các cấp phải từ 1.0 trở lên.');
      return;
    }

    const req: ThamSoBaoDuongRequest = {
      chuKyBd: this.chuKyBd,
      kmMoiNgayBd: this.kmMoiNgayBd,
      canhBaoNgay: this.canhBaoNgay,
      chuKyDkCu: this.chuKyDkCu,
      chuKyDkMoi: this.chuKyDkMoi,
      tuoiXeCu: this.tuoiXeCu,
      hsDuongKhoCap1: this.hsDuongKhoCap1,
      hsDuongKhoCap2: this.hsDuongKhoCap2,
      hsDuongKhoCap3: this.hsDuongKhoCap3,
    };

    this.dangLuuBaoDuong.set(true);
    this.api.luuThamSoBaoDuong(req).subscribe({
      next: () => {
        this.snapshotBaoDuong = null;
        this.loiBaoDuong.set(null);
        this.dangSuaBaoDuong.set(false);
        this.notify.thanhCong('Đã cập nhật tham số bảo dưỡng & đăng kiểm thành công.');
        this.readinessRefresh.baoDaLuu();
        this.taiLaiBaoDuong();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.dangLuuBaoDuong.set(false);
        this.loiBaoDuong.set(err);
        this.cdr.detectChanges();
      },
    });
  }
}
