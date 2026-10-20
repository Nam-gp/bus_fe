import { Injectable, signal } from '@angular/core';
import { environment } from '@env/environment';
import { ChiNhanh } from '../models/catalog.models';

const STORAGE_KEY = 'qlxk.maCN';

/**
 * Chi nhánh làm việc hiện tại. CSDL phân mảnh theo MaCN, nên mọi request gửi kèm
 * header X-Chi-Nhanh để BE định tuyến tới đúng nút MySQL (xem branch.interceptor.ts).
 * Chưa có đăng nhập (ngoài phạm vi SRS) nên người dùng chọn trên thanh trên cùng.
 */
@Injectable({ providedIn: 'root' })
export class BranchContextService {
  // TODO(A): nạp danh sách từ CauHinhCatalogService.chiNhanh() khi BE sẵn sàng
  readonly danhSach = signal<ChiNhanh[]>(environment.chiNhanh);
  readonly maCN = signal<string>(this.docDaLuu() ?? environment.chiNhanh[0]?.maCN ?? '');

  chon(maCN: string): void {
    this.maCN.set(maCN);
    try {
      localStorage.setItem(STORAGE_KEY, maCN);
    } catch {
      /* trình duyệt chặn storage: bỏ qua */
    }
  }

  private docDaLuu(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }
}
