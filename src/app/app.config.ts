import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar';
import { provideTranslateService, MissingTranslationHandler } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { FallbackMissingTranslationHandler } from './core/i18n/fallback-missing-translation.handler';
import { I18nFallbackService } from './core/i18n/i18n-fallback.service';
import { provideAnimations } from '@angular/platform-browser/animations';
import { LOCALE_ID } from '@angular/core';

registerLocaleData(localeAr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: './i18n/',
        suffix: '.json',
      }),
      fallbackLang: 'ar',
    }),
    {
      provide: MissingTranslationHandler,
      useFactory: (fallback: I18nFallbackService) => new FallbackMissingTranslationHandler(fallback),
      deps: [I18nFallbackService],
    },
    { provide: LOCALE_ID, useValue: 'ar' }
  ],
};
