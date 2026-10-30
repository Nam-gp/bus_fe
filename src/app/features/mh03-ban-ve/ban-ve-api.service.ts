import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/http/api.service';
import { BanVeRequest, BanVeResponse, SoDoGheResponse, TicketResponse } from './ban-ve.models';

@Injectable({ providedIn: 'root' })
export class BanVeApiService {
  private readonly api = inject(ApiService);
  private readonly tripPath = '/api/v1/vanhanh/chuyen-xe';
  private readonly ticketPath = '/api/v1/vanhanh/ve';

  soDoGhe(maChuyen: string): Observable<SoDoGheResponse> {
    return this.api.get<SoDoGheResponse>(`${this.tripPath}/${encodeURIComponent(maChuyen)}/so-do-ghe`);
  }

  banVe(body: BanVeRequest): Observable<BanVeResponse> {
    return this.api.post<BanVeResponse>(this.ticketPath, body);
  }

  huyVe(maVe: string): Observable<string> {
    return this.api.post<string>(`${this.ticketPath}/${encodeURIComponent(maVe)}/huy`);
  }

  veTheoChuyen(maChuyen: string): Observable<TicketResponse[]> {
    return this.api.get<TicketResponse[]>(`${this.tripPath}/${encodeURIComponent(maChuyen)}/ve`);
  }

  traCuu(soDienThoai?: string): Observable<TicketResponse[]> {
    return this.api.get<TicketResponse[]>(`${this.ticketPath}/tra-cuu`, { soDienThoai });
  }
}
