import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ChiNhanh } from '../models/catalog.models';

export type SiteCode = 'hn' | 'dn' | 'hcm';

export interface SiteInfo {
  code: SiteCode;
  maCN: string;
  tenCN: string;
  canEdit: boolean;
  moTa: string;
}

export const SITES: Record<SiteCode, SiteInfo> = {
  hn: {
    code: 'hn',
    maCN: 'CN01',
    tenCN: 'Hà Nội',
    canEdit: true,
    moTa: 'Nút chủ · Được phép cập nhật & ghi toàn bộ cấu hình, tuyến, giá vé',
  },
  dn: {
    code: 'dn',
    maCN: 'CN02',
    tenCN: 'Đà Nẵng',
    canEdit: false,
    moTa: 'Nút chi nhánh · Chỉ đọc danh mục & cấu hình qua Linked Server',
  },
  hcm: {
    code: 'hcm',
    maCN: 'CN03',
    tenCN: 'TP.HCM',
    canEdit: false,
    moTa: 'Nút chi nhánh · Chỉ đọc danh mục & cấu hình qua Linked Server',
  },
};

@Injectable({ providedIn: 'root' })
export class BranchContextService {
  private readonly router = inject(Router);

  // Site hiện tại trên URL (/hn, /dn, /hcm)
  readonly site = signal<SiteCode>('hn');

  // Thông tin site hiện tại
  readonly siteInfo = computed(() => SITES[this.site()] ?? SITES.hn);
  readonly maCN = computed(() => this.siteInfo().maCN);
  readonly tenCN = computed(() => this.siteInfo().tenCN);
  readonly canEdit = computed(() => this.siteInfo().canEdit);
  readonly isHn = computed(() => this.site() === 'hn');

  // Danh sách các chi nhánh để hiển thị dropdown / selector
  readonly danhSachSites: SiteInfo[] = [SITES.hn, SITES.dn, SITES.hcm];

  readonly danhSach = signal<ChiNhanh[]>([
    { maCN: 'CN01', tenCN: 'Hà Nội' },
    { maCN: 'CN02', tenCN: 'Đà Nẵng' },
    { maCN: 'CN03', tenCN: 'TP.HCM' },
  ]);

  /**
   * Đồng bộ site từ URL (vd: /hn/thiet-lap -> site = 'hn')
   */
  syncFromUrl(url: string): void {
    const match = url.match(/^\/(hn|dn|hcm)(\/|\?|$)/i);
    if (match) {
      const code = match[1].toLowerCase() as SiteCode;
      if (this.site() !== code) {
        this.site.set(code);
      }
    }
  }

  /**
   * Chuyển site và điều hướng URL tương ứng
   * Ví dụ: đang ở /hn/thiet-lap/tuyen-gia -> chuyển sang /dn/thiet-lap/tuyen-gia
   */
  chonSite(newCode: SiteCode): void {
    if (this.site() === newCode) return;
    this.site.set(newCode);

    const currentUrl = this.router.url;
    let targetUrl: string;

    if (/^\/(hn|dn|hcm)(\/|\?|$)/i.test(currentUrl)) {
      targetUrl = currentUrl.replace(/^\/(hn|dn|hcm)/i, `/${newCode}`);
    } else {
      targetUrl = `/${newCode}${currentUrl.startsWith('/') ? currentUrl : '/' + currentUrl}`;
    }

    this.router.navigateByUrl(targetUrl);
  }

  // Tương thích ngược với interface cũ
  chon(maCNOrSite: string): void {
    const raw = (maCNOrSite || '').toLowerCase();
    if (raw.includes('hn') || raw === 'cn01') {
      this.chonSite('hn');
    } else if (raw.includes('dn') || raw === 'cn02') {
      this.chonSite('dn');
    } else if (raw.includes('hcm') || raw === 'cn03') {
      this.chonSite('hcm');
    }
  }

  capNhatDanhSach(ds: ChiNhanh[]): void {
    if (ds && ds.length > 0) {
      this.danhSach.set(ds);
    }
  }
}
