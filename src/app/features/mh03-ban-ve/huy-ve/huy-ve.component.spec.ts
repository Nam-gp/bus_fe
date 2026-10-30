import { TestBed } from '@angular/core/testing';
import { ConfirmService } from '@core/services/confirm.service';
import { NotifyService } from '@core/services/notify.service';
import { ChuyenXeApiService } from '@features/mh02-chuyen-xe/chuyen-xe-api.service';
import { ChuyenXeResponse } from '@features/mh02-chuyen-xe/chuyen-xe.models';
import { of } from 'rxjs';
import { BanVeApiService } from '../ban-ve-api.service';
import { TicketResponse } from '../ban-ve.models';
import { HuyVeComponent } from './huy-ve.component';

describe('HuyVeComponent', () => {
  const chuyen = { maChuyen: 'CX001', trangThai: 'KeHoach' } as ChuyenXeResponse;
  const veDaBan = { maVe: 'VE001', soGhe: 3, trangThai: 'DaBan' } as TicketResponse;
  const veDaHuy = { maVe: 'VE002', soGhe: 4, trangThai: 'DaHuy' } as TicketResponse;
  let api: { veTheoChuyen: ReturnType<typeof vi.fn>; huyVe: ReturnType<typeof vi.fn> };
  let confirm: { hoi: ReturnType<typeof vi.fn> };
  let notify: { thanhCong: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    api = { veTheoChuyen: vi.fn(() => of([veDaBan, veDaHuy])), huyVe: vi.fn(() => of('VE001')) };
    confirm = { hoi: vi.fn(() => Promise.resolve(true)) };
    notify = { thanhCong: vi.fn() };
    TestBed.configureTestingModule({
      imports: [HuyVeComponent],
      providers: [
        { provide: BanVeApiService, useValue: api },
        { provide: ChuyenXeApiService, useValue: { danhSachChuyen: vi.fn(() => of([chuyen])) } },
        { provide: ConfirmService, useValue: confirm },
        { provide: NotifyService, useValue: notify },
      ],
    });
  });

  it('chỉ cho hủy vé Đã bán của chuyến Kế hoạch', () => {
    const component = TestBed.createComponent(HuyVeComponent).componentInstance;
    component.danhSachChuyen.set([chuyen]);
    component.maChuyen.set(chuyen.maChuyen);
    expect(component.coTheHuy(veDaBan)).toBe(true);
    expect(component.coTheHuy(veDaHuy)).toBe(false);
    component.danhSachChuyen.set([{ ...chuyen, trangThai: 'DangChay' }]);
    expect(component.coTheHuy(veDaBan)).toBe(false);
  });

  it('xác nhận, hủy và tải lại bảng vé của chuyến đang chọn', async () => {
    const component = TestBed.createComponent(HuyVeComponent).componentInstance;
    component.danhSachChuyen.set([chuyen]);
    component.doiChuyen(chuyen.maChuyen);
    expect(api.veTheoChuyen).toHaveBeenCalledTimes(1);

    await component.huyVe(veDaBan);

    expect(confirm.hoi).toHaveBeenCalled();
    expect(api.huyVe).toHaveBeenCalledWith('VE001');
    expect(api.veTheoChuyen).toHaveBeenCalledTimes(2);
    expect(notify.thanhCong).toHaveBeenCalledWith('Đã hủy vé VE001. Ghế 3 được mở bán lại.');
    expect(component.maChuyen()).toBe('CX001');
  });
});
