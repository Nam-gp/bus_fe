import { Injectable, computed, inject, signal } from '@angular/core';
import { TRANG_THAI_XE } from '@core/constants/trang-thai';
import { ApiError } from '@core/http/api-error';
import { ReadinessRefreshService } from '@core/services/readiness-refresh.service';
import { TodayService } from '@core/services/today.service';
import { TinhTrangHan, tinhTinhTrangHan } from '@shared/utils/han.utils';
import { finalize } from 'rxjs';
import { KyThuatApiService, LichBaoDuong, LichXe } from './ky-thuat-api.service';

/** Lịch một xe kèm tình trạng F14 đã tính cho bảo dưỡng và đăng kiểm */
export interface LichXeTinhTrang extends LichXe {
  tinhTrangBD: TinhTrangHan;
  tinhTrangDK: TinhTrangHan;
}

/** Yêu cầu điền sẵn form từ nút Ghi nhận ở MH04.1; lan = đổi mỗi lần bấm để form nhận cả khi chọn lại cùng xe */
export interface ChonXe {
  maXe: string;
  lan: number;
}

/** Một dòng MH04.1: mỗi xe tối đa 2 dòng (bảo dưỡng, đăng kiểm) – BR-MH04-03 */
export interface ViecCanXuLy {
  maXe: string;
  bienSo: string;
  viec: 'BaoDuong' | 'DangKiem';
  han: string | null;
  tinhTrang: TinhTrangHan;
  laDo: boolean;
}

export const LA_DO = (t: TinhTrangHan): boolean => t.muc === 'qua-han' || t.muc === 'chua-co';

/**
 * Trạng thái dùng chung của trang MH04 (cung cấp ở KyThuatPageComponent):
 * lịch vw_LichBaoDuong, tham số, và xe được chọn để điền sẵn form MH04.2 / MH04.3.
 */
@Injectable()
export class KyThuatStore {
  private readonly api = inject(KyThuatApiService);
  private readonly readiness = inject(ReadinessRefreshService);
  readonly homNay = inject(TodayService).homNay();

  readonly lich = signal<LichBaoDuong | null>(null);
  readonly dangTai = signal(false);
  readonly loi = signal<ApiError | null>(null);
  readonly chonBaoDuong = signal<ChonXe | null>(null);
  readonly chonDangKiem = signal<ChonXe | null>(null);

  readonly thamSo = computed(() => this.lich()?.thamSo ?? null);
  readonly canhBaoNgay = computed(() => this.thamSo()?.canhBaoNgay ?? 15);

  /** F14 cho từng xe */
  readonly xe = computed<LichXeTinhTrang[]>(() =>
    (this.lich()?.xe ?? []).map((x) => ({
      ...x,
      tinhTrangBD: tinhTinhTrangHan(x.ngayBDTiepTheo, this.homNay, this.canhBaoNgay(), 'Chưa có lịch'),
      tinhTrangDK: tinhTinhTrangHan(x.hanDangKiem, this.homNay, this.canhBaoNgay()),
    })),
  );

  /**
   * MH04.1 – xe khác Ngừng hoạt động có tình trạng đỏ hoặc vàng.
   * Sắp xếp: dòng đỏ trước (chưa đăng kiểm đứng đầu), rồi theo hạn tăng dần.
   */
  readonly xeCanXuLy = computed<ViecCanXuLy[]>(() => {
    const out: ViecCanXuLy[] = [];
    for (const x of this.xe()) {
      if (x.trangThai === 'NgungHD') continue;
      if (x.tinhTrangBD.muc !== 'binh-thuong') {
        out.push({ maXe: x.maXe, bienSo: x.bienSo, viec: 'BaoDuong', han: x.ngayBDTiepTheo, tinhTrang: x.tinhTrangBD, laDo: LA_DO(x.tinhTrangBD) });
      }
      if (x.tinhTrangDK.muc !== 'binh-thuong') {
        out.push({ maXe: x.maXe, bienSo: x.bienSo, viec: 'DangKiem', han: x.hanDangKiem, tinhTrang: x.tinhTrangDK, laDo: LA_DO(x.tinhTrangDK) });
      }
    }
    return out.sort((a, b) => Number(b.laDo) - Number(a.laDo) || (a.han ?? '').localeCompare(b.han ?? ''));
  });

  /** Ô chọn xe của 2 form: "{mã} · {biển số} · {trạng thái}" */
  readonly xeOptions = computed(() =>
    this.xe().map((x) => ({ value: x.maXe, label: `${x.maXe} · ${x.bienSo} · ${TRANG_THAI_XE[x.trangThai]}` })),
  );

  private lanChon = 0;

  taiLai(): void {
    this.dangTai.set(true);
    this.api
      .lichBaoDuong()
      .pipe(finalize(() => this.dangTai.set(false)))
      .subscribe({
        next: (d) => {
          this.lich.set(d);
          this.loi.set(null);
        },
        error: (err: ApiError) => this.loi.set(err),
      });
  }

  /** Sau mỗi lần lưu: tải lại lịch (MH04.1, MH04.4) và báo khung Mức độ sẵn sàng của MH01 */
  daLuu(): void {
    this.taiLai();
    this.readiness.baoDaLuu();
  }

  timXe(maXe: string | null | undefined): LichXeTinhTrang | undefined {
    return maXe ? this.xe().find((x) => x.maXe === maXe) : undefined;
  }

  chonXeBaoDuong(maXe: string): void {
    this.chonBaoDuong.set({ maXe, lan: ++this.lanChon });
  }

  chonXeDangKiem(maXe: string): void {
    this.chonDangKiem.set({ maXe, lan: ++this.lanChon });
  }
}
