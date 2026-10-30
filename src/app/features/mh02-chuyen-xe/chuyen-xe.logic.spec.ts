import { FormControl, FormGroup } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { gioDenSauGioDi, khacTaiXeValidator, parseLocalDateTime, toLocalDateTime } from './chuyen-xe.logic';

describe('logic MH02 Chuyến xe', () => {
  it('giữ nguyên giờ địa phương khi đổi LocalDateTime', () => {
    const value = new Date(2026, 9, 31, 7, 15);
    expect(toLocalDateTime(value)).toBe('2026-10-31T07:15:00');
    expect(parseLocalDateTime('2026-10-31T07:15:00').getHours()).toBe(7);
  });
  it('không cho lái xe trùng phụ xe', () => {
    const form = new FormGroup({ lai: new FormControl('TX01'), phu: new FormControl('TX01') });
    expect(khacTaiXeValidator('lai', 'phu')(form)).toEqual({ trungTaiXe: true });
  });
  it('giờ đến phải sau giờ đi', () => {
    const form = new FormGroup({ gioKhoiHanhTT: new FormControl(new Date(2026, 1, 1, 8)), gioDenTT: new FormControl(new Date(2026, 1, 1, 7)) });
    expect(gioDenSauGioDi(form)).toEqual({ gioDenKhongSau: true });
  });
});
