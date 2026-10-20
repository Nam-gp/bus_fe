// Cấu hình bản build production
export const environment = {
  production: true,
  /** Tiền tố mọi API; BE phục vụ dưới /api */
  apiUrl: '/api',
  /** Quá thời gian này coi là mất kết nối (E32). Yêu cầu SRS: ghi < 2 s, báo cáo < 5 s */
  requestTimeoutMs: 10000,
  /** null = dùng ngày thật của máy */
  fixedToday: null as string | null,
  /** Danh sách chi nhánh dự phòng khi chưa gọi được API (đổi theo bảng ChiNhanh) */
  chiNhanh: [
    { maCN: 'HN', tenCN: 'Hà Nội' },
    { maCN: 'DN', tenCN: 'Đà Nẵng' },
    { maCN: 'HCM', tenCN: 'TP.HCM' },
  ],
};
