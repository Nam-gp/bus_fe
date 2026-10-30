import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
export function toLocalDateTime(v: Date): string { const p=(n:number)=>String(n).padStart(2,'0'); return `${v.getFullYear()}-${p(v.getMonth()+1)}-${p(v.getDate())}T${p(v.getHours())}:${p(v.getMinutes())}:00`; }
export function parseLocalDateTime(v: string): Date { const [d,t='00:00']=v.split('T'); const [y,m,n]=d.split('-').map(Number); const [h,i,s=0]=t.split(':').map(Number); return new Date(y,m-1,n,h,i,s); }
export function khacTaiXeValidator(lai: string, phu: string): ValidatorFn { return (g: AbstractControl): ValidationErrors|null => g.get(lai)?.value && g.get(lai)?.value===g.get(phu)?.value ? {trungTaiXe:true}:null; }
export const gioDenSauGioDi: ValidatorFn = g => { const d=g.get('gioKhoiHanhTT')?.value as Date|null; const e=g.get('gioDenTT')?.value as Date|null; return d&&e&&e<=d ? {gioDenKhongSau:true}:null; };
