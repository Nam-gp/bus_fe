import { Translation } from 'primeng/api';

/** Tiếng Việt cho DatePicker, Table, ConfirmDialog... của PrimeNG */
export const PRIMENG_VI: Translation = {
  dayNames: ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'],
  dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  dayNamesMin: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  monthNames: [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
  ],
  monthNamesShort: ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'],
  firstDayOfWeek: 1,
  dateFormat: 'dd/mm/yy', // PrimeNG: yy = năm 4 chữ số → 02/06/2025
  today: 'Hôm nay',
  clear: 'Xóa',
  weekHeader: 'Tuần',
  accept: 'Đồng ý',
  reject: 'Không',
  choose: 'Chọn',
  upload: 'Tải lên',
  cancel: 'Hủy',
  emptyMessage: 'Không có dữ liệu',
  emptyFilterMessage: 'Không tìm thấy kết quả',
};
