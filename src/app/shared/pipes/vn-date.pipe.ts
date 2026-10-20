import { Pipe, PipeTransform } from '@angular/core';
import { parseIsoDate } from '../utils/date.utils';

const pad = (n: number): string => String(n).padStart(2, '0');

/** {{ '2025-06-02' | vnDate }} → "02/06/2025"; {{ gioDi | vnDate: true }} → "02/06/2025 07:00" */
@Pipe({ name: 'vnDate' })
export class VnDatePipe implements PipeTransform {
  transform(v: string | Date | null | undefined, coGio = false): string {
    if (!v) return '';
    const d = typeof v === 'string' ? (/^\d{4}-\d{2}-\d{2}$/.test(v) ? parseIsoDate(v) : new Date(v)) : v;
    if (isNaN(d.getTime())) return '';
    const ngay = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    return coGio ? `${ngay} ${pad(d.getHours())}:${pad(d.getMinutes())}` : ngay;
  }
}
