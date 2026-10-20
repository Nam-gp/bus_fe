import { Pipe, PipeTransform } from '@angular/core';

const FMT = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });

/** {{ 465024000 | vnd }} → "465.024.000 đ" (định dạng #.### đ của SRS) */
@Pipe({ name: 'vnd' })
export class VndPipe implements PipeTransform {
  transform(v: number | string | null | undefined, donVi = ' đ'): string {
    if (v === null || v === undefined || v === '') return '';
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? `${FMT.format(n)}${donVi}` : '';
  }
}
