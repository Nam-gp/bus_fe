import { EnvironmentProviders, Provider } from '@angular/core';

/** PrimeNG bản này dùng animation CSS, không cần @angular/animations (tự sinh bởi init-fe.mjs) */
export const animationProviders: (Provider | EnvironmentProviders)[] = [];
