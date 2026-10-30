import { GheResponse } from '../ban-ve.models';
import { trangThaiGhe } from './so-do-ghe.component';

const ghe = (soGhe: number, daBan = false, coTheBan = true): GheResponse => ({ soGhe, daBan, coTheBan, maVe: daBan ? 'VE01' : null });

describe('trangThaiGhe', () => {
  it('khóa ghế 1 và 2 theo F05', () => { expect(trangThaiGhe(ghe(1), null)).toBe('khong-ban'); expect(trangThaiGhe(ghe(2), null)).toBe('khong-ban'); });
  it('phân biệt ghế đã bán, đang chọn và trống', () => {
    expect(trangThaiGhe(ghe(3, true), null)).toBe('da-ban');
    expect(trangThaiGhe(ghe(4), 4)).toBe('dang-chon');
    expect(trangThaiGhe(ghe(5), 4)).toBe('trong');
  });
});
