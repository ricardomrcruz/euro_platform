import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { AppLang, SUPPORTED_LANGS, setStoredLang } from '../../i18n/lang-storage';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ButtonModule, IconField, InputIcon, InputText, TranslatePipe],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  private readonly translate = inject(TranslateService);

  readonly langs = SUPPORTED_LANGS;
  readonly currentLang = this.translate.currentLang;

  switchLang(lang: AppLang): void {
    this.translate.use(lang).subscribe();
    setStoredLang(lang);
  }
}
