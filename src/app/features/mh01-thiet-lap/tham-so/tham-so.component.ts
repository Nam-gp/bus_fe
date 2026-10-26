import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
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
  protected readonly branch = inject(BranchContextService);
  private readonly api = inject(ThietLapApiService);
  private readonly notify = inject(NotifyService);
  private readonly readinessRefresh = inject(ReadinessRefreshService);

  readonly dangTai = signal(false);
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
  chuKyBd = 360;
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
        if (res.thamSo) {
          this.donGiaKm = res.thamSo['DON_GIA_KM'] ?? this.donGiaKm;
          this.hsLai = res.thamSo['HS_LAI'] ?? this.hsLai;
          this.hsPhu = res.thamSo['HS_PHU'] ?? this.hsPhu;
          this.chuKyBd = res.thamSo['CHU_KY_BD'] ?? this.chuKyBd;
          this.kmMoiNgayBd = res.thamSo['KM_MOI_NGAY_BD'] ?? this.kmMoiNgayBd;
          this.canhBaoNgay = res.thamSo['CANH_BAO_NGAY'] ?? this.canhBaoNgay;
          this.chuKyDkCu = res.thamSo['CHU_KY_DK_CU'] ?? this.chuKyDkCu;
          this.chuKyDkMoi = res.thamSo['CHU_KY_DK_MOI'] ?? this.chuKyDkMoi;
          this.tuoiXeCu = res.thamSo['TUOI_XE_CU'] ?? this.tuoiXeCu;
        }

        if (res.doPhucTap && res.doPhucTap.length > 0) {
          const c1 = res.doPhucTap.find((x) => x.capDo === 1);
          const c2 = res.doPhucTap.find((x) => x.capDo === 2);
          const c3 = res.doPhucTap.find((x) => x.capDo === 3);

          if (c1) {
            this.hsLuongCap1 = c1.heSoLuong;
            this.hsDuongKhoCap1 = c1.heSoDuongKho;
          }
          if (c2) {
            this.hsLuongCap2 = c2.heSoLuong;
            this.hsDuongKhoCap2 = c2.heSoDuongKho;
          }
          if (c3) {
            this.hsLuongCap3 = c3.heSoLuong;
            this.hsDuongKhoCap3 = c3.heSoDuongKho;
          }
        }
      },
      error: (err) => {
        this.dangTai.set(false);
        this.loiThuLao.set(err);
      },
    });
  }

  get viDuLaiXe(): number {
    return Math.round(300 * this.donGiaKm * this.hsLuongCap2 * this.hsLai);
  }

  get viDuPhuXe(): number {
    return Math.round(300 * this.donGiaKm * this.hsLuongCap2 * this.hsPhu);
  }

  luuThuLao(): void {
    if (!this.branch.canEdit()) {
      this.notify.canhBao('Chỉ site Hà Nội (/hn) mới có quyền chỉnh sửa tham số cấu hình.');
      return;
    }

    this.loiThuLao.set(null);
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
        this.dangLuuThuLao.set(false);
        this.notify.thanhCong('Đã cập nhật tham số thù lao thành công.');
        this.readinessRefresh.baoDaLuu();
      },
      error: (err) => {
        this.dangLuuThuLao.set(false);
        this.loiThuLao.set(err);
      },
    });
  }

  luuBaoDuong(): void {
    if (!this.branch.canEdit()) {
      this.notify.canhBao('Chỉ site Hà Nội (/hn) mới có quyền chỉnh sửa tham số cấu hình.');
      return;
    }

    this.loiBaoDuong.set(null);
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
        this.dangLuuBaoDuong.set(false);
        this.notify.thanhCong('Đã cập nhật tham số bảo dưỡng & đăng kiểm thành công.');
        this.readinessRefresh.baoDaLuu();
      },
      error: (err) => {
        this.dangLuuBaoDuong.set(false);
        this.loiBaoDuong.set(err);
      },
    });
  }
}
