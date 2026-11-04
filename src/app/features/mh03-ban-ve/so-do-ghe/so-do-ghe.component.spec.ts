import { GheResponse } from '../ban-ve.models';
import { trangThaiGhe } from './so-do-ghe.component';

const ghe = (soGhe: number, daBan = false, coTheBan = !daBan): GheResponse => ({ soGhe, daBan, coTheBan, maVe: daBan ? 'VE01' : null });

describe('trangThaiGhe', () => {
  it('khóa ghế 1 và 2 theo F05', () => { expect(trangThaiGhe(ghe(1), null)).toBe('khong-ban'); expect(trangThaiGhe(ghe(2), null)).toBe('khong-ban'); });
  it('phân biệt ghế đã bán, đang chọn và trống', () => {
    expect(trangThaiGhe(ghe(3, true), null)).toBe('da-ban');
    expect(trangThaiGhe(ghe(4), 4)).toBe('dang-chon');
    expect(trangThaiGhe(ghe(5), 4)).toBe('trong');
  });
  it('nhận diện ghế đã bán khi BE trả coTheBan false', () => {
    expect(trangThaiGhe(ghe(3, true, false), null)).toBe('da-ban');
  });
  it('khóa ghế khi chuyến không mở bán', () => {
    expect(trangThaiGhe(ghe(4, false, false), null)).toBe('khong-ban');
  });
  it('luôn khóa ghế 1 dù đã bán hay chưa', () => {
    expect(trangThaiGhe(ghe(1, false), null)).toBe('khong-ban');
    expect(trangThaiGhe(ghe(1, true), null)).toBe('khong-ban');
    expect(trangThaiGhe(ghe(1, true, true), null)).toBe('khong-ban');
  });
  it('hỗ trợ danh sách ghế đang chọn', () => {
    expect(trangThaiGhe(ghe(4), [4, 5])).toBe('dang-chon');
    expect(trangThaiGhe(ghe(5), [4, 5])).toBe('dang-chon');
    expect(trangThaiGhe(ghe(6), [4, 5])).toBe('trong');
  });
});
