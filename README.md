# QLXK – Frontend (Angular)

## Chạy
```bash
npm start                      # ng serve, /api được proxy tới BE (proxy.conf.json)
npx ng build                   # build production
npx ng test
```
Đổi địa chỉ BE: sửa `target` trong `proxy.conf.json`.
Ngày hiện tại khi dev cố định `2025-06-02` (environment.development.ts → `fixedToday`).

## Cấu trúc và người phụ trách
```
src/app/
  core/                  C  – dùng chung, không chứa nghiệp vụ màn hình
    constants/             error-messages.ts (B: E01–E32) · trang-thai.ts
    models/                catalog.models.ts (model danh mục dùng chung)
    http/                  api.service.ts (mọi lời gọi BE đi qua đây) · api-error.ts
    interceptors/          branch (X-Chi-Nhanh) · loading · error (E32, timeout)
    services/              today · branch-context · loading · notify (toast) · confirm · readiness-refresh
    catalog/               cau-hinh-catalog (A) · doi-xe-catalog (C)
    config/primeng-vi.ts   tiếng Việt cho PrimeNG
    providers.ts           gắn vào app.config.ts (PrimeNG theme Aura, HttpClient, interceptors)
  shared/                C
    components/            error-box · status-badge (F14) · page-header · route-tabs
    pipes/                 vnd · vnDate · trangThai
    validators/            VnValidators (CCCD, SĐT, số > 0, hệ số ≥ 1, ngày, tuổi, năm SX)
    utils/                 date.utils · han.utils (F14)
  layout/                C  – shell (toolbar, chọn chi nhánh, menu), menu.ts
  features/
    mh01-thiet-lap/      A  – trang MH01 + Tab 1, 2, 4
    mh01-xe/             C  – khung Mức độ sẵn sàng + Tab 3
    mh02-chuyen-xe/      B
    mh03-ban-ve/         B
    mh04-ky-thuat/       C
    mh05-bao-cao/        A
  app.routes.ts          C  – khóa sau Sprint 0
```

## Quy tắc
1. Chỉ sửa trong thư mục của mình. `core/`, `shared/`, `layout/`, `app.routes.ts` sửa qua PR có C duyệt.
2. Gọi BE bằng `ApiService`, không inject `HttpClient` trong feature.
3. Lỗi nghiệp vụ: `subscribe({ error: (e: ApiError) => this.loi.set(e) })` rồi `<app-error-box [loi]="loi()" />`.
   Lỗi kết nối E32 đã được interceptor hiện sẵn.
4. Ngày hôm nay lấy từ `TodayService`, không gọi `new Date()` trong component.
5. Sau khi lưu thành công ở Tab 1, 2, 4 của MH01: gọi `ReadinessRefreshService.baoDaLuu()`.
6. Thông báo thành công: `NotifyService.thanhCong(...)`. Hỏi xác nhận: `await ConfirmService.hoi(...)`.
   Không đặt thêm `<p-toast>` hay `<p-confirmdialog>` trong màn hình (đã có trong shell).

## PrimeNG
Tài liệu: https://primeng.org. Import từng component vào `imports` của component dùng nó:
```ts
import { ButtonModule } from 'primeng/button';          // <p-button label="Lưu" />
import { TableModule } from 'primeng/table';            // <p-table [value]="ds">
import { DatePickerModule } from 'primeng/datepicker';  // <p-datepicker dateFormat="dd/mm/yy" />
import { InputNumberModule } from 'primeng/inputnumber';// giá vé, km: mode="decimal" locale="vi-VN"
import { InputTextModule } from 'primeng/inputtext';    // <input pInputText />
import { SelectModule } from 'primeng/select';         // <p-select [options]="..." />
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';       // lỗi dưới ô nhập
```
Lỗi dưới ô nhập (E01, E11...):
```html
@if (form.controls.cccd.touched && thongBaoLoi(form.controls.cccd, 'CCCD'); as msg) {
  <p-message severity="error" variant="simple" size="small">{{ msg }}</p-message>
}
```
Màu, khoảng cách: dùng biến theme `var(--p-primary-color)`, `var(--p-text-muted-color)`..., không gán mã màu cứng.

## Lệnh tạo thêm (đã cấu hình giữ hậu tố .component/.service/.pipe)
```bash
# A
npx ng g c features/mh01-thiet-lap/tuyen-gia/bang-gia-dialog
npx ng g c features/mh05-bao-cao/bang-luong
# B
npx ng g c features/mh03-ban-ve/ban-ve/so-do-ghe
npx ng g s features/mh02-chuyen-xe/goi-y-gio-den      # F09
# C
npx ng g c features/mh04-ky-thuat/ky-thuat-page/ky-thuat-state --skip-tests
npx ng g p shared/pipes/bien-so
```
