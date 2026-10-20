// Cấu hình khi chạy ng serve
export const environment = {
  production: false,
  apiUrl: '/api',
  requestTimeoutMs: 10000,
  /** Prototype cố định ngày 02/06/2025 để khớp dữ liệu mẫu (SRS mục 1) */
  fixedToday: '2025-06-02' as string | null,
  chiNhanh: [
    { maCN: 'HN', tenCN: 'Hà Nội' },
    { maCN: 'DN', tenCN: 'Đà Nẵng' },
    { maCN: 'HCM', tenCN: 'TP.HCM' },
  ],
};
