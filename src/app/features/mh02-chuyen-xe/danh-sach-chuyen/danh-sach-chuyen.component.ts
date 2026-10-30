import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ApiError } from '@core/http/api-error';
import { TRANG_THAI_CHUYEN, TrangThaiChuyen } from '@core/constants/trang-thai';
import { ConfirmService } from '@core/services/confirm.service';
import { NotifyService } from '@core/services/notify.service';
import { ErrorBoxComponent } from '@shared/components/error-box/error-box.component';
import { TrangThaiPipe } from '@shared/pipes/trang-thai.pipe';
import { VnDatePipe } from '@shared/pipes/vn-date.pipe';
import { ButtonModule } from 'primeng/button'; import { SelectModule } from 'primeng/select'; import { TableModule } from 'primeng/table'; import { TagModule } from 'primeng/tag';
import { finalize } from 'rxjs'; import { ChuyenXeApiService } from '../chuyen-xe-api.service'; import { ChuyenXeResponse } from '../chuyen-xe.models';
@Component({selector:'app-danh-sach-chuyen',imports:[FormsModule,SelectModule,TableModule,ButtonModule,TagModule,ErrorBoxComponent,VnDatePipe,TrangThaiPipe],templateUrl:'./danh-sach-chuyen.component.html',styleUrl:'./danh-sach-chuyen.component.scss'})
export class DanhSachChuyenComponent {
 private readonly api=inject(ChuyenXeApiService);private readonly confirm=inject(ConfirmService);private readonly notify=inject(NotifyService);private readonly destroyRef=inject(DestroyRef);
 readonly danhSach=signal<ChuyenXeResponse[]>([]);readonly dangTai=signal(false);readonly dangHuy=signal<string|null>(null);readonly loi=signal<ApiError|string|null>(null);readonly trangThai=signal<TrangThaiChuyen|undefined>(undefined);
 readonly trangThaiOptions=[{label:'Tất cả trạng thái',value:undefined},...Object.entries(TRANG_THAI_CHUYEN).map(([value,label])=>({label,value:value as TrangThaiChuyen}))];
 constructor(){this.tai();} tai(){this.dangTai.set(true);this.loi.set(null);this.api.danhSachChuyen(this.trangThai()?{trangThai:this.trangThai()}:undefined).pipe(finalize(()=>this.dangTai.set(false)),takeUntilDestroyed(this.destroyRef)).subscribe({next:d=>this.danhSach.set([...(d??[])].sort((a,b)=>b.gioKhoiHanhDK.localeCompare(a.gioKhoiHanhDK))),error:(e:ApiError)=>this.loi.set(e)});}
 async huy(c:ChuyenXeResponse){if(this.dangHuy()||!await this.confirm.hoi(`Hủy chuyến ${c.maChuyen}? Vé đã bán (nếu có) sẽ không tự động hoàn tiền.`))return;this.dangHuy.set(c.maChuyen);this.loi.set(null);this.api.huyChuyen(c.maChuyen).pipe(finalize(()=>this.dangHuy.set(null)),takeUntilDestroyed(this.destroyRef)).subscribe({next:()=>{this.notify.thanhCong(`Đã hủy chuyến ${c.maChuyen}.`);this.tai();},error:(e:ApiError)=>this.loi.set(e)});}
 severity(s:TrangThaiChuyen):'success'|'info'|'warn'|'secondary'{return s==='HoanThanh'?'success':s==='DangChay'?'info':s==='KeHoach'?'warn':'secondary';}
}
