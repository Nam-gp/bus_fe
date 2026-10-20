import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export type QueryParams = Record<string, string | number | boolean | null | undefined>;
export interface ApiOptions { context?: HttpContext; }

/**
 * Lớp gọi BE duy nhất. Feature service gọi qua đây, không dùng HttpClient trực tiếp,
 * để tiền tố /api, header chi nhánh, xử lý lỗi và loading luôn thống nhất.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  get<T>(path: string, params?: QueryParams, opt?: ApiOptions): Observable<T> {
    return this.http.get<T>(this.url(path), { params: toHttpParams(params), context: opt?.context });
  }

  post<T>(path: string, body?: unknown, opt?: ApiOptions): Observable<T> {
    return this.http.post<T>(this.url(path), body ?? null, { context: opt?.context });
  }

  put<T>(path: string, body?: unknown, opt?: ApiOptions): Observable<T> {
    return this.http.put<T>(this.url(path), body ?? null, { context: opt?.context });
  }

  patch<T>(path: string, body?: unknown, opt?: ApiOptions): Observable<T> {
    return this.http.patch<T>(this.url(path), body ?? null, { context: opt?.context });
  }

  delete<T>(path: string, params?: QueryParams, opt?: ApiOptions): Observable<T> {
    return this.http.delete<T>(this.url(path), { params: toHttpParams(params), context: opt?.context });
  }

  private url(path: string): string {
    return `${environment.apiUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }
}

/** Bỏ qua tham số null/undefined/'' (ví dụ chi nhánh "Tất cả" = không gửi) */
export function toHttpParams(params?: QueryParams): HttpParams {
  let hp = new HttpParams();
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v !== null && v !== undefined && v !== '') hp = hp.set(k, String(v));
  }
  return hp;
}
