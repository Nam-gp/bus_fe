/**
 * Danh mục thông báo lỗi E01–E32 (SRS mục 10). Chủ: B (đồng bộ với bộ ánh xạ lỗi ở BE).
 * BE trả { ma: 'E24', thamSo?: {...} }; FE hiện câu tiếng Việt, không hiện mã lỗi SQL.
 * Cột sql: mã THROW/SIGNAL hoặc tên ràng buộc để đối chiếu khi kiểm thử.
 */
export const ERROR_MESSAGES = {
  E01: { vi: 'Vui lòng nhập {truong}.', en: 'Please enter {truong}.' },
  E02: { vi: 'Giá trị phải lớn hơn 0.', en: 'Value must be greater than 0.', sql: ['CK_Gia_GiaVe', 'CK_DoPhucTap_*'] },
  E03: { vi: 'Hệ số đường khó phải từ 1 trở lên.', en: 'Road difficulty factor must be at least 1.', sql: ['CK_DoPhucTap_HSDK'] },
  E04: { vi: 'Điểm đầu và điểm cuối phải khác nhau.', en: 'Origin and destination must be different.', sql: ['CK_Tuyen_DiemKhacNhau'] },
  E05: { vi: 'Độ dài tuyến phải lớn hơn 0 km.', en: 'Route length must be greater than 0 km.', sql: ['CK_Tuyen_DoDai'] },
  E06: { vi: 'Nhập đủ 4 mức giá lớn hơn 0. Tuyến chưa được lưu.', en: 'Enter all 4 prices above 0. The route was not saved.', sql: ['sp_ThemTuyenVaGia'] },
  E07: { vi: 'Biển số {bienSo} đã tồn tại.', en: 'Plate number {bienSo} already exists.', sql: ['UQ_Xe_BienSo'] },
  E08: { vi: 'Năm sản xuất phải từ 2005 đến năm hiện tại.', en: 'Manufacturing year must be between 2005 and this year.', sql: ['CK_Xe_NamSX'] },
  E09: { vi: 'Ngày đăng kiểm không được sau hôm nay.', en: 'Inspection date cannot be in the future.', sql: ['sp_ThemXeVaDangKiem', 'sp_GhiNhanDangKiem'] },
  E10: { vi: 'Không xóa được xe đã có chuyến. Hãy đổi trạng thái sang Ngừng hoạt động.', en: 'This vehicle has trips and cannot be deleted. Set it to Inactive instead.', sql: ['FK_Chuyen_Xe'] },
  E11: { vi: 'CCCD phải gồm đúng 12 chữ số.', en: 'Citizen ID must have exactly 12 digits.' },
  E12: { vi: 'CCCD đã tồn tại.', en: 'Citizen ID already exists.', sql: ['UQ_TX_CCCD'] },
  E13: { vi: 'Tài xế phải từ 21 tuổi trở lên.', en: 'Driver must be at least 21 years old.', sql: ['CK_TX_Tuoi'] },
  E14: { vi: 'Lái xe và phụ xe phải là 2 người khác nhau.', en: 'Driver and assistant must be different people.', sql: ['53001'] },
  E15: { vi: 'Xe không ở trạng thái Hoạt động.', en: 'Vehicle is not active.', sql: ['50401'] },
  E16: { vi: 'Xe đã có chuyến khác trùng giờ.', en: 'Vehicle already has an overlapping trip.', sql: ['50402'] },
  E17: { vi: 'Xe chưa đăng kiểm hoặc đã hết hạn tại ngày khởi hành.', en: 'Vehicle inspection is missing or expired on the departure date.', sql: ['50403'] },
  E18: { vi: 'Xe đã quá hạn bảo dưỡng tại ngày khởi hành.', en: 'Vehicle maintenance is overdue on the departure date.', sql: ['50404'] },
  E19: { vi: 'Tài xế {ma} đã có chuyến trùng giờ. Chuyến chưa được tạo.', en: 'Driver {ma} has an overlapping trip. The trip was not created.', sql: ['50302'] },
  E20: { vi: 'Chuyến đã có đủ lái xe và phụ xe.', en: 'This trip already has a driver and an assistant.', sql: ['UQ_PC_ChuyenVaiTro'] },
  E21: { vi: 'Cần có số km lớn hơn 0 và đủ 1 lái, 1 phụ để hoàn thành chuyến.', en: 'Enter distance above 0 and assign a driver and an assistant to complete the trip.', sql: ['50601'] },
  E22: { vi: 'Chọn một ghế trống trên sơ đồ.', en: 'Select an available seat on the map.' },
  E23: { vi: 'Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0.', en: 'Phone number must be 10 digits starting with 0.' },
  E24: { vi: 'Ghế đã có người đặt. Vui lòng chọn ghế khác.', en: 'This seat is taken. Please choose another seat.', sql: ['51003'] },
  E25: { vi: 'Chuyến không còn mở bán.', en: 'This trip is no longer open for sale.', sql: ['51001', '51002', '50102'] },
  E26: { vi: 'Chuyến đã hết chỗ.', en: 'This trip is fully booked.', sql: ['50101', '50103'] },
  E27: { vi: 'Tuyến chưa có giá cho loại ngày này. Nhập ở Thiết lập › Tuyến và giá vé.', en: 'No fare set for this route on this day type. Add it in Setup › Routes and fares.', sql: ['50201'] },
  E28: { vi: 'Ngày bảo dưỡng không được sau hôm nay.', en: 'Maintenance date cannot be in the future.', sql: ['sp_GhiNhanBaoDuong'] },
  E29: { vi: 'Ngày bảo dưỡng phải sau lần gần nhất ({ngay}).', en: 'Maintenance date must be after the last one ({ngay}).', sql: ['sp_GhiNhanBaoDuong'] },
  E30: { vi: 'Xe đã có lần bảo dưỡng ngày {ngay}.', en: 'This vehicle already has a maintenance record on {ngay}.', sql: ['PK_BaoDuong'] },
  E31: { vi: 'Chi phí phải là số không âm.', en: 'Cost must be zero or greater.', sql: ['CK_BD_ChiPhi', 'CK_DK_ChiPhi', 'CK_Chuyen_ChiPhi'] },
  E32: { vi: 'Không kết nối được cơ sở dữ liệu. Vui lòng thử lại.', en: 'Cannot connect to the database. Please try again.' },
} as const satisfies Record<string, { vi: string; en: string; sql?: readonly string[] }>;

export type MaLoi = keyof typeof ERROR_MESSAGES;
export type ThamSoLoi = Record<string, string | number>;

export function isMaLoi(v: string): v is MaLoi {
  return Object.prototype.hasOwnProperty.call(ERROR_MESSAGES, v);
}

/** formatLoi('E07', { bienSo: '29B-532.63' }) → 'Biển số 29B-532.63 đã tồn tại.' */
export function formatLoi(ma: MaLoi, thamSo?: ThamSoLoi, ngonNgu: 'vi' | 'en' = 'vi'): string {
  const mau: string = ERROR_MESSAGES[ma][ngonNgu];
  return mau.replace(/\{(\w+)\}/g, (_: string, k: string) =>
    thamSo && thamSo[k] !== undefined ? String(thamSo[k]) : `{${k}}`,
  );
}
