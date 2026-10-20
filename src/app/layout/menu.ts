export interface MucMenu { ma: string; nhan: string; duongDan: string; icon: string; }
export interface NhomMenu { nhom: string; muc: readonly MucMenu[]; }

/** Menu theo SRS 4.1: THIẾT LẬP / VẬN HÀNH. Icon: https://primeng.org/icons */
export const MENU: readonly NhomMenu[] = [
  {
    nhom: 'THIẾT LẬP',
    muc: [{ ma: 'MH01', nhan: 'Thiết lập hệ thống', duongDan: '/thiet-lap', icon: 'pi pi-cog' }],
  },
  {
    nhom: 'VẬN HÀNH',
    muc: [
      { ma: 'MH02', nhan: 'Chuyến xe', duongDan: '/chuyen-xe', icon: 'pi pi-directions' },
      { ma: 'MH03', nhan: 'Bán vé', duongDan: '/ban-ve', icon: 'pi pi-ticket' },
      { ma: 'MH04', nhan: 'Kỹ thuật xe', duongDan: '/ky-thuat', icon: 'pi pi-wrench' },
      { ma: 'MH05', nhan: 'Báo cáo', duongDan: '/bao-cao', icon: 'pi pi-chart-bar' },
    ],
  },
];
