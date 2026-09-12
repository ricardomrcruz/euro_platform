import { ApplicationConfig, provideZoneChangeDetection, inject } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import { provideTranslateService, provideTranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { EuroCarsPreset } from '../theme/eurocars-preset';
import { getStoredLang, DEFAULT_LANG } from './core/i18n/lang-storage';
import { authInterceptor } from './core/auth/auth.interceptor';
import { apiBaseUrlInterceptor } from './core/api-base-url.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
    ),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor, apiBaseUrlInterceptor])),
    MessageService,
    providePrimeNG({
      theme: {
        preset: EuroCarsPreset,
        options: {
          darkModeSelector: '.app-dark',
        },
      },
    }),
    provideTranslateService({
      // French by default per the site's audience, English always reachable via the
      // navbar toggle -- whichever the visitor last picked persists in localStorage.
      lang: getStoredLang(),
      fallbackLang: DEFAULT_LANG,
      loader: provideTranslateLoader(() =>
        new TranslateHttpLoader(inject(HttpClient), '/i18n/', '.json'),
      ),
    }),
  ]
};
