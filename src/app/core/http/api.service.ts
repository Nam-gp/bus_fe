import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';

export type QueryParams = Record<string, string | number | boolean | null | undefined>;
export interface ApiOptions { context?: HttpContext; }

export interface ApiResponseWrapper<T> {
  success: boolean;
  data: T;
  error?: unknown;
  timestamp?: string;
}

/**
 * Lớp gọi BE duy nhất. Feature service gọi qua đây, không dùng HttpClient trực tiếp,
 * để tiền tố /api, header chi nhánh, xử lý lỗi và loading luôn thống nhất.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  get<T>(path: string, params?: QueryParams, opt?: ApiOptions): Observable<T> {
    return this.http.get<ApiResponseWrapper<T> | T>(this.url(path), { params: toHttpParams(params), context: opt?.context }).pipe(
      map((res) => this.unwrap(res))
    );
  }

  post<T>(path: string, body?: unknown, opt?: ApiOptions): Observable<T> {
    return this.http.post<ApiResponseWrapper<T> | T>(this.url(path), body ?? null, { context: opt?.context }).pipe(
      map((res) => this.unwrap(res))
    );
  }

  put<T>(path: string, body?: unknown, opt?: ApiOptions): Observable<T> {
    return this.http.put<ApiResponseWrapper<T> | T>(this.url(path), body ?? null, { context: opt?.context }).pipe(
      map((res) => this.unwrap(res))
    );
  }

  patch<T>(path: string, body?: unknown, opt?: ApiOptions): Observable<T> {
    return this.http.patch<ApiResponseWrapper<T> | T>(this.url(path), body ?? null, { context: opt?.context }).pipe(
      map((res) => this.unwrap(res))
    );
  }

  delete<T>(path: string, params?: QueryParams, opt?: ApiOptions): Observable<T> {
    return this.http.delete<ApiResponseWrapper<T> | T>(this.url(path), { params: toHttpParams(params), context: opt?.context }).pipe(
      map((res) => this.unwrap(res))
    );
  }

  private unwrap<T>(res: ApiResponseWrapper<T> | T): T {
    if (res && typeof res === 'object' && 'success' in res && 'data' in res) {
      return (res as ApiResponseWrapper<T>).data;
    }
    return res as T;
  }

  private url(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (cleanPath.startsWith('/api') || cleanPath.startsWith('/hn') || cleanPath.startsWith('/dn') || cleanPath.startsWith('/hcm')) {
      return cleanPath;
    }
    return `${environment.apiUrl}${cleanPath}`;
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
