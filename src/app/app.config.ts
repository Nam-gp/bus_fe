import { appProviders } from './core/providers';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    ...appProviders,
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
