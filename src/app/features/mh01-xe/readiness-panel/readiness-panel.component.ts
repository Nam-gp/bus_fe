import { Component, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BranchContextService } from '@core/services/branch-context.service';
import { ReadinessRefreshService } from '@core/services/readiness-refresh.service';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { MucDoSanSangCauHinh, MucDoSanSangXe, TuyenGia, XeApiService } from '../xe-api.service';

type MauDong = 'ok' | 'warn' | 'loi';

export interface DongSanSang {
  nhan: string;
  mau: MauDong;
  /** Đường dẫn tương đối so với trang /:site/thiet-lap */
  link: string;
}

const VND = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });

/** Bọc từng nguồn để một API lỗi không làm mất cả khung */
function hoacNull<T>(src: Observable<T>): Observable<T | null> {
  return src.pipe(catchError(() => of(null)));
}

/**
 * MH01.0 – UC-001 Xem mức độ sẵn sàng (C). Đặt trong khung trang MH01 của A (giao tiếp số 7).
 * 5 dòng theo F16: (1) tham số, (2) tuyến thiếu giá, (3) đăng kiểm xe, cảnh báo bảo dưỡng, (4) tài xế.
 * Dòng 1, 2, 4 đọc API của A; dòng đăng kiểm và bảo dưỡng đọc vw_LichBaoDuong qua API của C.
 * Bấm dòng chỉ điều hướng, không gọi Server.
 */
@Component({
  selector: 'app-readiness-panel',
  imports: [RouterLink],
  templateUrl: './readiness-panel.component.html',
  styleUrl: './readiness-panel.component.scss',
})
export class ReadinessPanelComponent {
  private readonly refresh = inject(ReadinessRefreshService);
  private readonly branch = inject(BranchContextService);
  private readonly api = inject(XeApiService);

  readonly dangTai = signal(false);
  readonly dong = signal<DongSanSang[]>([]);

  constructor() {
    effect(() => {
      this.refresh.phienBan(); // chạy lại mỗi khi tab khác báo đã lưu (BR-MH01-01)
      this.branch.site(); // và khi đổi site chi nhánh
      untracked(() => this.taiLai());
    });
  }

  taiLai(): void {
    this.dangTai.set(true);
    forkJoin({
      cauHinh: hoacNull(this.api.mucDoSanSangCauHinh()),
      tuyen: hoacNull(this.api.tuyenGia()),
      xe: hoacNull(this.api.mucDoSanSangXe()),
    })
      .pipe(map(({ cauHinh, tuyen, xe }) => this.dungDong(cauHinh, tuyen, xe)))
      .subscribe((dong) => {
        this.dong.set(dong);
        this.dangTai.set(false);
      });
  }

  private dungDong(cauHinh: MucDoSanSangCauHinh | null, tuyen: TuyenGia[] | null, xe: MucDoSanSangXe | null): DongSanSang[] {
    const out: DongSanSang[] = [];

    out.push(
      cauHinh
        ? {
            nhan: `✓ 1. Tham số: đơn giá ${VND.format(cauHinh.donGiaKm)} đ/km, chu kỳ bảo dưỡng ${cauHinh.chuKyBd} ngày, đăng kiểm ${cauHinh.chuKyDkCu}/${cauHinh.chuKyDkMoi} tháng`,
            mau: 'ok',
            link: 'tham-so',
          }
        : { nhan: '1. Tham số: không tải được dữ liệu', mau: 'loi', link: 'tham-so' },
    );

    if (tuyen) {
      const thieu = tuyen.filter((t) => [t.giaThuong, t.giaCuoiTuan, t.giaMuaDL, t.giaLeTet].some((g) => g == null));
      out.push(
        thieu.length
          ? {
              nhan: `⚠ 2. ${thieu.length} tuyến thiếu giá: ${thieu.map((t) => t.maTuyen).join(', ')} → bấm để nhập giá`,
              mau: 'warn',
              link: 'tuyen-gia',
            }
          : { nhan: `✓ 2. ${tuyen.length} tuyến đều đủ 4 mức giá`, mau: 'ok', link: 'tuyen-gia' },
      );
    } else {
      out.push({ nhan: '2. Tuyến: không tải được dữ liệu', mau: 'loi', link: 'tuyen-gia' });
    }

    if (xe) {
      const het = xe.xeHetHanDangKiem;
      out.push(
        het.length
          ? {
              nhan: `⚠ 3. ${het.length} xe chưa/hết hạn đăng kiểm: ${het.map((x) => x.bienSo).join(', ')} → gia hạn ở Kỹ thuật xe`,
              mau: 'warn',
              link: '../ky-thuat',
            }
          : { nhan: `✓ 3. ${xe.tongSoXe} xe đều còn hạn đăng kiểm`, mau: 'ok', link: 'xe' },
      );
      const qh = xe.xeQuaHanBaoDuong;
      if (qh.length) {
        out.push({
          nhan: `⚠ ${qh.length} xe quá hạn bảo dưỡng: ${qh.map((x) => x.bienSo).join(', ')} → Kỹ thuật xe`,
          mau: 'warn',
          link: '../ky-thuat',
        });
      }
    } else {
      out.push({ nhan: '3. Đăng kiểm xe: không tải được dữ liệu', mau: 'loi', link: 'xe' });
    }

    out.push(
      cauHinh
        ? { nhan: `✓ 4. ${cauHinh.soTaiXeDangLam} tài xế`, mau: 'ok', link: 'tai-xe' }
        : { nhan: '4. Tài xế: không tải được dữ liệu', mau: 'loi', link: 'tai-xe' },
    );
    return out;
  }
}
