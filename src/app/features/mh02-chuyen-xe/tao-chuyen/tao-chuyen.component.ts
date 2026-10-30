import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CauHinhCatalogService } from '@core/catalog/cau-hinh-catalog.service';
import { DoiXeCatalogService } from '@core/catalog/doi-xe-catalog.service';
import { ApiError } from '@core/http/api-error';
import { TaiXe, TuyenDuong, Xe } from '@core/models/catalog.models';
import { NotifyService } from '@core/services/notify.service';
import { TodayService } from '@core/services/today.service';
import { ErrorBoxComponent } from '@shared/components/error-box/error-box.component';
import { TrangThaiPipe } from '@shared/pipes/trang-thai.pipe';
import { VndPipe } from '@shared/pipes/vnd.pipe';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { catchError, debounceTime, distinctUntilChanged, finalize, forkJoin, map, of, startWith, switchMap } from 'rxjs';
import { ChuyenXeApiService } from '../chuyen-xe-api.service';
import { XemTruocChuyenResponse } from '../chuyen-xe.models';
import { khacTaiXeValidator, toLocalDateTime } from '../chuyen-xe.logic';

@Component({ selector: 'app-tao-chuyen', imports: [ReactiveFormsModule, SelectModule, DatePickerModule, ButtonModule, ErrorBoxComponent, VndPipe, DatePipe], templateUrl: './tao-chuyen.component.html', styleUrl: './tao-chuyen.component.scss' })
export class TaoChuyenComponent {
  private readonly fb=inject(NonNullableFormBuilder); private readonly api=inject(ChuyenXeApiService); private readonly catalog=inject(CauHinhCatalogService); private readonly doiXe=inject(DoiXeCatalogService); private readonly notify=inject(NotifyService); private readonly router=inject(Router); private readonly destroyRef=inject(DestroyRef);
  readonly ngayToiThieu=inject(TodayService).homNayDate(); readonly dangTai=signal(true); readonly dangLuu=signal(false); readonly dangXemTruoc=signal(false); readonly daGui=signal(false); readonly loi=signal<ApiError|string|null>(null); readonly loiXemTruoc=signal<ApiError|string|null>(null); readonly xemTruoc=signal<XemTruocChuyenResponse|null>(null); readonly tuyen=signal<TuyenDuong[]>([]); readonly xe=signal<Xe[]>([]); readonly taiXe=signal<TaiXe[]>([]);
  readonly form=this.fb.group({maTuyen:['',Validators.required],maXe:['',Validators.required],gioKhoiHanh:this.fb.control<Date|null>(null,Validators.required),maLai:['',Validators.required],maPhu:['',Validators.required]},{validators:khacTaiXeValidator('maLai','maPhu')});
  constructor(){
    forkJoin({tuyen:this.catalog.tuyen(),xe:this.doiXe.xe(),taiXe:this.catalog.taiXeDangLam()}).pipe(finalize(()=>this.dangTai.set(false)),takeUntilDestroyed()).subscribe({next:d=>{this.tuyen.set(d.tuyen);this.xe.set(d.xe);this.taiXe.set(d.taiXe);this.form.patchValue({maTuyen:d.tuyen[0]?.maTuyen??'',maXe:d.xe[0]?.maXe??''});},error:(e:ApiError)=>this.loi.set(e)});
    this.form.valueChanges.pipe(startWith(this.form.getRawValue()),debounceTime(350),map(v=>({maTuyen:v.maTuyen,gio:v.gioKhoiHanh?.getTime(),maLai:v.maLai,maPhu:v.maPhu})),distinctUntilChanged((a,b)=>JSON.stringify(a)===JSON.stringify(b)),switchMap(v=>{this.xemTruoc.set(null);this.loiXemTruoc.set(null);if(!v.maTuyen||!v.gio||!v.maLai||!v.maPhu||v.maLai===v.maPhu)return of(null);this.dangXemTruoc.set(true);return this.api.xemTruoc({maTuyen:v.maTuyen,gioKhoiHanh:toLocalDateTime(new Date(v.gio)),maTXLai:v.maLai,maTXPhu:v.maPhu}).pipe(catchError((e:ApiError)=>{this.loiXemTruoc.set(e);return of(null);}),finalize(()=>this.dangXemTruoc.set(false)));}),takeUntilDestroyed(this.destroyRef)).subscribe(x=>this.xemTruoc.set(x));
  }
  tuyenLabel(t:TuyenDuong){return `${t.maTuyen} · ${t.diemDau} – ${t.diemCuoi} · ${t.doDaiKm} km`;} xeLabel(x:Xe){return `${x.bienSo} · ${x.tenLoaiXe} · ${new TrangThaiPipe().transform(x.trangThai,'xe')}`;} taiXeLabel(x:TaiXe){return `${x.maTX} · ${x.hoDem} ${x.ten} · hạng ${x.hangGPLX}`;}
  loiTruong(ten:keyof typeof this.form.controls,nhan:string){const c=this.form.controls[ten];return c.invalid&&(c.touched||this.daGui())?`Vui lòng chọn ${nhan}.`:null;}
  tao(){if(this.dangLuu())return;this.daGui.set(true);this.loi.set(null);if(this.form.invalid||!this.xemTruoc()){this.form.markAllAsTouched();return;}const v=this.form.getRawValue();if(v.gioKhoiHanh!.getTime()<this.ngayToiThieu.getTime()){this.loi.set('Giờ khởi hành không được ở quá khứ.');return;}this.dangLuu.set(true);this.api.taoChuyenVaPhanCong({maTuyen:v.maTuyen,maXe:v.maXe,gioKhoiHanh:toLocalDateTime(v.gioKhoiHanh!),gioDen:this.xemTruoc()!.gioDenGoiY,maLai:v.maLai,maPhu:v.maPhu}).pipe(finalize(()=>this.dangLuu.set(false)),takeUntilDestroyed(this.destroyRef)).subscribe({next:ma=>{this.notify.thanhCong(`Đã tạo chuyến ${ma}. Sang trang Bán vé để bán vé cho chuyến này.`);this.form.reset({maTuyen:this.tuyen()[0]?.maTuyen??'',maXe:this.xe()[0]?.maXe??'',gioKhoiHanh:null,maLai:'',maPhu:''});this.daGui.set(false);},error:(e:ApiError)=>this.loi.set(e)});}
  sangBanVe(){const site=this.router.url.split('/')[1]||'hn';void this.router.navigate(['/',site,'ban-ve','ban']);}
}
