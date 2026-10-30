import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BanVeApiService } from './ban-ve-api.service';
import { BanVeRequest } from './ban-ve.models';

describe('BanVeApiService', () => {
  let service: BanVeApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(BanVeApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lấy sơ đồ ghế và bóc data', () => {
    let result: unknown;
    service.soDoGhe('CX 01').subscribe((data) => result = data);
    const req = http.expectOne('/api/v1/vanhanh/chuyen-xe/CX%2001/so-do-ghe');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { maChuyen: 'CX 01', danhSachGhe: [] } });
    expect(result).toEqual({ maChuyen: 'CX 01', danhSachGhe: [] });
  });

  it('bán vé bằng POST với nguyên body và bóc data', () => {
    const body: BanVeRequest = {
      maChuyen: 'CX001', soGhe: 3, hoTen: 'Nguyễn Văn A', soDienThoai: '0901234567',
    };
    let result: unknown;
    service.banVe(body).subscribe((data) => result = data);
    const req = http.expectOne('/api/v1/vanhanh/ve');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ success: true, data: { maVe: 'VE001', giaVe: 150000, lanBan: 1 } });
    expect(result).toEqual({ maVe: 'VE001', giaVe: 150000, lanBan: 1 });
  });

  it('hủy vé bằng POST và mã hóa mã vé', () => {
    let result: string | undefined;
    service.huyVe('VE/001').subscribe((data) => result = data);
    const req = http.expectOne('/api/v1/vanhanh/ve/VE%2F001/huy');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush({ success: true, data: 'VE/001' });
    expect(result).toBe('VE/001');
  });

  it('lấy danh sách vé theo chuyến bằng GET, mã hóa mã chuyến và bóc data', () => {
    let result: unknown;
    service.veTheoChuyen('CX/01').subscribe((data) => result = data);
    const req = http.expectOne('/api/v1/vanhanh/chuyen-xe/CX%2F01/ve');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [{ maVe: 'VE001', lanBan: 1, giaVe: null }] });
    expect(result).toEqual([{ maVe: 'VE001', lanBan: 1, giaVe: null }]);
  });

  it('tra cứu bằng GET với số điện thoại và bóc data', () => {
    let result: unknown;
    service.traCuu('0901234567').subscribe((data) => result = data);
    const req = http.expectOne((r) => r.url === '/api/v1/vanhanh/ve/tra-cuu');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('soDienThoai')).toBe('0901234567');
    req.flush({ success: true, data: [{ maVe: 'VE001' }] });
    expect(result).toEqual([{ maVe: 'VE001' }]);
  });

  it('bỏ query rỗng khi tra cứu', () => {
    service.traCuu('').subscribe();
    const req = http.expectOne('/api/v1/vanhanh/ve/tra-cuu');
    expect(req.request.params.has('soDienThoai')).toBe(false);
    req.flush({ success: true, data: [] });
  });
});
