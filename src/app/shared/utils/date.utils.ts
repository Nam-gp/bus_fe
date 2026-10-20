/** Làm việc với ngày dạng 'yyyy-MM-dd' theo giờ địa phương, tránh lệch múi giờ của toISOString() */
const pad = (n: number): string => String(n).padStart(2, '0');

export function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Nhận Date (datepicker) hoặc chuỗi ISO, trả 'yyyy-MM-dd' hoặc null */
export function toIsoDateOrNull(v: unknown): string | null {
  if (v instanceof Date && !isNaN(v.getTime())) return toIsoDate(v);
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  return null;
}

/** Số ngày từ `tu` đến `den` (den − tu) */
export function diffDays(tu: string, den: string): number {
  return Math.round((parseIsoDate(den).getTime() - parseIsoDate(tu).getTime()) / 86_400_000);
}

export function addDays(iso: string, soNgay: number): string {
  const d = parseIsoDate(iso);
  d.setDate(d.getDate() + soNgay);
  return toIsoDate(d);
}

/** Cộng tháng, giữ ngày cuối tháng hợp lệ (31/01 + 1 tháng = 28 hoặc 29/02) – dùng cho F13 */
export function addMonths(iso: string, soThang: number): string {
  const d = parseIsoDate(iso);
  const ngay = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + soThang);
  const ngayCuoi = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(ngay, ngayCuoi));
  return toIsoDate(d);
}
