import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, QueryParams } from '@core/http/api.service';
import {
  ChuyenXeResponse,
  DanhSachChuyenParams,
  KetThucChuyenRequest,
  TaoChuyenRequest,
  XemTruocChuyenRequest,
  XemTruocChuyenResponse,
} from './chuyen-xe.models';

@Injectable({ providedIn: 'root' })
export class ChuyenXeApiService {
  private readonly api = inject(ApiService);
  private readonly basePath = '/api/v1/vanhanh/chuyen-xe';

  danhSachChuyen(params?: DanhSachChuyenParams): Observable<ChuyenXeResponse[]> {
    return this.api.get<ChuyenXeResponse[]>(this.basePath, params as QueryParams);
  }

  chiTietChuyen(maChuyen: string): Observable<ChuyenXeResponse> {
    return this.api.get<ChuyenXeResponse>(`${this.basePath}/${encodeURIComponent(maChuyen)}`);
  }

  xemTruoc(params: XemTruocChuyenRequest): Observable<XemTruocChuyenResponse> {
    return this.api.get<XemTruocChuyenResponse>(`${this.basePath}/xem-truoc`, params as unknown as QueryParams);
  }

  taoChuyenVaPhanCong(body: TaoChuyenRequest): Observable<string> {
    return this.api.post<string>(this.basePath, body);
  }

  huyChuyen(maChuyen: string): Observable<string> {
    return this.api.post<string>(`${this.basePath}/${encodeURIComponent(maChuyen)}/huy`);
  }

  ketThucChuyen(maChuyen: string, body: KetThucChuyenRequest): Observable<string> {
    return this.api.post<string>(`${this.basePath}/${encodeURIComponent(maChuyen)}/ket-thuc`, body);
  }
}
