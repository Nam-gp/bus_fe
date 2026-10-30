import { Component, computed, input, output } from '@angular/core';
import { GheResponse } from '../ban-ve.models';

export type TrangThaiGhe = 'khong-ban' | 'da-ban' | 'dang-chon' | 'trong';

export function trangThaiGhe(ghe: GheResponse, gheDangChon: number | null): TrangThaiGhe {
  if (ghe.soGhe <= 2 || !ghe.coTheBan) return 'khong-ban';
  if (ghe.daBan) return 'da-ban';
  return ghe.soGhe === gheDangChon ? 'dang-chon' : 'trong';
}

@Component({
  selector: 'app-so-do-ghe',
  standalone: true,
  templateUrl: './so-do-ghe.component.html',
  styleUrl: './so-do-ghe.component.scss',
})
export class SoDoGheComponent {
  readonly danhSachGhe = input.required<readonly GheResponse[]>();
  readonly gheDangChon = input<number | null>(null);
  readonly chonGhe = output<number>();
  readonly soChoKhach = computed(() => Math.max(0, this.danhSachGhe().length - 2));

  trangThai(ghe: GheResponse): TrangThaiGhe { return trangThaiGhe(ghe, this.gheDangChon()); }
  chon(ghe: GheResponse): void {
    const trangThai = this.trangThai(ghe);
    if (trangThai === 'trong' || trangThai === 'dang-chon') this.chonGhe.emit(ghe.soGhe);
  }
}
