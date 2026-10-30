import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ChuyenXeApiService } from './chuyen-xe-api.service';
import { KetThucChuyenRequest, TaoChuyenRequest } from './chuyen-xe.models';

describe('ChuyenXeApiService', () => {
  let service: ChuyenXeApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ChuyenXeApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lấy danh sách với đủ query và bỏ qua param rỗng', () => {
    let result: unknown;
    service.danhSachChuyen({ trangThai: 'KeHoach', maCN: '', tuNgay: '2026-10-01', denNgay: undefined })
      .subscribe((data) => result = data);

    const req = http.expectOne((r) => r.url === '/api/v1/vanhanh/chuyen-xe');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('trangThai')).toBe('KeHoach');
    expect(req.request.params.get('tuNgay')).toBe('2026-10-01');
    expect(req.request.params.has('maCN')).toBe(false);
    expect(req.request.params.has('denNgay')).toBe(false);
    req.flush({ success: true, data: [{ maChuyen: 'CX001' }] });
    expect(result).toEqual([{ maChuyen: 'CX001' }]);
  });

  it('lấy chi tiết và mã hóa mã chuyến trong URL', () => {
    let result: unknown;
    service.chiTietChuyen('CX 01/26').subscribe((data) => result = data);
    const req = http.expectOne('/api/v1/vanhanh/chuyen-xe/CX%2001%2F26');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { maChuyen: 'CX 01/26' } });
    expect(result).toEqual({ maChuyen: 'CX 01/26' });
  });

  it('xem trước với query bắt buộc và bỏ qua tài xế rỗng', () => {
    let result: unknown;
    service.xemTruoc({
      maTuyen: 'T01', gioKhoiHanh: '2026-11-01T08:30:00', maTXLai: 'TX01', maTXPhu: '',
    }).subscribe((data) => result = data);

    const req = http.expectOne((r) => r.url === '/api/v1/vanhanh/chuyen-xe/xem-truoc');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('maTuyen')).toBe('T01');
    expect(req.request.params.get('gioKhoiHanh')).toBe('2026-11-01T08:30:00');
    expect(req.request.params.get('maTXLai')).toBe('TX01');
    expect(req.request.params.has('maTXPhu')).toBe(false);
    req.flush({ success: true, data: { maTuyen: 'T01', giaVe: 150000 } });
    expect(result).toEqual({ maTuyen: 'T01', giaVe: 150000 });
  });

  it('tạo chuyến bằng POST với nguyên body và bóc data chuỗi', () => {
    const body: TaoChuyenRequest = {
      maTuyen: 'T01', maXe: 'XE01', gioKhoiHanh: '2026-11-01T08:30:00',
      gioDen: '2026-11-01T12:30:00', maLai: 'TX01', maPhu: 'TX02',
    };
    let result: string | undefined;
    service.taoChuyenVaPhanCong(body).subscribe((data) => result = data);
    const req = http.expectOne('/api/v1/vanhanh/chuyen-xe');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ success: true, data: 'CX001' });
    expect(result).toBe('CX001');
  });

  it('hủy chuyến bằng POST không có payload nghiệp vụ', () => {
    let result: string | undefined;
    service.huyChuyen('CX001').subscribe((data) => result = data);
    const req = http.expectOne('/api/v1/vanhanh/chuyen-xe/CX001/huy');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush({ success: true, data: 'CX001' });
    expect(result).toBe('CX001');
  });

  it('kết thúc chuyến bằng POST với body', () => {
    const body: KetThucChuyenRequest = { kmThucTe: 320, chiPhiVanHanh: 1200000 };
    let result: string | undefined;
    service.ketThucChuyen('CX001', body).subscribe((data) => result = data);
    const req = http.expectOne('/api/v1/vanhanh/chuyen-xe/CX001/ket-thuc');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ success: true, data: 'CX001' });
    expect(result).toBe('CX001');
  });
});
