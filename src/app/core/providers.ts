import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeVi from '@angular/common/locales/vi';
import { EnvironmentProviders, LOCALE_ID, Provider } from '@angular/core';
import { TitleStrategy } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { animationProviders } from './animations.providers';
import { PRIMENG_VI } from './config/primeng-vi';
import { branchInterceptor } from './interceptors/branch.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { loadingInterceptor } from './interceptors/loading.interceptor';
import { AppTitleStrategy } from './services/app-title.strategy';

registerLocaleData(localeVi);

/** Provider dùng chung, được gắn vào app.config.ts */
export const appProviders: (Provider | EnvironmentProviders)[] = [
  ...animationProviders,
  // Thứ tự: chi nhánh → loading → lỗi (lỗi đứng sát BE để chuẩn hóa trước)
  provideHttpClient(withInterceptors([branchInterceptor, loadingInterceptor, errorInterceptor])),
  { provide: LOCALE_ID, useValue: 'vi' },
  providePrimeNG({
    // darkModeSelector trỏ tới class không dùng → luôn giao diện sáng, không theo chế độ tối của máy
    theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } },
    translation: PRIMENG_VI,
  }),
  MessageService, // cho p-toast (NotifyService)
  ConfirmationService, // cho p-confirmdialog (ConfirmService)
  { provide: TitleStrategy, useClass: AppTitleStrategy },
];
